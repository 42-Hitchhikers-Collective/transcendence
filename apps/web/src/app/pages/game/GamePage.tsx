import { Navigate, useSearchParams } from "react-router";
import background from "@/assets/backgrounds/unocards_gemini.png";

import Chat from "./components/Chat";
import { useGamePage } from "./hooks/useGamePage";
import PlayerList from "./components/PlayerList";
import StartGameButton from "./components/StartGameButton";
import PhaserGame from "@/gameCanvas/PhaserGame";
import GamePageError from "./components/GamePageError";
import RoomCode from "./components/RoomCode";

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room");

  if (!roomName) return <Navigate to="/" replace />;

  return <GamePageContent roomName={roomName} />;
}

function GamePageContent({ roomName }: { roomName: string }) {
  const { playerInfo, playerList, gameStarted, canvasError, roomError } =
    useGamePage(roomName);

  if (roomError) {
    return (
      <GamePageError roomError={roomError} />
    );
  }

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
      <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[500px_1fr]">

        <div className="flex flex-col min-h-0 overflow-hidden">
          <RoomCode gameStarted={gameStarted} roomName={roomName} />
          <div className="mt-4 items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
          <PlayerList
            playerList={playerList}
            clientUsername={playerInfo?.userName}
            />

          <StartGameButton gameStarted={gameStarted} canvasError={canvasError} />
            </div>
          <Chat playerList={playerList} />
        </div>
        

        {/* <div className="min-h-0"> */}
          <PhaserGame />
        {/* </div> */}
      
      </div>
      <div className="mt-6 flex justify-end">
        <div className="max-w-md">{/* <Footer /> */}</div>
      </div>
    </div>
  );
}


