import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";
import { useAuthContext } from "@/app/auth/AuthContext";

type PlayerData = {
  playerId: string;
  userName: string;
  avatarUrl?: string;
  activeRoom: {
    roomId: string;
    roomName: string;
    gameState: "waiting" | "playing" | "finished";
  } | null;
};

export type PlayerListItem = {
  userName: string;
  avatarUrl?: string;
  dropped: boolean;
  isPlayerTurn: boolean;
};

type RoomData = {
  roomId: string;
  roomName: string;
  roomState: string;
  players: PlayerListItem[];
  playerTurnId: string;
  playerTurnUserName: string;
};

type GameStartFailedPayload = {
  message?: string;
};

type GameStartSuccessPayload = {
  roomId: string;
};

export function useGamePage(roomName: string) {
  const { user } = useAuthContext();
  const [playerInfo, setPlayerData] = useState<PlayerData | null>(null);
  const navigate = useNavigate();
  const [playerList, setPlayerList] = useState<PlayerListItem[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<{ reason: "finished" | "lonely"; winnerId?: string } | null>(null);
  // const [socketReady, setSocketReady] = useState(socket.connected);

  // Keeps refs to avoid stale closures in socket callbacks ──
  const playerInfoRef = useRef(playerInfo);
  playerInfoRef.current = playerInfo;

  // Stores the latest full room state so Effect 3 can replay it on the EventBus
  const RoomDataRef = useRef<RoomData | null>(null);
  const roomNameRef = useRef(roomName);
  roomNameRef.current = roomName;

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // ──────────────────────────────────────────
  // Effect 1: notifies backend when browser tab is closed/refreshed/navigated away to trigger drop timer
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
  // ──────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("user_dropped");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  /* 
  MAIN USE EFFECT:
  this mounts the gamepage only when we have user and socketId
  It runs socket requests for player info and room info and we need to make sure we have the right user data and socketId before we do that
  otherwise we will get null data and the gamepage will not mount properly
  */
  useEffect(() => {
    // if (!user || !socket.connected) return; // waits for user and socket connection before doing anything
    if (!user) return; // waits for user and socket connection before doing anything
    console.log(
      `🔌 [GamePage] User info received "${user.username}", new socket id: ${socket.connected}`,
    );
    socket.on("phaser_ready", () => {
      console.log(
        `[GamePage] Phaser canvas is ready, requesting room state...`,
      );
    });

    // TODO:
    // socket on game_finished  handleEndGame to trigger end game screen with winner info and to prompt player to leave
    // the room and navigate back to profile or home page or something like that

    // Listen to socket events
    socket.on("player_info_response", handlePlayerData);
    socket.on("room_info_response", handleRoomDataResponse);
    socket.on("error", handleError);
    socket.on("game_start_success", handleGameStartSuccess);
    socket.on("game_start_error", handleGameStartFailed);

    // Game-over events
    socket.on("game_finished", ({ winnerId }: { winnerId?: string }) => setGameOver({ reason: "finished", winnerId }));
    socket.on("lonely_player", () => {
      setGameOver({ reason: "lonely" });
    });

    // emit socket events
    socket.emit("join_room", { roomName: roomNameRef.current });
    socket.emit("player_info_request");
    socket.emit("room_info_request");

    return () => {
      socket.emit("user_dropped"); // needed to handle dropped user from non browser related stuff like just normal component unmount or refresh
      socket.off("player_info_response", handlePlayerData);
      socket.off("error", handleError);
      socket.off("room_info_response", handleRoomDataResponse);
      socket.off("game_start_success", handleGameStartSuccess);
      socket.off("game_start_error", handleGameStartFailed);
      socket.off("game_finished");
      socket.off("lonely_player");

      console.log(
        `💦 ${playerInfoRef.current?.userName} dropped from room ${roomNameRef.current}.`,
      );
    };
  }, [user]); // ⬅️ runs when user becomes available

  useEffect(() => {
    if (playerList.length > 0) {
      console.log(
        `👤👤👤👤 PLAYER LIST UPDATED: ${playerList.map((p) => p.userName)}`,
      );
      console.log(`🚻 ROOM STATE UPDATED: ${RoomDataRef.current?.roomState}`);
    }
    if (RoomDataRef.current?.roomState === "playing") {
      // socket.emit("canvas_ready"); // trigger game canvas to refresh with the latest room state when game starts (e.g. in case player refreshes page during game or joins late)
      setGameStarted(true);
    }

    // LONELY PLAYER EDGECASE - it's mostly the frontend that should handle this check but it was added in the backend and doing so does not handle edgecases where player does not follow standard navigation flow
    if (
      RoomDataRef.current?.roomState === "playing" &&
      playerList.length === 1
    ) {
      setGameOver({ reason: "lonely" });
    }

    setTimeout(() => {
      socket.emit("canvas_ready");
      console.warn(`🎨 Refreshing canvas: ${gameStarted}`);
    }, 100);
  }, [playerList, RoomDataRef.current?.roomState]); // ⬅️ runs whenever players or room state changes to keep the game canvas in sync with the latest room state (e.g. new player joins, game starts, etc)

  useEffect(() => {
    console.log(`Game Started state changed: ${gameStarted}`);
  }, [gameStarted]); // ⬅️ can be used for any side effects that need to run when game starts, currently not used but can be useful for future features like showing a "Game Started" banner or something

  //#region -------------- SOCKET HANDLERS -----------------

  const handleError = (payload: GameStartFailedPayload) => {
    if (payload?.message === "Room not found") {
      // navigateRef.current("/profile", { replace: true });
      setRoomError(
        "The room you are trying to join does not exist. Please join a different room or create your own.",
      );
      // or currentNavigate("/profile", { replace: true });
    }
    if (payload?.message === "Game already begun") {
      // navigateRef.current("/profile", { replace: true });
      setRoomError(
        "The game in this room has already started. Please join a different room or create your own.",
      );
    }
    if (payload?.message === "Room is full") {
      // navigateRef.current("/profile", { replace: true });
      setRoomError(
        "The room you are trying to join is full. Please join a different room or create your own.",
      );
    }
    // Shoots when a player tries to join a non existing room or a room (CAREFUL IF RACE BETWEEN CREATE / JOIN)
    if (payload?.message === "Requested room not found") {
      // navigateRef.current("/profile", { replace: true });
      setRoomError("The room you are trying to join does not exist!");
    }
    // Covers a case when player is active in one room and tries to join another
    if (payload?.message === "Player already in a different room") {
      // navigateRef.current("/profile", { replace: true });
      setRoomError(
        "You are already member of another room. \nPlease leave that room before joining another.",
      );
    }
  };

  const handlePlayerData = (playerData: PlayerData) => {
    setPlayerData(playerData);

    console.log(
      `🎮 PLAYER DATA RECEIVED FROM SOCKET \n` +
        Object.entries(playerData)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join("\n"),
    );
  };

  const handleRoomDataResponse = (roomData: RoomData) => {
    RoomDataRef.current = roomData; // current stores the latest full room state for replaying on EventBus
    console.log(
      `🎮 ROOM DATA RECEIVED FROM SOCKET\n` +
        Object.entries(roomData)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join("\n"),
    );
    if (roomData) {
      const playersData = roomData.players.map((p) => ({
        ...p,
        isPlayerTurn: p.userName === roomData.playerTurnUserName, // ← compute this
      }));
      setPlayerList(playersData); // ← use the new list
    }
  };

  const handleGameStartSuccess = ({ roomId }: GameStartSuccessPayload) => {
    console.log(`[GamePage] game_start_success received for room ${roomId}`);
    setGameStarted(true);
  };

  const handleGameStartFailed = ({ message }: GameStartFailedPayload) => {
    console.log(`[GamePage] game_start_error received: ${message}`);
    setCanvasError(message ?? "Unable to start the game.");
  };

  //#endregion

  return {
    canvasError,
    roomError,
    gameStarted,
    gameOver,
    playerInfo,
    playerList,
    roomId: RoomDataRef.current?.roomId,
  };
}
