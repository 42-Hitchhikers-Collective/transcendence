import { StatsCards } from "./StatsCards";
import { ExperienceBadge } from "./ExperienceBadge";
import { useState } from "react";
import { GlobeAmericasIcon } from "@heroicons/react/24/solid";
import { LeaderboardModal } from "./LeaderboardModal";

type AuthUser = {
  email?: string;
  username?: string;
  createdAt?: string;
  profile?: {
    username?: string;
    avatarUrl?: string | null;
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
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const wins = stats.wins;
  const losses = stats.losses;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return (
    <div
      {...props}
      className="relative w-full bg-stone-100 rounded-3xl shadow-2xl p-[clamp(1.5rem,4vw,2.5rem)] mb-[clamp(1rem,2vw,2rem)]"
    >
      <div className="relative flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr] lg:grid-cols-[0.4fr_2fr] items-stretch gap-[clamp(1rem,2.5vw,2.5rem)]  p-[clamp(1rem,2vw,2rem)]">
        {/* left content */}
        <div className="flex items-start sm:items-center justify-center">
          <div
            className="animate-bounce-fade-in animate-fill-mode-backwards"
            style={{ animationDelay: "0ms" }}
          >
            <ProfileAvatar avatarUrl={user?.profile?.avatarUrl ?? undefined} />
          </div>
        </div>

        {/* Right content */}
        <div className=" flex-col min-h-0 items-start  sm:mx-0">
          <div className="flex items-start">
            <div>
              <div
                className="animate-slide-in-left animate-fill-mode-backwards"
                style={{ animationDelay: "100ms" }}
              >
                <ExperienceBadge
                  gamesPlayed={wins + losses}
                  winRate={winRate}
                />
              </div>
              <div
                className="animate-slide-in-left animate-fill-mode-backwards"
                style={{ animationDelay: "200ms" }}
              >
                <h2 className="text-left text-[clamp(1.5rem,5vw,3.75rem)] font-extrabold text-gray-900 drop-shadow-md">
                  {username}
                </h2>
              </div>

              {memberSince && (
                <div
                  className="animate-fade-in animate-fill-mode-backwards"
                  style={{ animationDelay: "350ms" }}
                >
                  <h1 className="text-left text-[clamp(0.7rem,1.2vw,1rem)] text-gray-400 italic ">
                    Shuffling cards since{" "}
                    <span className="font-semibold text-sky-500">
                      {memberSince
                        .toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        .replace(",", "")}
                    </span>
                  </h1>
                </div>
              )}
            </div>
          </div>
          <div
            className="animate-slide-in-bottom animate-fill-mode-backwards"
            style={{ animationDelay: "450ms" }}
          >
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-sky-500 px-4 py-2 text-[clamp(0.625rem,0.8vw,0.875rem)] font-semibold text-white shadow-sm hover:bg-sky-600 transition mb-[clamp(0.25rem,0.5vw,0.5rem)] cursor-pointer mr-auto"
            >
              <GlobeAmericasIcon className="size-[clamp(0.75rem,1vw,1rem)]" />
              See leaderboard
            </button>
            <StatsCards
              wins={wins}
              losses={losses}
              winRate={winRate}
              rank={stats.rank}
            />
          </div>
        </div>
      </div>

      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
    </div>
  );
}
