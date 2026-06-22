import { useState } from "react";

export default function RoomCode({
  roomName,
  gameStarted,
}: {
  roomName: string;
  gameStarted: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyRoomName = async () => {
    await navigator.clipboard.writeText(roomName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!gameStarted)
    return (
      <div className="rounded-xl bg-white px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
          This room's name:
        </p>
        <button
          onClick={copyRoomName}
          className={`mt-2 w-full rounded-lg border px-3 py-2 text-center text-lg font-bold tracking-wider 
          ${copied ? "text-sm border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-50 transition" : "border-slate-400 bg-slate-300  text-slate-800 hover:bg-rose-50 transition"}`}
        >
          {copied ? "Copied!" : roomName}
        </button>
        {copied && <p className="mt-1 text-xs text-emerald-500">Copied!</p>}
        <p className="mt-1 text-xs text-slate-500 text-center">
          Click the name above to copy and share with your friends!
        </p>
      </div>
    );
}
