import type { GameHistory } from "@/app/auth/mockProfiles";
import { HistoryCard } from "./HistoryCard";

export function GamesHistorySection({
  games,
}: React.ComponentProps<"div"> & { games: GameHistory[] }) {
  const gamesPlayed = games.slice(0, 5); // <--- important to limit

  const emptyHistory = () => (
    <div className="py-8 md:py-12 lg:py-16 xl:py-20 mx-auto max-w-xs md:max-w-sm lg:max-w-md rounded-2xl bg-black p-4 md:p-5 lg:p-6 text-white shadow-sm shadow-slate-500/10">
      <div className="mx-auto w-fit text-center px-4 md:px-6 lg:px-8 xl:px-10">
        <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-amber-300/90">
          No history available
        </p>
        <p className="text-[10px] md:text-xs text-left pt-3 md:pt-4 lg:pt-5 font-semibold text-white/90">
          This section uploads your match history.
        </p>
        <p className="text-[10px] md:text-xs text-left pb-3 md:pb-4 lg:pb-5 text-white/80">
          You'll be able to see up to 5 recent played matches here, including
          who you played against, when you played and whether you won or lost.
        </p>
      </div>
    </div>
  );

  const foundHistory = () => (
    <div>
      <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-amber-300 drop-shadow-[0_1px_2px_rgba(252,211,77,0.4)] mb-2 md:mb-3">
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
