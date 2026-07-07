import { useState } from "react";

export default function RoomCode({
  roomName,
  gameStarted,
  gameOver,
}: {
  roomName: string;
  gameStarted: boolean;
  gameOver?: {
    reason: "finished" | "lonely";
    winnerId?: string;
  } | null;
}) {
  const [copied, setCopied] = useState(false);

  const copyRoomName = async () => {
    await navigator.clipboard.writeText(roomName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!gameStarted && gameOver == null) 
    return (
      <div className="rounded-xl bg-white px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vw,0.75rem)] text-center min-w-0 overflow-hidden">
        <p className="text-[clamp(0.6rem,0.9vw,0.75rem)] font-semibold uppercase tracking-[0.2em] truncate">
          This room's name:
        </p>
        <button
          onClick={copyRoomName}
          className={`mt-2 w-full rounded-lg border px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.35rem,0.6vw,0.5rem)] text-center text-[clamp(1rem,2vw,1.25rem)] font-bold tracking-wider truncate
          ${copied ? "text-[clamp(0.7rem,1vw,0.875rem)] border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-50 transition" : "border-slate-400 bg-slate-300  text-slate-800 hover:bg-rose-50 transition"}`}
        >
          {copied ? "Copied!" : roomName}
        </button>
        {copied && <p className="mt-1 text-[clamp(0.6rem,0.9vw,0.75rem)] text-emerald-500">Copied!</p>}
        <p className="mt-1 text-[clamp(0.6rem,0.9vw,0.75rem)] text-slate-500 text-center wrap-break-word">
          Click the name above to copy and share with your friends!
        </p>
      </div>
    );
}
