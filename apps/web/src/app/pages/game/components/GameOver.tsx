import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";

type Props = {
  isWinner?: boolean; // undefined = unknown (page refresh during finished game)
};

export default function GameOver({ isWinner }: Props) {
  const navigate = useNavigate();

  const handleBack = () => {
    socket.emit("leave_room");
    navigate("/", { replace: true });
  };

  const isWinnerKnown = isWinner !== undefined;

  return (
    <div className="h-full w-full flex items-center justify-center bg-black/60 rounded-2xl">
      <div className="h-full w-full flex flex-col items-center justify-center rounded-2xl border border-slate-200/20 bg-neutral-900 p-[clamp(1.5rem,4vw,3rem)] text-center shadow-2xl px-[clamp(1rem,3vw,2rem)]">
        <p className="text-[clamp(1.25rem,3vw,2rem)] font-semibold text-white">
          {isWinnerKnown
            ? isWinner
              ? "You Won! 🎉"
              : "You lost!😞"
            : "Game Over"}
        </p>
        <p className="mt-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(0.7rem,1vw,0.875rem)] text-slate-400">
          {isWinnerKnown
            ? isWinner
              ? "Congratulations! Your victory has been saved to your history."
              : "Better luck next time! Game results saved to your history."
            : "This game has ended. Results are saved to your history."}
        </p>
        <button
          onClick={handleBack}
          className="mt-[clamp(1.25rem,2.5vw,2rem)] inline-block rounded-lg bg-emerald-500 px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,0.8vw,0.75rem)] text-[clamp(0.7rem,1vw,0.875rem)] font-semibold text-white hover:bg-emerald-400 transition"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
