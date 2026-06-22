import type { GameHistory } from "@/app/auth/mockProfiles";
import { HistoryCard } from "./HistoryCard";

export function GamesHistorySection({
  games,
}: React.ComponentProps<"div"> & { games: GameHistory[] }) {
  const gamesPlayed = games.slice(0, 5); // <--- important to limit

  const emptyHistory = () => (
    <div className="py-20 mx-auto max-w-md rounded-2xl bg-black p-6 text-white shadow-sm shadow-slate-500/10">
      <div className="mx-auto w-fit text-center px-10">
        <p className="text-base font-semibold uppercase tracking-widest text-amber-300/90">
          No history available
        </p>
        <p className="text-xs text-left pt-5 font-semibold text-white/90">
          This section uploads your match history.
        </p>
        <p className="text-xs text-left pb-5 text-white/80">
          You'll be able to see up to 5 recent played matches here, including
          who you played against, when you played and whether you won or lost.
        </p>
      </div>
    </div>
  );

  const foundHistory = () => (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-300 drop-shadow-[0_1px_2px_rgba(252,211,77,0.4)] mb-3">
        Your recent Matches
      </p>
      {gamesPlayed.map((game) => (
        <HistoryCard key={game.id} game={game} />
      ))}
    </div>
  );

  return (
    <div>{gamesPlayed.length === 0 ? emptyHistory() : foundHistory()}</div>
  );
}
