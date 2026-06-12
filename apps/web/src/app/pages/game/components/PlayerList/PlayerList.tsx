import { useEffect } from "react";

type PlayerListProps = {
  players: string[];
  currentUserName?: string;
};



export default function PlayerList({ players, currentUserName }: PlayerListProps) {
 
 
    return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
        Players ({players.length})
      </h2>
      <div className="mt-4 space-y-3">
        {players.map((player, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
          >
            <div>
              <p className="font-semibold text-slate-100">
                {player} {player === currentUserName && "(you)"}
              </p>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <p className="text-sm text-slate-400">
            Waiting for the room state to load...
          </p>
        )}
      </div>
    </div>
  );
}
