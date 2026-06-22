import { useAuthContext } from "../../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";

import { ProfileSection } from "./components/profileSection/ProfileSection";
import { GamesHistorySection } from "./components/GameHistorySection/GameHistorySection";
import type { GameHistory } from "@/app/auth/mockProfiles";
import { CreateGameCard} from "./components/createGameCard/CreateGameCard";

import { Footer } from "@/shared/components/footer";
import background from "@/assets/backgrounds/unocards_gemini.png";

export default function ProfilePage() {
  /* This should be isolated in its own hook file and imported */
  const { user, logout, token } = useAuthContext(); // pulls the auth state
  const [history, setHistory] = useState<GameHistory[]>([]); // stores the game history for the user
  const [historyLoading, setHistoryLoading] = useState(false); // tracks loading state for the history fetch

  // use effect where we re-fetch the hstory if it changes (after the user completed a game for example)
  useEffect(() => {
    if (!token) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    fetch("/api/users/me/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("history fetch failed");
        const data = await res.json();
        return data?.history ?? [];
      })
      .then((items) => setHistory(items))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [token]);

  // compute wins/losses from history; rank comes from the API (via /api/users/me stored in auth context)
  const stats = useMemo(() => {
    const wins = history.filter((game) => game.result === "win").length;
    const losses = history.filter((game) => game.result === "loss").length;
    const rank = user?.stats?.rank ?? null;
    return { wins, losses, rank };
  }, [history, user?.stats?.rank]);

  return (
    <div
      className="bg-neutral-800 px-50 py-20 overflow-auto h-screen"
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
          {/* switches view order between children */}
        <div className="order-2 lg:order-1">
          <GamesHistorySection games={historyLoading ? [] : history} />
        </div>
        <div className="order-1 lg:order-2">
          <CreateGameCard />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <div className="max-w-md">
          <Footer />
        </div>
      </div>
    </div>
  );
}
