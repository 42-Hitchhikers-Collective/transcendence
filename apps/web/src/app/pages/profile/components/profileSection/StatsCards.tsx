import {
  PuzzlePieceIcon,
  UserGroupIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/solid";

import { ProgressBar } from "./ProgressBar";
import skipCard from "@/assets/icons/skip_card.webp";


export function StatsCards({
  wins,
  losses,
  winRate,
}: {
  wins: number;
  losses: number;
  winRate: number;
}) {
  return (
    <div>
      {wins + losses === 0 ? (
        <EmptyStats />
      ) : (
        <div>
          <Stats
            gamesPlayed={wins + losses}
            winRate={winRate}
            rank={0}
            smallOnMd
          />
          <ProgressBar wins={wins} losses={losses} />
        </div>
      )}
    </div>
  );
}

function EmptyStats() {
  return (
    <div className="w-full my-6">
      <div className="flex items-center gap-4 rounded-2xl bg-black/90 px-6 py-5 shadow-lg ring-1 ring-white/10">
        <div className="flex items-center justify-center rounded-xl bg-white/10">
          <img
            src={skipCard}
            alt="Skip card"
            className="h-30  shadow-slate-50/20 rounded-lg  "
          />
        </div>
        <div className="text-left">
          <h1 className="text-sm font-semibold uppercase tracking-wide text-yellow-400">
            No player stats available
          </h1>
          <h2 className="text-sm text-white font-semibold">
            It seems we found a new player!
          </h2>
          <p className="text-xs text-white font-extralight my-5">
            Your player stats will be available as soon as you log your first
            game.
          </p>
        </div>
      </div>
      <p className="text-xs text-end text-slate-300 font-extralight mt-1 mr-3">
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
}: {
  gamesPlayed: number;
  winRate: number;
  rank: number;
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
      label: "Total matches",
      value: gamesPlayed,
      color: "text-yellow-800",
      bgColor: "bg-yellow-400",
      icon: PuzzlePieceIcon,
    },
    {
      label: "Global rank",
      value: `#missing` /* TODO: get data from api instead of hardcoded */,
      color: "text-rose-900",
      bgColor: "bg-rose-500",
      icon: ChartBarSquareIcon,
    },
    {
      label: "Friends",
      value: `${winRate.toFixed(0)}%`,
      color: "text-sky-900",
      bgColor: "bg-sky-400",
      icon: UserGroupIcon,
    },
  ];

  return (
    <div className="w-full my-5">
      <div className={`grid md:grid-cols-1 xl:grid-cols-3 gap-6  md:gap-3`}>
        {cardStats.map(({ label, value, color, bgColor, icon: Icon }, idx) => (
          <div
            key={idx}
            className={`flex rounded-xl shadow-md border overflow-hidden min-h-17.5 bg-white  md:min-h-15`}
          >
            <div
              className={`flex items-center justify-center w-16 p-2 md:w-14 md:p-1 xl:w-20 xl:p-4 ${bgColor}`}
            >
              <Icon
                className={`w-6 h-6 md:w-5 md:h-5 xl:w-8 xl:h-8 ${color}`}
              />
            </div>
            <div className="flex-1 flex flex-col justify-center px-2 py-1 md:px-1 md:py-1 xl:px-4 xl:py-2">
              <p
                className={`text-xs font-semibold mb-1 md:text-[10px] xl:text-xs ${color}`}
              >
                {label}
              </p>
              <p
                className={`text-lg md:text-base xl:text-2xl font-extrabold ${color}`}
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