import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";

export default function LonelyPlayerOverlay({ roomId }: { roomId: string }) {
  const navigate = useNavigate();

  const handleBack = () => {
    socket.emit("leave_room");
    navigate("/profile", { replace: true });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl border border-slate-200/20 bg-neutral-900 p-10 text-center shadow-2xl max-w-sm mx-4">
        <p className="text-2xl font-semibold text-white">Where's everybody?!!</p>
        <p className="mt-3 text-sm text-slate-400">
          All other players abandoned the game, either this was intentional or due to not being able to reconnect in time, the game cannot continue!
          You can always start another game or join a new one from your profile page.
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
