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

import { ProfileAvatar } from "./ProfileAvatar";

export function ProfileSection({
  user,
  stats,
  onLogout,
  ...props
}: {
  user?: AuthUser;
  stats: { wins: number; losses: number; rank: number | null };
  onLogout?: () => void;
} & React.ComponentProps<"div">) {
  // console.log("User data was loaded:", user);

  const username = user?.profile?.username ?? user?.username ?? "Player";
  const memberSince = user?.createdAt ? new Date(user.createdAt) : null;
  const wins = stats.wins;
  const losses = stats.losses;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return (
    <div
      {...props}
      className="relative w-full bg-stone-100 rounded-3xl shadow-2xl p-[clamp(1rem,3vw,2.5rem)] mb-[clamp(1rem,2vw,2rem)]"
    >
      <div className="relative flex flex-col sm:grid sm:grid-cols-[0.7fr_1.5fr] lg:grid-cols-[0.6fr_1.7fr] items-stretch gap-[clamp(1rem,2.5vw,2.5rem)]">
        {/* left content */}
        <div className="flex items-start sm:items-center justify-center">
          <ProfileAvatar avatarUrl={user?.profile?.avatarUrl ?? undefined}  /> 
        </div>

        {/* Right content */}
        <div className="flex flex-col min-h-0 ">
          <div className="flex items-start">
            <div>
              <ExperienceBadge gamesPlayed={wins + losses} winRate={winRate} />
              <h2 className="text-left text-[clamp(1.5rem,5vw,3.75rem)] font-extrabold text-gray-900 drop-shadow-md">
                {username}
              </h2>
              {memberSince && (
                <h1 className="text-left text-[clamp(0.7rem,1.2vw,1rem)] text-gray-400 italic ">
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
          <StatsCards wins={wins} losses={losses} winRate={winRate} rank={stats.rank} />
        </div>
      </div>
    </div>
  );
}
