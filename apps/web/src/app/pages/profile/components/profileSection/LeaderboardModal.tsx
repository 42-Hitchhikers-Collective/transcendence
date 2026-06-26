import { useEffect, useRef, useState } from "react";
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
  const fetchedRef = useRef(false);

  // Fetch all data once when modal opens
  useEffect(() => {
    if (!open || fetchedRef.current) return;
    setLoading(true);
    fetch("/api/users/leaderboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("leaderboard fetch failed");
        const json = await res.json();
        return json.data ?? [];
      })
      .then((entries) => {
        setAllData(entries);
        fetchedRef.current = true;
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
      <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[80vh] overflow-hidden rounded-3xl bg-stone-100 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="relative flex items-center justify-center border-b bg-sky-400 px-4 py-3 md:px-6 md:py-4">
          <GlobeAmericasIcon className="size-5 md:size-6 lg:size-8 text-sky-900 shrink-0 mx-1 md:mx-2" />
          <h2 className="text-base md:text-lg lg:text-xl font-semibold text-sky-900">
            Global Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 rounded-full p-1 text-gray-500 hover:bg-stone-300 hover:text-gray-800 transition"
          >
            <XMarkIcon className="size-4 md:size-5" />
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
                      className={`flex items-center justify-center w-12 md:w-16 lg:w-20 p-1 md:p-2 shrink-0 ${rankColors.bg}`}
                    >
                      <span
                        className={`text-sm md:text-base lg:text-lg font-extrabold ${rankColors.text}`}
                      >
                        {entry.rank === 0 ? "" : entry.rank}
                      </span>
                    </div>
                    {/* Right content panel */}
                    <div className="flex-1 flex items-center gap-2 md:gap-3 px-2 py-3 md:px-3 md:py-4">
                      {/* Col 2: Avatar */}
                      <div className="relative shrink-0">
                        <Avatar className="size-8 md:size-10 lg:size-12 shrink-0 ring-2 ring-white">
                          <AvatarImage
                            src={entry.avatarUrl ?? "/avatars/default.png"}
                            alt={entry.username}
                          />
                          <AvatarFallback>
                            <img
                              src="/avatars/default.png"
                              alt={entry.username}
                              className="size-8 md:size-10 rounded-full"
                            />
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Col 3: Username + stats */}
                      <div className="flex-1 flex flex-col justify-center min-w-0 ">
                        <div className="flex items-center ">
                          <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 truncate">
                            {entry.username}
                          </p>
                          <div className="scale-[0.55] md:scale-[0.6] lg:scale-[0.65] xl:scale-70 mb-5">
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

                        <p className="flex items-center gap-1 text-[8px] md:text-[10px] text-gray-400 leading-tight">
                          <TrophyIcon className="size-3 md:size-4 text-amber-300 shrink-0" />
                          <span>{entry.wins} wins</span>
                        </p>
                        <p className="flex items-center gap-1 text-[8px] md:text-[10px] text-gray-400 leading-tight">
                          <PuzzlePieceIcon className="size-3 md:size-4 text-purple-300 shrink-0" />
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
            <div className="flex items-center justify-center gap-3 md:gap-4 px-4 md:px-6 pb-4 md:pb-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full p-1 md:p-1.5 text-gray-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeftIcon className="size-4 md:size-5" />
              </button>
              <span className="text-[10px] md:text-xs font-medium text-gray-500">
                {page} of  {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-full p-1.5 text-gray-500 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRightIcon className="size-4 md:size-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
