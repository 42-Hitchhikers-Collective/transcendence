import { useState } from "react";
import {
  PuzzlePieceIcon,
  UserGroupIcon,
  GlobeAmericasIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

import { ProgressBar } from "./ProgressBar";
import { LeaderboardModal } from "./LeaderboardModal";
import skipCard from "@/assets/icons/skip_card.webp";


export function StatsCards({
  wins,
  losses,
  winRate,
  rank,
}: {
  wins: number;
  losses: number;
  winRate: number;
  rank: number | null;
}) {
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  return (
    <div>
      {wins + losses === 0 ? (
        <EmptyStats />
      ) : (
        <div>
          <Stats
            gamesPlayed={wins + losses}
            wins={wins}
            winRate={winRate}
            rank={rank}
            onOpenLeaderboard={() => setLeaderboardOpen(true)}
            smallOnMd
          />
          <ProgressBar wins={wins} losses={losses} />
        </div>
      )}
      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
    </div>
  );
}

function EmptyStats() {
  return (
    <div className="w-full my-3 md:my-4 lg:my-5 xl:my-6">
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 rounded-2xl bg-black/90 px-4 py-3 md:px-5 md:py-4 lg:px-6 lg:py-5 shadow-lg ring-1 ring-white/10">
        <div className="flex items-center justify-center rounded-xl bg-white/10">
          <img
            src={skipCard}
            alt="Skip card"
            className="h-20 md:h-24 lg:h-28 xl:h-30 shadow-slate-50/20 rounded-lg"
          />
        </div>
        <div className="text-left">
          <h1 className="text-xs md:text-sm lg:text-base font-semibold uppercase tracking-wide text-yellow-400">
            No player stats available
          </h1>
          <h2 className="text-xs md:text-sm lg:text-base text-white font-semibold">
            It seems we found a new player!
          </h2>
          <p className="text-[10px] md:text-xs lg:text-sm text-white font-extralight my-2 md:my-3 lg:my-4 xl:my-5">
            Your player stats will be available as soon as you log your first
            game.
          </p>
        </div>
      </div>
      <p className="text-[10px] md:text-xs text-end text-slate-300 font-extralight mt-1 mr-1 md:mr-2 lg:mr-3">
        * If you are not a new user, please bear with us as we fix this
        technical problem!
      </p>
    </div>
  );
}


function Stats({
  gamesPlayed,
  winRate,
  rank,
  wins,
  onOpenLeaderboard,
}: {
  gamesPlayed: number;
  winRate: number;
  rank: number | null;
  wins: number;
  onOpenLeaderboard: () => void;
  smallOnMd?: boolean;
}) {
  type CardStat = {
    label: string;
    value: number | string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };

  const cardStats: CardStat[] = [
    {
      label: "Global rank",
      value: rank != null ? `#${rank}` : "?",
      color: "text-sky-900",
      bgColor: "bg-sky-400",
      icon: GlobeAmericasIcon,
    },
    {
      label: "Total matches",
      value: gamesPlayed,
      color: "text-violet-800",
      bgColor: "bg-violet-400",
      icon: UserGroupIcon,
    },
    {
      label: "Winning points",
      value: `${wins}`,
      color: "text-emerald-800",
      bgColor: "bg-emerald-400",
      icon: SparklesIcon,
    },

  ];

  return (
    <div className="w-full my-[clamp(0.75rem,1.2vw,1.5rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(0.75rem,1.2vw,1.5rem)]">
        {cardStats.map(({ label, value, color, bgColor, icon: Icon }, idx) => (
          <div
            key={idx}
            className={`flex rounded-xl shadow-md border overflow-hidden min-h-[clamp(3rem,4vw,4.5rem)] bg-white`}
          >
            <div
              className={`flex items-center justify-center w-[clamp(3.5rem,5vw,5rem)] p-[clamp(0.25rem,0.5vw,1rem)] ${bgColor}`}
            >
              <Icon
                className={`w-[clamp(1.25rem,1.8vw,2rem)] h-[clamp(1.25rem,1.8vw,2rem)] ${color}`}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center px-[clamp(0.5rem,0.8vw,1rem)] py-[clamp(0.25rem,0.4vw,0.5rem)]">
              <p
                className={`text-[clamp(0.5rem,0.9vw,0.9rem)] font-semibold mb-[clamp(0.1rem,0.2vw,0.25rem)] ${color}`}
              >
                {label}
              </p>
              <p
                className={`text-[clamp(0.9rem,1.6vw,1.5rem)] font-extrabold ${color}`}
              >
                {value}
              </p>
              {label === "Global rank" && (
                <button
                  onClick={onOpenLeaderboard}
                  className="text-[clamp(0.5rem,0.8vw,0.9rem)] font-medium text-sky-600 hover:text-sky-300 underline mt-0.5 cursor-pointer"
                >
                  See leaderboard
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}