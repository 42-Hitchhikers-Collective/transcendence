import {
  PuzzlePieceIcon,
  TrophyIcon,
  UserGroupIcon,
  GlobeAmericasIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

import { ProgressBar } from "./ProgressBar";
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
          />
          <ProgressBar wins={wins} losses={losses} />
        </div>
      )}
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
      <p className="text-[10px] md:text-xs text-end text-slate-400 font-extralight mt-1 mr-1 md:mr-2 lg:mr-3">
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
}: {
  gamesPlayed: number;
  winRate: number;
  rank: number | null;
  wins: number;
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
      color: "text-amber-900",
      bgColor: "bg-amber-400",
      icon: TrophyIcon,
    },
    {
      label: "Total matches",
      value: gamesPlayed,
      color: "text-rose-900",
      bgColor: "bg-rose-500",
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
    <div className="w-full my-2 md:my-4 lg:my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 lg:gap-6">
        {cardStats.map(({ label, value, color, bgColor, icon: Icon }, idx) => (
          <div
            key={idx}
            className={`flex rounded-xl shadow-md border overflow-hidden w-full bg-white animate-jump`}
             style={{ animationDelay: `${idx * 200}ms` }}
          >
            <div
              className={`flex items-center justify-center w-12 md:w-16 lg:w-28 p-1 md:p-2 lg:p-4 ${bgColor}`}
            >
              <Icon
                className={`size-6 md:size-8 lg:size-12 ${color}`}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center px-[clamp(0.75rem,2vw,1.5rem)] py-[clamp(0.5rem,1vw,0.75rem)]">
              <p
                className={`text-[clamp(0.75rem,1.2vw,1rem)] font-semibold mb-[clamp(0.25rem,0.4vw,0.5rem)] ${color}`}
              >
                {label}
              </p>
              <p
                className={`text-[clamp(1rem,2vw,1.75rem)] font-extrabold ${color}`}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}