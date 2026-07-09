import { useAuthContext } from "../../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";

import { ProfileSection } from "./components/profileSection/ProfileSection";
import { GamesHistorySection } from "./components/GameHistorySection/GameHistorySection";
import type { GameHistory } from "./components/GameHistorySection/types";
import { GameCard} from "./components/GameCard/GameCard";

import { Footer } from "@/shared/components/footer";
import background from "@/assets/backgrounds/unocards_gemini.png";

export default function ProfilePage() {
  const { user, logout, isAuthenticated, refreshUser } = useAuthContext(); // pulls the auth state every time the profile page is mounted (or re-mounted) and sets the user state in the auth context
  const [history, setHistory] = useState<GameHistory[]>([]); // stores the game history for the user
  const [historyLoading, setHistoryLoading] = useState(false); // tracks loading state for the history fetch

  // Refresh user data (stats, rank, avatar) on every profile page mount
  // so that game results are reflected immediately without needing a manual refresh
  useEffect(() => {
    if (isAuthenticated) refreshUser();
  }, [isAuthenticated, refreshUser]);

  // useEffect to fetch the user's game history only when we get the isAuthenticated state (which happens on every mount of the profile page) )
  useEffect(() => {
    // console.log("isAuthenticated changed:", isAuthenticated);
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    fetch("/api/users/me/history", {
      credentials: "include", // includes the token in the request so that the server can authenticate the user
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("history fetch failed");
        const data = await res.json();
        return data?.history ?? [];
      })
      .then((items) => setHistory(items))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [isAuthenticated]);

  // wins/losses/rank come from the server-side computeRankedUsers (all games, not capped)
  // history is only used for the match history list display, not for stats
  const stats = useMemo(() => {
    return {
      wins: user?.stats?.wins ?? 0,
      losses: user?.stats?.losses ?? 0,
      rank: user?.stats?.rank ?? null,
    };
  }, [user?.stats?.wins, user?.stats?.losses, user?.stats?.rank]);

  return (
    <div
      className="bg-neutral-800 px-4 md:px-16 lg:px-48 py-8 md:py-16 lg:py-20 overflow-auto h-screen "
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backgroundBlendMode: "saturation",
      }}
    >
      <div className="flex items-start justify-end gap-4 p-4">
        <button
          type="button"
          onClick={logout}
          className="rounded-full border-2 border-slate-100/20 bg-gray-400 px-4 py-2 text-xs font-semibold uppercase text-white shadow-sm transition hover:bg-red-500"
        >
          Logout
        </button>
      </div>
      <ProfileSection user={user} stats={stats} onLogout={logout} />
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 lg:grid-cols-[1fr_2fr]">
          {/* switches view order between children */}
        <div className="order-2 lg:order-1 h-full">
          <GamesHistorySection games={historyLoading ? [] : history} />
        </div>
        <div className="order-1 lg:order-2 flex flex-col min-h-[400px] md:min-h-[60vh] lg:min-h-[700px]">
          <GameCard />
        </div>
      </div>
      <div className="mt-4 md:mt-6 lg:mt-8 flex justify-end">
        <div className="w-full max-w-md">
          <Footer />
        </div>
      </div>
    </div>
  );
}
