import { ProfileCard } from "./components/ProfileCard";
import { JoinGameCard } from "./components/PlayGame";
import { GameHistoryCard } from "./components/HistoryList";

function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileCard />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="order-2 lg:order-1"> {/* switchig view order between children */}
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
