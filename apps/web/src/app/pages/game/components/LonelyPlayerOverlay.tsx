import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";

export default function LonelyPlayerOverlay({ roomId }: { roomId: string }) {
  const navigate = useNavigate();

  const handleBack = () => {
    socket.emit("leave_room");
    navigate("/", { replace: true });
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-black/60 rounded-2xl">
      <div className="rounded-2xl border border-slate-200/20 bg-neutral-900 p-[clamp(1.5rem,4vw,3rem)] text-center shadow-2xl max-w-sm mx-[clamp(0.75rem,2vw,1rem)]">
        <p className="text-[clamp(1.25rem,3vw,2rem)] font-semibold text-white">Where's everybody?!!</p>
        <p className="mt-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(0.7rem,1vw,0.875rem)] text-slate-400">
          All other players abandoned the game, either this was intentional or due to not being able to reconnect in time, the game cannot continue!
          You can always start another game or join a new one from your profile page.
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
