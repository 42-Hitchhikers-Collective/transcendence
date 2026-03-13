import { mockProfiles } from "@/features/profile/mockData/mockProfiles";

import { ProfileCard } from "./components/ProfileCard";
import { JoinGameCard } from "./components/JoinGameCard";
import { GameHistoryCard } from "./components/GameHistoryCard";

function ProfilePage() {
  const profile = mockProfiles[0];

  // ADD:  https://www.shadcnui-blocks.com/blocks/categories/navbar
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <ProfileCard />
        <div className="flex flex-col gap-6">
          <JoinGameCard />
          <GameHistoryCard />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
