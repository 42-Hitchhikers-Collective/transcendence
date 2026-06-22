import {
  SparklesIcon,
  BookmarkIcon, // beginner icon
  BookOpenIcon, // intermediate icon
  AcademicCapIcon, // expert icon
  FireIcon, // master icon
} from "@heroicons/react/24/solid";

export function ExperienceBadge({
  gamesPlayed,
  winRate,
}: {
  gamesPlayed: number;
  winRate: number;
  onLogout?: () => void;
}) {
  const inRange = (value: number, min: number, max: number) =>
    value >= min && value <= max;

  const levels = [
    {
      level: "Expert",
      gamesRange: [50, 300],
      winRange: [70, 100],
      textColor: "text-rose-700",
      bgColor: "bg-rose-200",
      icon: AcademicCapIcon,
    },
    {
      level: "Intermediate",
      gamesRange: [15, 49],
      winRange: [40, 100],
      textColor: "text-amber-700",
      bgColor: "bg-amber-200",
      icon: BookOpenIcon,
    },
    {
      level: "Beginner",
      gamesRange: [1, 14],
      winRange: [0, 100],
      textColor: "text-sky-700",
      bgColor: "bg-sky-200",
      icon: BookmarkIcon,
    },
    {
      level: "Newbie",
      gamesRange: [0, 0],
      winRange: [0, 0],
      textColor: "text-gray-700",
      bgColor: "bg-slate-200",
      icon: SparklesIcon,
    },
  ];

  const match = levels.find(
    ({ gamesRange, winRange }) =>
      inRange(gamesPlayed, gamesRange[0], gamesRange[1]) &&
      inRange(winRate, winRange[0], winRange[1]),
  ) ??
    levels.find(({ winRange }) =>
      inRange(winRate, winRange[0], winRange[1]),
    ) ?? {
      level: "Master",
      textColor: "text-violet-700",
      bgColor: "bg-violet-200",
      icon: FireIcon,
    };

  return (
    <div
      className={`inline-flex  gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${match.bgColor} ${match.textColor} sm:px-3 sm:py-1 `}
    >
      <match.icon className="h-3 w-3 sm:h-4 sm:w-4" />
      <p>{match.level}</p>
    </div>
  );
}
