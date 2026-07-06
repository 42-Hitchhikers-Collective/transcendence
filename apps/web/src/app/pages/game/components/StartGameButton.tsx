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
    socket.emit("canvas_ready");
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
        className={` rounded-lg bg-emerald-500 px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.4rem,0.8vw,0.6rem)] text-[clamp(0.75rem,1vw,0.875rem)] font-semibold text-white gameStarted:bg-gray-400 mt-[clamp(0.5rem,1vw,0.75rem)] truncate max-w-full`}
      >
        Start Game
      </button>
      {canvasError && !gameStarted && (
        <div className="rounded text-red-500  mt-[clamp(0.3rem,0.6vw,0.5rem)] text-[clamp(0.6rem,0.9vw,0.75rem)] wrap-break-word">{canvasError}</div>
      )}
    </>
  );

  // ── Placeholder: keeps the card height stable when game has started ──
  return (
    <div
      className="mt-[clamp(0.5rem,1vw,0.75rem)]"
      style={{ height: "clamp(1.4rem, 2vw, 2rem)" }}
      aria-hidden
    />
  );
}
