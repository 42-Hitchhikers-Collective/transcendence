import { useCallback } from "react";
import { socket } from "@/socket/Socket";

type StartGameButtonProps = {
  gameStarted: boolean;
  canvasError?: string | null;
  gameOver?: {
    reason: "finished" | "lonely";
    winnerId?: string;
  } | null;
};

export default function StartGameButton({
  gameStarted,
  canvasError,
  gameOver,
}: StartGameButtonProps) {
  const startGame = useCallback(() => {
    socket.emit("start_game");
    socket.emit("canvas_ready");
    console.log(`[GamePage] start_game emitted`);
  }, []);

  if (!gameStarted && gameOver == null) 
  return (
    <>
      <button
        onClick={() => {
          console.log(`[GamePage] Start Game button clicked`);
          startGame();
        }}
        className="rounded-lg bg-emerald-500 px-3 md:px-5 py-2 md:py-3 text-sm md:text-base font-semibold text-white gameStarted:bg-gray-400 mt-3 md:mt-4 truncate max-w-full"
      >
        Start Game
      </button>
      {canvasError && !gameStarted && (
        <div className="rounded text-red-500 mt-2 text-xs md:text-sm wrap-break-word">{canvasError}</div>
      )}
    </>
  );

  // Keeps the card height stable when game has started and button is hidden
  return (
    <div className="mt-3 md:mt-4" style={{ height: "2.5rem" }} aria-hidden
    />
  );
}
