import { mockProfiles } from "@/features/profile/mockData/mockProfiles";

// import {ProfileBadge} from "./ProfileBadge";
// import {ProfileHeader} from "./ProfileHeader";
// import {ProfileStats} from "./ProfileStats";

export function ProfileCard({ ...props }: React.ComponentProps<"div">) {
  const profile = mockProfiles[0];
  const gamesPlayed = profile.stats.wins + profile.stats.losses;
  const winRate =
    gamesPlayed === 0 ? 0 : (profile.stats.wins / gamesPlayed) * 100;

  const experienceLevel =
    gamesPlayed >= 30 && winRate >= 65
      ? "Expert"
      : gamesPlayed >= 15 && winRate >= 50
        ? "Intermediate"
        : "Beginner";

  return (
    <div
      {...props} /* className="bg-card text-card-foreground rounded-xl border p-8 shadow-sm" */
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* avatar */}
        <div className="flex justify-center md:w-64 md:flex-shrink-0">
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-[90%] rounded-full border-2 border-primary object-cover"
          />
        </div>

        <div className="flex-1 space-y-5">
          {/* badge */}
          <div className="flex items-start justify-start gap-4">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              {experienceLevel}
            </span>
          </div>

          <h1 className="text-4xl text-left font-bold tracking-tight md:text-5xl">
            {profile.username}
          </h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-3xl font-semibold text-blue-500">
                {gamesPlayed}
              </p>
              <p className="text-muted-foreground text-sm">Games Played</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-3xl font-semibold text-green-500">
                {winRate.toFixed(0)}%
              </p>
              <p className="text-muted-foreground text-sm">Win Rate</p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="space-y-2">
            {/* status bar */}
            <div className="h-4 overflow-hidden rounded-full bg-muted">
              <div className="flex h-full w-full">
                <div
                  className="bg-green-500"
                  style={{ width: `${winRate}%` }}
                />
                <div
                  className="bg-red-500"
                  style={{ width: `${100 - winRate}%` }}
                />
              </div>
            </div>
            {/* status bar info*/}
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>{profile.stats.wins} Wins</span>
              <span>{profile.stats.losses} Losses</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
