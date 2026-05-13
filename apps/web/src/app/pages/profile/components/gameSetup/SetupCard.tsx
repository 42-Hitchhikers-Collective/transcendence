import { Card, CardContent } from "@/shared/components/ui/card";
import { CreateLinkRoom } from "./CreateLinkCard";
// import { useState } from "react";
// import { CardSwitcherBtn } from "./CardSwitcherBtn";
// import { CreateGame } from "./optional/JoinFriendsCard";
// import { JoinRandomGame } from "./optional/JoinRandomCard";



// export const GameOptions = {
//   JoinRandomRoom: 0,
//   CreateRoom: 1,
//   CreateLinkRoom: 2,
// } as const;
// export type Option = (typeof GameOptions)[keyof typeof GameOptions];

export function JoinGameCard() {
  // const [activeOption, setActiveOption] = useState<Option>(GameOptions.CreateLinkRoom);

  return (
    <Card className="w-full h-full">
      <CardContent className="w-full">
        {/* <CardSwitcherBtn
          activeOption={activeOption}
          setActiveOption={setActiveOption}
        /> */}
          <CreateLinkRoom />
          {/* 
          {activeOption === "create-link" && <CreateLinkRoom />}
          {activeOption === "create-game" && <CreateGame />}
          {activeOption === "join-random-game" && <JoinRandomGame />} */}
      </CardContent>
    </Card>
  );
}
