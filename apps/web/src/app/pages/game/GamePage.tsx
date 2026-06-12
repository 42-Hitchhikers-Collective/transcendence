import { Navigate, useSearchParams } from "react-router";

import Chat from "./components/ChatWindow/Chat";
import { useGamePage } from "./hooks/useGamePage";
import GameWindow from "./components/GameWindow/GameWindow";
import PhaserGame from "@/gameCanvas/PhaserGame";
import PlayerList from "./components/PlayerList/PlayerList";



export default function GamePage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room");

  if (!roomName) return <Navigate to="/" replace />;

  return <GamePageContent roomName={roomName} />;
}

function GamePageContent({ roomName }: { roomName: string }) {
  const { playerInfo, players, gameStarted, canvasError, startGame } =
    useGamePage(roomName);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <section className="flex flex-col gap-6 rounded-3xl bg-slate-900/70 p-6 shadow-xl">
            <PlayerList players={players} currentUserName={playerInfo?.userName} />
            <Chat />
         <button
            // onClick={startGame}
            onClick={() => {
              console.log(`[GamePage] Start Game button clicked`);
              startGame();
            }}
            disabled={gameStarted}
            className="mb-4 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white disabled:bg-gray-400"
          >
            Start Game
          </button>
          </section>
           <PhaserGame />
          {/* <GameWindow
            gameStarted={gameStarted}
            onStart={startGame}
            error={canvasError}
          /> */}
        </div>
      </div>
    </div>
  );
}
