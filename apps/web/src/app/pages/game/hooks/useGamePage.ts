import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";
import { useRoomState } from "@/gameCanvas/hooks/useRoomState";

type PlayerInfo = {
  playerId: string;
  userName: string;
  activeRoom: {
    roomId: string;
    roomName: string;
  } | null;
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
  const room = useRoomState();
  const players = room?.players ?? [];
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
      const handlePlayerInfo = (data: PlayerInfo) => {
        setPlayerInfo(data);
        console.log(
          `🕹️ Player info received:\n` +
            Object.entries(data)
              .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
              .join("\n"),
        );

        // The ideal of these check is thatthey should be in the backend
        // keeping them here to quickly solve these edge cases for now and keep simple
        if (!data.activeRoom?.roomName) {
          // if room is not found within created rooms to join
          console.error(
            `${data.activeRoom?.roomName} does not exist or player not in a room, redirecting ${playerInfo?.userName} to profile`,
          );
          return;
        }

        /* 
        This check was added because if the pkayer has an active room, the player will
        be be redirected to it even if writing a different url.
        */
        if (data.activeRoom?.roomName !== roomName) {
          console.warn(
            `[GamePage] active_room mismatch! url: ${roomName} payload: ${data.activeRoom?.roomName}`,
          );
          navigate("/profile", { replace: true });
        }
      };

      socket.on("player_info_response", handlePlayerInfo);
      socket.on("error", handleError);
      socket.on("game_start_success", handleGameStartSuccess);
      socket.on("game_start_failed", handleGameStartFailed);

      socket.emit("join_room", { roomName });
      socket.emit("player_info_request");

      return () => {
        socket.emit("user_dropped");
        socket.off("player_info_response", handlePlayerInfo);
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
    [
      /* navigate, roomName */
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
