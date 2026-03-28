import { Card, CardContent } from "@/shared/components/ui/card";
import { CreateGame } from "./JoinFriendsCard";
import { JoinRandomGame } from "./JoinRandomCard";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";

/* 
In join with random players:
- The user will be put in a queue and matched with other players that also requested to play with random players.
- Once enough players are matched, they will be redirected to the /game page.

In play with friends:
- The user can add up to 3 friends to play a game together.
- When the user clicks invite, a timer starts where the other users are expected to join.
- If at least 2 users (including the host) are available by the end of the timer, the user is redirected to the /game page with a unique room id that is shared between the invited users.
*/

export function JoinGameCard() {
  const [activeTab, setActiveTab] = useState<
    "join-random-game" | "create-game"
  >("create-game");

  const activeButtonStyle = "bg-primary text-primary-foreground";
  const inactiveButtonStyle =
    "bg-slate-200 text-slate-500 hover:bg-amber-300 hover:text-white";

  return (
    <Card className="w-full h-full">
      <CardContent className="w-full">
        <div className="border-b pt-6">
          <div className="flex gap-2">
            <Button
              type="button"
              className={
                activeTab === "create-game"
                  ? activeButtonStyle
                  : inactiveButtonStyle
              }
              onClick={() => setActiveTab("create-game")}
            >
              Create a room
            </Button>
            <Button
              type="button"
              className={
                activeTab === "join-random-game"
                  ? activeButtonStyle
                  : inactiveButtonStyle
              }
              onClick={() => setActiveTab("join-random-game")}
            >
              Join a random room
            </Button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === "create-game" ? <CreateGame /> : <JoinRandomGame />}
        </div>
      </CardContent>
    </Card>
  );
}
