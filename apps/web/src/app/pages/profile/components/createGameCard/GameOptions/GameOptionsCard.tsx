import { Card, CardContent } from "@/shared/components/ui/card";
import { CreateGameCard } from "../CreateGameCard.tsx";
// import { useState } from "react";
// import { CardSwitcherBtn } from "./CardSwitcherBtn";
// import { InviteFriends } from "./optional/JoinFriendsCard";
// import { JoinRandom } from "./optional/JoinRandomCard";

// export const GameOptions = {
//   JoinRandomRoom: 0,
//   CreateRoom: 1,
//   CreateGameCard: 2,
// } as const;
// export type Option = (typeof GameOptions)[keyof typeof GameOptions];

export function GameOptionsCard() {
  // const [activeOption, setActiveOption] = useState<Option>(GameOptions.CreateGameCard);

  return (
    <Card className="w-full h-full">
      <CardContent className="w-full">
        {/* <CardSwitcherBtn
          activeOption={activeOption}
          setActiveOption={setActiveOption}
        /> */}
        <CreateGameCard />

        {/* {activeOption === "create-link" && <CreateGameCard />}
        {activeOption === "create-game" && <InviteFriends />}
        {activeOption === "join-random-game" && <JoinRandom />} */}
      </CardContent>
    </Card>
  );
}
