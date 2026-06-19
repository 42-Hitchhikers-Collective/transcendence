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
    return <GamePageError roomError={roomError} />;
  }

  return (
    <div
      className="bg-neutral-800 overflow-auto h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backgroundBlendMode: "saturation",
      }}
    >
      <div className="grid h-full w-full max-w-7xl grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[30%_1fr]">
        {/* left col */}
        <div className="flex py-10 flex-col min-h-0 overflow-hidden order-2 lg:order-1">
          <RoomCode gameStarted={gameStarted} roomName={roomName} />
          <div className="mt-4 items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
            <PlayerList
              playerList={playerList}
              clientUsername={playerInfo?.userName}
            />
            <StartGameButton
              gameStarted={gameStarted}
              canvasError={canvasError}
            />
          </div>
          <Chat playerList={playerList} />
        </div>
          {/* Right col */}
        <div className="flex flex-col  order-1 lg:order-2 min-h-300px lg:min-h-0"> {/*  bg-amber-500 */}
          <PhaserGame />
        </div>
      </div>
    </div>
  );
}
