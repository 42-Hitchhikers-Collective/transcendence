import { useEffect } from "react";

type PlayerListProps = {
  players: string[];
  currentUserName?: string;
  playerAvatars?: Record<string, string>;
};

function PlayerAvatar({ name, src }: { name: string; src?: string }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    "bg-rose-400", "bg-emerald-400", "bg-amber-400", "bg-sky-400",
    "bg-violet-400", "bg-pink-400", "bg-teal-400", "bg-orange-400",
  ];
  const color = colors[name.length % colors.length];

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-base font-bold text-white ${!src ? color : ""}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            el.parentElement!.classList.add(color);
            el.parentElement!.textContent = initial;
          }}
        />
      ) : (
        initial
      )}
    </div>
  );
}

export default function PlayerList({ players, currentUserName, playerAvatars = {} }: PlayerListProps) {

  // reloads component when list of players updates
    useEffect(() => {
    if (players.length > 0) {
      console.log(`👤👤👤👤 PLAYER LIST UPDATED: ${players}`);
    }

  }, [players]);

    return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">
        Players ({players.length})
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {players.map((player, index) => (
          <div
            key={index}
            className="flex w-[88px] flex-col items-center gap-2 rounded-xl border border-rose-200/60 bg-white px-2 py-3 shadow-sm"
          >
            <PlayerAvatar
              name={player}
              src={playerAvatars[player]}
            />
            <p className="text-center text-xs font-semibold text-slate-700 leading-tight break-words w-full">
              {player}
              {player === currentUserName && (
                <span className="block text-[10px] font-normal text-rose-400">(you)</span>
              )}
            </p>
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
