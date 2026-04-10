import { mockProfiles } from "@/features/profile/mockData/mockProfiles";
import { ProgressBar } from "./ProgressBar";
import {
  PuzzlePieceIcon,
  UserGroupIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/solid";


function StatusCards({
  gamesPlayed,
  winRate,
  rank,
  smallOnMd,
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
      color: "text-yellow-950",
      bgColor: "bg-yellow-400",
      icon: PuzzlePieceIcon,
    },
    {
      label: "Unique opponents",
      value: `${winRate.toFixed(0)}%`,
      color: "text-rose-950",
      bgColor: "bg-rose-500",
      icon: UserGroupIcon,
    },
    {
      label: "Global rank",
      value: `#${rank}`,
      color: "text-sky-950",
      bgColor: "bg-sky-500",
      icon: ChartBarSquareIcon,
    },
  ];

  return (
    <div className="w-full">
      <div
        className={`grid md:grid-cols-1 xl:grid-cols-3 gap-6  md:gap-3`}
      >
        {cardStats.map(({ label, value, color, bgColor, icon: Icon }, idx) => (
          <div
            key={idx}
            className={`flex rounded-xl shadow-md border overflow-hidden min-h-[70px] bg-white  md:min-h-[60px]`}
          >
            <div
              className={`flex items-center justify-center w-16 p-2 md:w-14 md:p-1 xl:w-20 xl:p-4 ${bgColor}`}
            >
              <Icon className={`w-6 h-6 md:w-5 md:h-5 xl:w-8 xl:h-8 ${color}`} />
            </div>
            <div className="flex-1 flex flex-col justify-center px-2 py-1 md:px-1 md:py-1 xl:px-4 xl:py-2">
              <p className={`text-xs font-semibold mb-1 md:text-[10px] xl:text-xs ${color}`}>
                {label}
              </p>
              <p className={`text-lg md:text-base xl:text-2xl font-extrabold ${color}`}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Badge({
  gamesPlayed,
  winRate,
}: {
  gamesPlayed: number;
  winRate: number;
}) {
  const inRange = (value: number, min: number, max: number) =>
    value >= min && value < max;

  const experienceLevel = (): string => {
    const levels: {
      level: string;
      gamesRange: [number, number];
      winRange: [number, number];
    }[] = [
      { level: "Expert", gamesRange: [50, 300], winRange: [70, 100] }, // can be expert, intermediate, beginner
      { level: "Intermediate", gamesRange: [15, 49], winRange: [40, 100] }, // can be intermediate, beginner
      { level: "beginner", gamesRange: [0, 14], winRange: [0, 100] }, // can be only beginner
    ];

    let match = levels.find(
      ({ gamesRange, winRange }) =>
        inRange(gamesPlayed, gamesRange[0], gamesRange[1]) &&
        inRange(winRate, winRange[0], winRange[1]),
    )?.level; // can return undefined if gamesPlayed and winrate are not both in range

    if (match === undefined)
      match = levels.find(({ winRange }) =>
        inRange(winRate, winRange[0], winRange[1]),
      )?.level; // is not both in range, winrRate has priority (for example in cases like Expert but with 5 winRange)

    return match ? match : "Master"; // added a fallback in the case we surpass the expert Ranges as we can never go below 0
  };

  return (
    <div className="flex items-start justify-start gap-4">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        {experienceLevel()}
      </span>
    </div>
  );
}

export function ProfileCard({ ...props }: React.ComponentProps<"div">) {
  const profile = mockProfiles[0];
  let wins = profile.stats.wins;
  let losses = profile.stats.losses;
  const winRate = (wins / (wins + losses)) * 100;

  return (
    <div
      {...props}
      className="relative w-full bg-stone-100 rounded-3xl shadow-2xl p-10 md:p-6 xl:p-10 mb-8"
    >
      <div className="relative flex flex-col md:grid md:grid-cols-[1fr_1.2fr] lg:grid-cols-[0.7fr_1.5fr] xl:grid-cols-[0.6fr_1.7fr] items-stretch gap-6 xl:gap-10">
        {/* left content */}
        <div className="flex items-center justify-center">
          <div className="relative transform shadow-2xl w-54 h-54 md:w-48 md:h-48 lg:w-52 lg:h-52 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72 flex items-center justify-center transition-all duration-300">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-full h-full object-cover border-4 border-white shadow-sm shadow-slate-900 shadow-inner"
            />
          </div>
        </div>

        {/* Right content */}
        <div className="flex flex-col min-h-0 ">
          <div>
            <Badge gamesPlayed={wins + losses} winRate={winRate} />
            <h2 className="my-2 text-left text-2xl md:text-4xl font-extrabold text-gray-900 drop-shadow-md">
              {profile.username}
            </h2>
          </div>

          <StatusCards gamesPlayed={wins + losses} winRate={winRate} rank={5} smallOnMd />
          <ProgressBar wins={wins} losses={losses} />
        </div>
      </div>
    </div>
  );
}
