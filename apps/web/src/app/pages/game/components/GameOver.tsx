import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";

type Props = {
  isWinner: boolean;
};

export default function GameOver({ isWinner }: Props) {
  const navigate = useNavigate();

  const handleBack = () => {
    socket.emit("leave_room");
    navigate("/profile", { replace: true });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl border border-slate-200/20 bg-neutral-900 p-10 text-center shadow-2xl max-w-sm mx-4">
        <p className="text-2xl font-semibold text-white">
          {isWinner ? "You Won! 🎉" : "You lost!😞"}
        </p>
        <p className="mt-3 text-sm text-slate-400">
          {isWinner
            ? "Congratulations! Your victory has been saved to your history."
            : "Better luck next time! Game results saved to your history."}
        </p>
        <button
          onClick={handleBack}
          className="mt-8 inline-block rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
