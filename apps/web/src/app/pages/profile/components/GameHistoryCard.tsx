import { mockProfiles } from "@/features/profile/mockData/mockProfiles";
import { AnimatedTooltip } from "@/shared/components/ui/animated-tooltip";


  const formatMatchDate = (value: string) =>
    new Date(value).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const profile = mockProfiles[0];
    

export function GameHistoryCard() {
  return (
    <div /* className="bg-card text-card-foreground rounded-xl border p-8 shadow-sm" */>
          <h2 className="mb-6 text-center text-xl font-bold">Game History</h2>

          {profile.history && profile.history.length > 0 ? (
            <div className="space-y-3">
              {profile.history.slice(0, 5).map((game) => (
                <div key={game.id} className="rounded-lg bg-muted p-4">
                  {/* Top line: username won/lost room */}
                  <div className="text-sm leading-relaxed">
                    <span className="font-semibold">{profile.username}</span>{" "}
                    <span
                      className={
                        game.result === "win"
                          ? "font-semibold text-green-500"
                          : "font-semibold text-red-500"
                      }
                    >
                      {game.result === "win" ? "won" : "lost"}
                    </span>{" "}
                    <span className="text-muted-foreground">in</span>{" "}
                    <span className="font-medium">
                      {game.roomName || "Unnamed Room"}
                    </span>
                  </div>

                  {/* Bottom line: opponent avatars (max 4) + date/time */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center -space-x-2">
                     <AnimatedTooltip items={game.opponents} />
                    </div>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatMatchDate(game.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">
              No games played yet
            </p>
          )}
        </div>
  )
}
