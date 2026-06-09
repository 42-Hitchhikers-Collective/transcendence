import { Navigate, useSearchParams } from "react-router";

import Chat from "./components/Chat";
import { useGamePage } from "./hooks/useGamePage";
import GameWindow from "./components/GameWindow";
import { useEffect } from "react";
import PhaserGame from "@/gameCanvas/PhaserGame";



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
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Players ({players.length})
              </h2>
              <div className="mt-4 space-y-3">
                {players.map((player, index) => 
                 (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-100">
                        {player} {player === playerInfo?.userName && "(you)"}
                      </p>
                      {/* <p className="text-xs text-slate-400">Ready to start</p> */}
                    </div>
                  </div>
                )
                )}
                {players.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Waiting for the room state to load...
                  </p>
                )}
              </div>
            </div>

            <Chat />
         <button
            onClick={startGame}
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
