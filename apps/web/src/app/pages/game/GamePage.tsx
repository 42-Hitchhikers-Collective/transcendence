import { useState } from "react";
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
import { ChatBubbleLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room");

  if (!roomName) return <Navigate to="/" replace />;

  return <GamePageContent roomName={roomName} />;
}

function GamePageContent({ roomName }: { roomName: string }) {
  const { playerInfo, playerList, gameStarted, gameOver, roomId, canvasError, roomError } =
    useGamePage(roomName);

  const [chatOpen, setChatOpen] = useState(false);

  if (roomError) {
    return <GamePageError roomError={roomError} />;
  }

  return (
    <div
      className="bg-neutral-800 flex flex-col relative h-screen overflow-hidden py-[clamp(1rem,2vw,2.5rem)] px-[clamp(0.5rem,2vw,3rem)]"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backgroundBlendMode: "saturation",
      }}
    >
      <div className="grid flex-1 min-h-0 w-full max-w-7xl 2xl:max-w-[90vw] mx-auto grid-cols-1 grid-rows-[1fr_auto] lg:grid-rows-1 lg:grid-cols-[30%_1fr] 2xl:grid-cols-[26%_1fr] gap-[clamp(0.75rem,1.5vw,1.5rem)]">
        {/* ── Sidebar column (always visible) ──
             Placed first in DOM so natural flow = desktop (col 1).
             order-2 pushes it below canvas on mobile. */}
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1rem)] order-2 lg:order-0 px-[clamp(0.5rem,2vw,2.5rem)] lg:px-0 min-w-0 min-h-0 overflow-hidden self-start lg:self-stretch">
          <RoomCode gameStarted={gameStarted} roomName={roomName} />

          {/* ── Chat button (mobile only, above player list) ── */}
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(0.75rem,1vw,0.875rem)] font-semibold text-white shadow-md hover:bg-rose-400 transition"
          >
            <ChatBubbleLeftIcon className="size-[clamp(1rem,1.5vw,1.25rem)]" />
            Chat
          </button>

          <div className="items-center gap-[clamp(0.5rem,1vw,1rem)] rounded-xl border bg-white shadow-sm p-[clamp(0.75rem,1.5vw,1.5rem)]">
            <PlayerList
              playerList={playerList}
              clientUsername={playerInfo?.userName}
            />
            <StartGameButton
              gameStarted={gameStarted}
              canvasError={canvasError}
            />
          </div>

          {/* ── Inline chat (desktop only) ── */}
          <div className="hidden lg:flex flex-1 min-h-0 min-w-0">
            <Chat playerList={playerList} />
          </div>
        </div>

        {/* ── Game canvas (top on mobile via order-1, right column on desktop via natural flow) ── */}

        <div className="flex flex-col order-1 lg:order-0 h-full w-full min-h-0 min-w-0">
          {gameOver?.reason === "finished" ? (
            <GameOver isWinner={playerInfo?.playerId === gameOver.winnerId} />
          ) : gameOver?.reason === "lonely" && roomId ? (
            <LonelyPlayerOverlay roomId={roomId} />
          ) : (
            <PhaserGame />
          )}
        </div>
      </div>
      {/* ── Chat popup overlay (mobile only) ── */}
      {chatOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-[clamp(1rem,3vw,2rem)]">
          <div className="w-full max-w-md max-h-[85vh] relative">
            {/* ── Red X close button, outside the box, top-right ── */}
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="absolute -top-[clamp(1.5rem,3vw,2.5rem)] -right-[clamp(0.25rem,0.5vw,0.5rem)] z-10 rounded-full bg-red-500 p-[clamp(0.35rem,0.6vw,0.5rem)] text-white shadow-lg hover:bg-red-400 transition"
              aria-label="Close chat"
            >
              <XMarkIcon className="size-[clamp(1.25rem,2vw,1.5rem)]" />
            </button>
            <Chat playerList={playerList} />
          </div>
        </div>
      )}
    </div>
  );
}
