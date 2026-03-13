import { mockProfiles } from "@/features/profile/mockData/mockProfiles";

// import {ProfileBadge} from "./ProfileBadge";
// import {ProfileHeader} from "./ProfileHeader";
// import {ProfileStats} from "./ProfileStats";



export function ProfileCard({
  className,
  ...props
}: React.ComponentProps<"div">) {



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
    <div /* className="bg-card text-card-foreground rounded-xl border p-8 shadow-sm" */>
          
           {/* badge */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              {experienceLevel}
            </span>
          </div>
          
          {/* avatar */}
          <div className="mb-6 flex flex-col items-center">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="mb-4 h-24 w-24 rounded-full border-2 border-primary"
            />
            <h1 className="text-2xl font-bold">{profile.username}</h1>
          </div>

          <div className="space-y-4">
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

            <div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
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

              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span>Wins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span>Losses</span>
                </div>
              </div>
            </div>
          </div>
        </div>
   
  );
}

