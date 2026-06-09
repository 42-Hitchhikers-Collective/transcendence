import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";

type PlayerInfo = {
  playerId: string;
  userName: string;
  activeRoom: {
    roomId: string;
    roomName: string;
    gameState: "waiting" | "playing" | "finished";
  } | null;
};

type GameData = {
  roomId: string;
  players: PlayerInfo[];
  gameState: "waiting" | "playing" | "finished";
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

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
  // hndles browser level unload (close, refresh, navigate away) to trigger the drop timer in the backend via "user_dropped" socket event
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("user_dropped");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(
    () => {

      const handleRoomData = (roomData: any) => {
        console.log(
          `GAME PAGE - ROOM DATA RECEIVED:\n` +
            Object.entries(roomData)
              .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
              .join("\n"),
        );
        setPlayers(roomData.players.map((p: any) => p.userName));
        // console.log(
        //   `Players in room: ${roomData.players.map((p: any) => p.userName).join(", ")}`,
        // );
      };

      const handlePlayerData = (playerData: PlayerInfo) => {
        setPlayerInfo(playerData);
        console.log(
          `GAME PAGE - PLAYER INFO RECEIVED:\n` +
            Object.entries(playerData)
              .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
              .join("\n"),
        );
        // The ideal of these check is thatthey should be in the backend
        // keeping them here to quickly solve these edge cases for now and keep simple
        if (!playerData.activeRoom?.roomName) {
          // if room is not found within created rooms to join
          console.error(
            `${playerData.activeRoom?.roomName} does not exist or player not in a room, redirecting ${playerInfo?.userName} to profile`,
          );
          return;
        }

        /* 
        This check was added because if the pkayer has an active room, the player will
        be be redirected to it even if writing a different url.
        */
        if (playerData.activeRoom?.roomName !== roomName) {
          console.error(
            `[GamePage] active_room mismatch! url: ${roomName} payload: ${playerData.activeRoom?.roomName}`,
          );
          navigate("/profile", { replace: true });
        }

        // why does the setGameStarted change still shows transition from statgame to gamecanvas and not
        // just directly render the game canvas without the start game screen in between when the player refreshes the page while in a game?
        if (playerData.activeRoom.gameState === "playing") {
          setGameStarted(true);
          console.log(`GameStarted ${gameStarted}`);
        }
      };

      socket.on("player_info_response", handlePlayerData);
      socket.on("room_state", handleRoomData);
      socket.on("error", handleError);
      socket.on("game_start_success", handleGameStartSuccess);
      socket.on("game_start_failed", handleGameStartFailed);

      socket.emit("join_room", { roomName });
      socket.emit("player_info_request");

      return () => {
        socket.emit("user_dropped");
        socket.off("player_info_response", handlePlayerData);
        socket.off("error", handleError);
        socket.off("game_start_success", handleGameStartSuccess);
        socket.off("game_start_failed", handleGameStartFailed);
        console.log(
          `💦 ${playerInfo} dropped from room ${playerInfo?.activeRoom?.roomName}. \n Does drop counter started in the se`,
        );
        console.log("user_dropped emitted from frontend", {
          playerInfo,
          roomName,
          activeRoom: playerInfo?.activeRoom?.roomName,
        });
      };
    },
    [ /* navigate, roomName */
    ],
  );

  // prevents a non-existent room from being loded/joined
  const handleError = (payload: GameStartFailedPayload) => {
    if (payload?.message === "Room not found") {
      navigate("/profile", { replace: true });
    }
  };

  const handleGameStartSuccess = ({ roomId }: GameStartSuccessPayload) => {
    console.log(`[GamePage] game_start_success received for room ${roomId}`);
    setGameStarted(true);
  };

  const handleGameStartFailed = ({ message }: GameStartFailedPayload) => {
    console.log(`[GamePage] game_start_failed received: ${message}`);
    setCanvasError(message ?? "Unable to start the game.");
  };

  const startGame = () => {
    socket.emit("start_game");
  };

  return {
    canvasError,
    gameStarted,
    playerInfo,
    players,
    startGame,
  };
}
