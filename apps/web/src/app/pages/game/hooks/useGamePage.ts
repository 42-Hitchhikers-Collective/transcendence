import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";
import {eventBus} from "@/utils/EventBus";




type PlayerInfo = {
  playerId: string;
  userName: string;
  activeRoom: {
    roomId: string;
    roomName: string;
    gameState: "waiting" | "playing" | "finished";
  } | null;
};

type RoomInfo = {
  roomId: string;
  roomName: string;
  roomState: string;
  players: { userName: string; dropped: boolean }[];
};

type GameStartFailedPayload = {
  message?: string;
};

type GameStartSuccessPayload = {
  roomId: string;
};

export function useGamePage(roomName: string) {
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const navigate = useNavigate();
  const [players, setPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  // Keeps refs to avoid stale closures in socket callbacks ──
  const playerInfoRef = useRef(playerInfo);
  playerInfoRef.current = playerInfo;

  const roomNameRef = useRef(roomName);
  roomNameRef.current = roomName;

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Stores the latest full room state so Effect 3 can replay it on the EventBus
  const roomStateRef = useRef<RoomInfo | null>(null);

  // ──────────────────────────────────────────
  // Effect 1: notifies backend when browser tab is closed/refreshed/navigated away to trigger drop timer
  // (runs once on mount, cleans up on unmount)
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

  // ──────────────────────────────────────────
  // Effect 2: Socket connection lifecycle
  // joins room, fetches player info, listens to events
  // (runs once on mount; cleanup leaves the room)
  // ──────────────────────────────────────────
  useEffect(() => {
    const handleRoomInfoResponse = (roomData: RoomInfo) => {
      roomStateRef.current = roomData;
      console.log(
        `🎮GAME PAGE - ROOM DATA RECEIVED:\n` +
          Object.entries(roomData)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join("\n"),
      );
      if(roomData)
        setPlayers(roomData.players.map((p: any) => p.userName));
    };

    const handlePlayerData = (playerData: PlayerInfo) => {
      setPlayerInfo(playerData);

      
      console.log(
        `🎮GAME PAGE - PLAYER INFO RECEIVED:\n` +
          Object.entries(playerData)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join("\n"),
      );

      // TO CHECK -> Reads latest values from refs to avoid stale closures
      const currentRoomName = roomNameRef.current;
      const currentNavigate = navigateRef.current;
      const currentPlayerInfo = playerInfoRef.current;

      // why does the setGameStarted change still shows transition from statgame to gamecanvas and not
      // just directly render the game canvas without the start game screen in between when the player refreshes the page while in a game?
      if (playerData.activeRoom.gameState === "playing") {
        setGameStarted(true);
        // socket.emit("canvas_ready");
      }
      
      // DIRTY CLEANUP BUT IT WORKS
      setTimeout(() => {
        socket.emit("canvas_ready");
        console.warn(`Calling canvas Ready. Game Started: ${gameStarted}`);
        console.log("this is the first message");
      }, 2000);

    };

    const handleError = (payload: GameStartFailedPayload) => {

      /*
      Unsure why i should use this instead
      currentNavigate("/profile", { replace: true });       
       */

      if (payload?.message === "Room not found") {
        navigateRef.current("/profile", { replace: true });
      }
      // TODO: make sure this error pops only for users that are not in a room
      if (payload?.message === "Game already begun") {
        navigateRef.current("/profile", { replace: true });
      }
      if (payload?.message === "Room is full") {
        navigateRef.current("/profile", { replace: true });
      }

      // Shoots when a player tries to join a non existing room or a room
      // CAREFUL WITH RACEING EVENTS (if player creates 
      // the room and then joins, but join is quicker and we get error)
      if (payload?.message === "Requested room not found") {
        navigateRef.current("/profile", { replace: true });
      }

      // Covers a case when player is active in one room and tries to join another
      if (payload?.message === "Player already in a different room") {
        navigateRef.current("/profile", { replace: true });
      }

      // set a different view of the page or add popup when these errors appear
      // and redirect the user to the profile via button
      // also make sure its ok to keep the url the same if not valid

    };

    const handleGameStartSuccess = ({ roomId }: GameStartSuccessPayload) => {
      console.log(`[GamePage] game_start_success received for room ${roomId}`);
      setGameStarted(true);
    };

    const handleGameStartFailed = ({ message }: GameStartFailedPayload) => {
      console.log(`[GamePage] game_start_failed received: ${message}`);
      setCanvasError(message ?? "Unable to start the game.");
    };

    socket.on("phaser_ready", () => {
      console.log(`[GamePage] Phaser canvas is ready, requesting room state...`);
        console.warn(`------------- Game Started: ${gameStarted}`);

    });
    socket.on("player_info_response", handlePlayerData);
    socket.on("room_info_response", handleRoomInfoResponse);
    socket.on("error", handleError);
    socket.on("game_start_success", handleGameStartSuccess);
    socket.on("game_start_failed", handleGameStartFailed);

    socket.emit("join_room", { roomName: roomNameRef.current });
    socket.emit("player_info_request");
    socket.emit("room_info_request");

    return () => {
      socket.emit("user_dropped"); // needed to handle dropped user from non browser related stuff like just normal component unmount or refresh
      socket.off("player_info_response", handlePlayerData);
      socket.off("error", handleError);
      socket.off("room_info_response", handleRoomInfoResponse);
      socket.off("game_start_success", handleGameStartSuccess);
      socket.off("game_start_failed", handleGameStartFailed);

      console.log(
        `💦 ${playerInfoRef.current?.userName} dropped from room ${roomNameRef.current}.`,
      );
    };
  }, []);

  // ──────────────────────────────────────────
  // Effect 3: React to state changes & log
  // (runs whenever playerInfo/gameStarted/players change)
  // ──────────────────────────────────────────
  useEffect(() => {


    console.debug(`[GamePage] State updated:`, {
      playerInfo,
      gameStarted,
      players,
    });
  }, [players]);

  // ──────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────
  const startGame = useCallback(() => {
    socket.emit("start_game");
    console.log(`[GamePage] start_game emitted`);
  }, []);

  return {
    canvasError,
    gameStarted,
    playerInfo,
    players,
    startGame,
  };
}
