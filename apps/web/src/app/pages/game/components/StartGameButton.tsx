import { useCallback, useEffect } from "react";
import { socket } from "@/socket/Socket";

type StartGameButtonProps = {
  disabled: boolean;
  canvasError?: string | null;
};

export default function StartGameButton({
  disabled,
  canvasError,
}: StartGameButtonProps) {
  const startGame = useCallback(() => {
    socket.emit("start_game");
    console.log(`[GamePage] start_game emitted`);
  }, []);



  return (
    <>
      <button
        onClick={() => {
          console.log(`[GamePage] Start Game button clicked`);
          startGame();
     
        }}
        disabled={disabled}
        className={` rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white disabled:bg-gray-400`}
      >
        {disabled ? "Game in Progress" : "Start Game"}
      </button>
      {canvasError && !disabled && (
        <div className="rounded text-red-500  text-sm">{canvasError}</div>
      )}
    </>
  );
}
