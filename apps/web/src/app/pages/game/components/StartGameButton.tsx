import { useCallback } from "react";
import { socket } from "@/socket/Socket";

type StartGameButtonProps = {
  gameStarted: boolean;
  canvasError?: string | null;
};

export default function StartGameButton({
  gameStarted,
  canvasError,
}: StartGameButtonProps) {
  const startGame = useCallback(() => {
    socket.emit("start_game");
    console.log(`[GamePage] start_game emitted`);
  }, []);

  if (!gameStarted) 
  return (
    <>
      <button
        onClick={() => {
          console.log(`[GamePage] Start Game button clicked`);
          startGame();
        }}
        className={` rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white gameStarted:bg-gray-400 mt-3`}
      >
        Start Game
      </button>
      {canvasError && !gameStarted && (
        <div className="rounded text-red-500  mt-2 text-xs ">{canvasError}</div>
      )}
    </>
  );
}
