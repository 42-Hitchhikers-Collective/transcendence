import { ProgressBar } from "./ProgressBar";
import {
  PuzzlePieceIcon,
  UserGroupIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/solid";

type AuthUser = {
  email?: string;
  username?: string;
  createdAt?: string;
  profile?: {
    username?: string;
    avatarUrl?: string | null;
    bio?: string | null;
  } | null;
} | null;


import skipCard from "@/assets/icons/skip_card.webp";
import { UploadAvatarButton } from "./UploadAvatarButton";

function NoStatusFound() {
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
          <p className="text-xs text-white font-extralight my-5">Your player stats will be available as soon as you log your first game.</p>
        </div>
      </div>
          <p className="text-xs text-end text-slate-300 font-extralight mt-1 mr-3">* If you are not a new user, please bear with us as we fix this technical problem!</p>
    </div>
  );
}

function Cards({
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

export function Badge({
  gamesPlayed,
  winRate,
  onLogout,
}: {
  gamesPlayed: number;
  winRate: number;
  onLogout?: () => void;
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
    <div className="flex items-start justify-between gap-4">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        {experienceLevel()}
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-full border border-gray-100 bg-red-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export function ProfileCard({
  user,
  stats,
  onLogout,
  ...props
}: {
  user?: AuthUser;
  stats: { wins: number; losses: number };
  onLogout?: () => void;
} & React.ComponentProps<"div">) {

console.log("User data was loaded:", user);

  const username = user?.profile?.username ?? user?.username ?? "Player";
  const avatar = user?.profile?.avatarUrl ?? undefined; // if avatar is null or undefined, we pass undefined to the UploadAvatarButton to use the default avatar. If it's a string (even an empty one), we pass it as is.
  const memberSince = user?.createdAt ? new Date(user.createdAt) : null;
  const wins = stats.wins;
  const losses = stats.losses;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return (
    <div
      {...props}
      className="relative w-full bg-stone-100 rounded-3xl shadow-2xl p-10 md:p-6 xl:p-10 mb-8"
    >
      <div className="relative flex flex-col md:grid md:grid-cols-[1fr_1.2fr] lg:grid-cols-[0.7fr_1.5fr] xl:grid-cols-[0.6fr_1.7fr] items-stretch gap-6 xl:gap-10">
        {/* left content */}
        <div className="flex items-center justify-center">
          <UploadAvatarButton avatar={avatar} />
        </div>

        {/* Right content */}
        <div className="flex flex-col min-h-0 ">
          <div>
            <Badge
              gamesPlayed={wins + losses}
              winRate={winRate}
              onLogout={onLogout}
            />
            <h2 className=" text-left text-2xl md:text-5xl font-extrabold text-gray-900 drop-shadow-md">
              {username}
            </h2>
            {memberSince && (
              <h1 className="text-left text-sm text-gray-400">
                Shuffling cards since{" "}
                {memberSince
                  .toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  .replace(",", "")}
              </h1>
            )}
          </div>
          <PlayerStats wins={wins} losses={losses} winRate={winRate} />
        </div>
      </div>
    </div>
  );
}

function PlayerStats({
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
        <NoStatusFound />
      ) : (
        <div>
          <Cards
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
