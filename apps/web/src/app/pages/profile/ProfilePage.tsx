import { ProfileCard } from "./components/ProfileCard";
import { JoinGameCard } from "./components/gameStarter/StarterCard";
import { GameHistoryCard } from "./components/playHistory/HistoryList";
import { mockProfiles } from "@/app/auth/mockProfiles";
import background from "@/assets/backgrounds/unocards_gemini.png";
import { useAuthContext } from "../../auth/AuthContext";

// import AlertEx from "@/shared/shadcn-studio/alert/alert-08";
// import Uhh from "@/shared/shadcn-space/alert/alert-04";

function WelcomeCard({ playerData }: { playerData: (typeof mockProfiles)[0] }) {
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
  const { user } = useAuthContext();

  return (
    <div className="bg-neutral-800 px-50 py-20 overflow-auto h-screen"
    style={{ backgroundImage: `url(${background})`,  backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', backgroundBlendMode:'saturation'  }}
    >
      
      <ProfileCard user={user} />
      {/* <WelcomeCard playerData={playerData} /> */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="order-2 lg:order-1">
          {" "}
          {/* switchig view order between children */}
          <GameHistoryCard />
        </div>
        <div className="order-1 lg:order-2">
          <JoinGameCard />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;


