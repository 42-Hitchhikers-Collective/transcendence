import { useEffect, useState } from "react";
import {
  XMarkIcon,
  TrophyIcon,
  PuzzlePieceIcon,
  GlobeAmericasIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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

const PAGE_SIZE = 10;

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const [allData, setAllData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch fresh data every time the modal opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/users/leaderboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("leaderboard fetch failed");
        const json = await res.json();
        return json.data ?? [];
      })
      .then((entries) => {
        setAllData(entries);
      })
      .catch(() => setAllData([]))
      .finally(() => setLoading(false));
  }, [open]);

  // Paginate client-side
  const totalPages = Math.max(1, Math.ceil(allData.length / PAGE_SIZE));
  const leaderboard = allData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when modal closes/reopens
  useEffect(() => {
    if (!open) setPage(1);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-[clamp(150px,90vw,600px)] max-h-[80vh] overflow-hidden rounded-3xl bg-stone-100 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="relative flex items-center justify-center border-b bg-sky-400 px-[clamp(0.25rem,2vw,1.5rem)] py-[clamp(0.25rem,1.5vw,1rem)]">
          <GlobeAmericasIcon className="size-[clamp(0.75rem,3vw,2rem)] text-sky-900 shrink-0 mx-[clamp(0.1rem,0.5vw,0.5rem)]" />
          <h2 className="text-[clamp(0.5rem,3vw,1.25rem)] font-semibold text-sky-900">
            Global Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="absolute right-[clamp(0.25rem,1.5vw,1rem)] rounded-full p-[clamp(0.1rem,0.5vw,0.25rem)] text-gray-500 hover:bg-stone-300 hover:text-gray-800 transition"
          >
            <XMarkIcon className="size-[clamp(0.5rem,1.5vw,1.25rem)]" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="space-y-[clamp(0.25rem,1.5vw,0.75rem)] p-[clamp(0.5rem,3vw,1.5rem)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[clamp(1rem,4vw,3rem)] animate-pulse rounded-xl bg-stone-200"
                />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-[clamp(0.75rem,4vw,2.5rem)] text-center">
              <p className="text-[clamp(0.4rem,2vw,0.875rem)] text-gray-500 font-semibold">
                No ranked players available at the moment. Check again soon!
              </p>
            </div>
          ) : (
            <div className="divide-y py-[clamp(0.25rem,1.5vw,0.75rem)] px-[clamp(0.5rem,3vw,1.5rem)]">
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
                    className="flex rounded-xl shadow-md border overflow-hidden bg-white my-[clamp(0.2rem,1vw,0.75rem)]"
                  >
                    {/* Left colored panel — rank number */}
                    <div
                      className={`flex items-center justify-center w-[clamp(1.5rem,8vw,5rem)] p-[clamp(0.05rem,0.5vw,0.5rem)] shrink-0 ${rankColors.bg}`}
                    >
                      <span
                        className={`text-[clamp(0.4rem,2.5vw,1.125rem)] font-extrabold ${rankColors.text}`}
                      >
                        {entry.rank === 0 ? "" : entry.rank}
                      </span>
                    </div>
                    {/* Right content panel */}
                    <div className="flex-1 flex items-center gap-[clamp(0.15rem,1vw,0.75rem)] px-[clamp(0.15rem,1vw,0.75rem)] py-[clamp(0.25rem,1.5vw,1rem)]">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <Avatar className="size-[clamp(1rem,5vw,3rem)] shrink-0 ring-2 ring-white">
                          <AvatarImage
                            src={entry.avatarUrl ?? "/avatars/default.png"}
                            alt={entry.username}
                          />
                          <AvatarFallback>
                            <img
                              src="/avatars/default.png"
                              alt={entry.username}
                              className="size-[clamp(1rem,5vw,3rem)] rounded-full"
                            />
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Username + stats */}
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex items-center">
                          <p className="text-[clamp(0.4rem,2.5vw,1.125rem)] font-semibold text-gray-900 truncate">
                            {entry.username}
                          </p>
                          <div className="scale-[clamp(0.25,0.2vw,0.65)] mb-[clamp(0.5rem,2vw,1.25rem)]">
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

                        <p className="flex items-center gap-[clamp(0.05rem,0.3vw,0.25rem)] text-[clamp(0.3rem,1.5vw,0.625rem)] text-gray-400 leading-tight">
                          <TrophyIcon className="size-[clamp(0.35rem,1.5vw,1rem)] text-amber-300 shrink-0" />
                          <span>{entry.wins} wins</span>
                        </p>
                        <p className="flex items-center gap-[clamp(0.05rem,0.3vw,0.25rem)] text-[clamp(0.3rem,1.5vw,0.625rem)] text-gray-400 leading-tight">
                          <PuzzlePieceIcon className="size-[clamp(0.35rem,1.5vw,1rem)] text-purple-300 shrink-0" />
                          <span>{entry.wins + entry.losses} games</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-[clamp(0.25rem,1.5vw,1rem)] px-[clamp(0.25rem,2vw,1.5rem)] pb-[clamp(0.25rem,2vw,1.5rem)]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full p-[clamp(0.1rem,0.5vw,0.375rem)] text-gray-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeftIcon className="size-[clamp(0.5rem,1.5vw,1.25rem)]" />
              </button>
              <span className="text-[clamp(0.35rem,1.5vw,0.75rem)] font-medium text-gray-500">
                {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-full p-[clamp(0.1rem,0.5vw,0.375rem)] text-gray-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRightIcon className="size-[clamp(0.5rem,1.5vw,1.25rem)]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
