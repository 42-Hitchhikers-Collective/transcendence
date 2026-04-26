import { ProfileCard } from "./components/ProfileCard";
import { JoinGameCard } from "./components/gameStarter/StarterCard";
import { GameHistoryCard } from "./components/playHistory/HistoryList";
import { useEffect, useMemo, useState } from "react";
import type { GameHistory } from "@/app/auth/mockProfiles";
import background from "@/assets/backgrounds/unocards_gemini.png";
import { useAuthContext } from "../../auth/AuthContext";

// import AlertEx from "@/shared/shadcn-studio/alert/alert-08";
// import Uhh from "@/shared/shadcn-space/alert/alert-04";

function WelcomeCard({ playerData }: { playerData: { username?: string } }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border p-6 shadow-sm">
      <div className="relative space-y-5">
        <div className="space-y-2 border-b border-sky-200/70 pb-4">
          <p>
            <span className="font-bold">
              Welcome to your player page, {playerData.username}!
            </span>
            <br />
            It may look a little empty and boring right now, but in reality it's
            just waiting for you to record it with with your epic gaming data!
          </p>
        </div>
      </div>
    </section>
  );
}

function ProfilePage() {

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

  // compute stats from history; memoize to avoid unnecessary recalculations on re-renders
  const stats = useMemo(() => {
    const wins = history.filter((game) => game.result === "win").length;
    const losses = history.filter((game) => game.result === "loss").length;
    return { wins, losses };
  }, [history]);

  return (
    <div className="bg-neutral-800 px-50 py-20 overflow-auto h-screen"
    style={{ backgroundImage: `url(${background})`,  backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', backgroundBlendMode:'saturation'  }}
    >
      
      <ProfileCard user={user} stats={stats} onLogout={logout} />
      {/* <WelcomeCard playerData={playerData} /> */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="order-2 lg:order-1"> {/* switches view order between children */}
          <GameHistoryCard games={historyLoading ? [] : history} />
        </div>
        <div className="order-1 lg:order-2">
          <JoinGameCard />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;


