import { useAuthContext } from "../../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";

import { ProfileSection } from "./components/profileSection/ProfileSection";
import { GamesHistorySection } from "./components/GameHistorySection/GameHistorySection";
import type { GameHistory } from "@/app/auth/mockProfiles";
import { GameCard} from "./components/GameCard/GameCard";

import { Footer } from "@/shared/components/footer";
import background from "@/assets/backgrounds/unocards_gemini.png";

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuthContext(); // pulls the auth state every time the profile page is mounted (or re-mounted) and sets the user state in the auth context
  const [history, setHistory] = useState<GameHistory[]>([]); // stores the game history for the user
  const [historyLoading, setHistoryLoading] = useState(false); // tracks loading state for the history fetch

  // useEffect to fetch the user's game history only when we get the isAuthenticated state (which happens on every mount of the profile page) )
  useEffect(() => {
    console.log("isAuthenticated changed:", isAuthenticated);
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

  // compute wins/losses from history; rank comes from the API (via /api/users/me stored in auth context)
  const stats = useMemo(() => {
    const wins = history.filter((game) => game.result === "win").length;
    const losses = history.filter((game) => game.result === "loss").length;
    const rank = user?.stats?.rank ?? null;
    return { wins, losses, rank };
  }, [history, user?.stats?.rank]);

  return (
    <div
      className="bg-neutral-800 px-[clamp(1rem,4vw,12.5rem)] py-[clamp(2rem,4vw,5rem)] overflow-auto h-screen"
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
      <div className="grid grid-cols-1 gap-[clamp(1rem,1.5vw,2rem)] lg:grid-cols-[1fr_2fr]">
          {/* switches view order between children */}
        <div className="order-2 lg:order-1 h-full">
          <GamesHistorySection games={historyLoading ? [] : history} />
        </div>
        <div className="order-1 lg:order-2 flex flex-col" style={{ minHeight: "clamp(400px, 60vh, 700px)" }}>
          <GameCard />
        </div>
      </div>
      <div className="mt-[clamp(1rem,2vw,2rem)] flex justify-end">
        <div className="w-full max-w-[clamp(16rem,30vw,28rem)]">
          <Footer />
        </div>
      </div>
    </div>
  );
}
