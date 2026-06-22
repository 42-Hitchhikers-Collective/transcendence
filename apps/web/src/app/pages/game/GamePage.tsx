import { Navigate, useSearchParams } from "react-router";
import background from "@/assets/backgrounds/unocards_gemini.png";

import Chat from "./components/Chat";
import { useGamePage } from "./hooks/useGamePage";
import PlayerList from "./components/PlayerList";
import StartGameButton from "./components/StartGameButton";
import PhaserGame from "@/gameCanvas/PhaserGame";
import GamePageError from "./components/GamePageError";
import RoomCode from "./components/RoomCode";
import GameOver from "./components/GameOver";
import LonelyPlayerOverlay from "./components/LonelyPlayerOverlay";

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room");

  if (!roomName) return <Navigate to="/" replace />;

  return <GamePageContent roomName={roomName} />;
}

function GamePageContent({ roomName }: { roomName: string }) {
  const { playerInfo, playerList, gameStarted, gameOver, roomId, canvasError, roomError } =
    useGamePage(roomName);

  if (roomError) {
    return <GamePageError roomError={roomError} />;
  }

  return (
    <div
      className="bg-neutral-800 overflow-auto min-h-screen flex flex-col relative  py-6"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backgroundBlendMode: "saturation",
      }}
    >
      <div className="grid min-h-full w-full max-w-7xl mx-auto grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[30%_1fr] ">
        {/* left col */}
        <div className="flex flex-col gap-4 min-h-0 overflow-hidden order-2 px-10 lg:px-0 lg:order-1">
          <RoomCode gameStarted={gameStarted} roomName={roomName} />
          <div className="items-center gap-4 rounded-xl border bg-white shadow-sm p-6">
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
        <div className="flex flex-col  order-1 lg:order-2 min-h-300px  lg:min-h-0"> {/*  bg-amber-500 */}
          <PhaserGame />
        </div>
      </div>
      {gameOver?.reason === "finished" && (
        <GameOver isWinner={playerInfo?.playerId === gameOver.winnerId} />
      )}
      {gameOver?.reason === "lonely" && roomId && <LonelyPlayerOverlay roomId={roomId} />}
    </div>
  );
}
