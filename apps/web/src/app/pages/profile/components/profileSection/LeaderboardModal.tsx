import { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  TrophyIcon,
  PuzzlePieceIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import { ExperienceBadge } from "./ExperienceBadge";

type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarUrl: string | null;
  wins: number;
  losses: number;
};

type LeaderboardModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false); // use ref to track if we've already fetched the leaderboard to avoid redundant calls on open/close

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    setLoading(true);
    fetch("/api/users/leaderboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("leaderboard fetch failed");
        const data = await res.json();
        return data?.data ?? [];
      })
      .then((entries) => {
        setLeaderboard(entries);
        fetchedRef.current = true;
      })
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[80vh] overflow-hidden rounded-3xl bg-stone-100 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="relative flex items-center justify-center border-b bg-sky-400 px-6 py-4">
          <GlobeAmericasIcon className="size-8 text-sky-900 shrink-0 mx-2" />
          <h2 className="text-xl font-semibold text-sky-900">
            Global Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 rounded-full p-1 text-gray-500 hover:bg-stone-300 hover:text-gray-800 transition"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl bg-stone-200"
                />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500 font-semibold">
                No ranked players available at the moment. Check again soon!
              </p>
            </div>
          ) : (
            <div className="divide-y py-3 px-6">
              {leaderboard.map((entry) => {
                const rankColors =
                  entry.rank === 1
                    ? { bg: "bg-green-500", text: "text-green-900" }
                    : entry.rank === 2
                      ? { bg: "bg-emerald-300", text: "text-slate-900" }
                      : entry.rank === 3
                        ? { bg: "bg-teal-200", text: "text-teal-900" }
                        : entry.rank === 0
                          ? { bg: "bg-gray-0", text: "text-gray-500" }
                          : { bg: "bg-slate-200", text: "text-stone-700" };

                return (
                  <div
                    key={entry.username}
                    className="flex rounded-xl shadow-md border overflow-hidden bg-white my-3"
                  >
                    {/* Left colored panel — rank number */}
                    <div
                      className={`flex items-center justify-center w-20 p-2 shrink-0 ${rankColors.bg}`}
                    >
                      <span
                        className={`text-lg font-extrabold ${rankColors.text}`}
                      >
                        {entry.rank === 0 ? "" : entry.rank}
                      </span>
                    </div>
                    {/* Right content panel */}
                    <div className="flex-1 flex items-center gap-3 px-3 py-4">
                      {/* Col 2: Avatar with badge overlaid on top */}
                      <div className="relative shrink-0">
                        <Avatar className="size-12 shrink-0 ring-2 ring-white">
                          <AvatarImage
                            src={entry.avatarUrl ?? "/avatars/default.png"}
                            alt={entry.username}
                          />
                          <AvatarFallback>
                            <img
                              src="/avatars/default.png"
                              alt={entry.username}
                              className="size-10 rounded-full"
                            />
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Col 3: Username + stats */}
                      <div className="flex-1 flex flex-col justify-center min-w-0 ">
                        <div className="flex items-center ">
                          <p className="text-lg font-semibold text-gray-900 truncate">
                            {entry.username}
                          </p>
                          <div className="scale-70 mb-5">
                          <ExperienceBadge
                            gamesPlayed={entry.wins + entry.losses}
                            winRate={
                              entry.wins + entry.losses > 0
                                ? (entry.wins / (entry.wins + entry.losses)) * 100
                                : 0
                            }
                          />
                          </div>
                        </div>

                        <p className="flex items-center gap-1 text-[10px] text-gray-400 leading-tight">
                          <TrophyIcon className="size-4  text-amber-300 shrink-0" />
                          <span>{entry.wins} wins</span>
                        </p>
                        <p className="flex items-center gap-1 text-[10px] text-gray-400 leading-tight">
                          <PuzzlePieceIcon className="size-4 text-purple-300 shrink-0" />
                          <span>{entry.wins + entry.losses} games</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
