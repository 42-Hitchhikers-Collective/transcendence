import { StatsCards } from "./StatsCards";
import { ExperienceBadge } from "./ExperienceBadge";

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

import { UploadAvatarButton } from "./UploadAvatarButton";

export function ProfileSection({
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
          <div className="flex items-start">
            <div>
              <ExperienceBadge gamesPlayed={wins + losses} winRate={winRate} />
              <h2 className="text-left text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-md">
                {username}
              </h2>
              {memberSince && (
                <h1 className="text-left text-sm text-gray-400 italic ">
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
          </div>
          <StatsCards wins={wins} losses={losses} winRate={winRate} />
        </div>
      </div>
    </div>
  );
}
