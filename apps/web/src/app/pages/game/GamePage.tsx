import { useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import background from "@/assets/backgrounds/unocards_gemini.png";

import { useGamePage } from "./hooks/useGamePage";
import PlayerList from "./components/PlayerList";
import StartGameButton from "./components/StartGameButton";
import PhaserGame from "@/gameCanvas/PhaserGame";
import GamePageError from "./components/GamePageError";
import RoomCode from "./components/RoomCode";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import GameInterrupted from "./components/GameInterrupted";

import ChatContainer from "./components/Chat/ChatContainer";

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room");

  if (!roomName) return <Navigate to="/" replace />;

  return <GamePageContent roomName={roomName} />;
}

function GamePageContent({ roomName }: { roomName: string }) {
  const {
    playerInfo,
    playerList,
    gameStarted,
    gameOver,
    canvasError,
    roomError,
  } = useGamePage(roomName);

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
        {/*  Sidebar column */}
        <div className="flex flex-col gap-[clamp(0.75rem,1.5vw,1rem)] order-2 lg:order-0 px-[clamp(0.5rem,2vw,2.5rem)] lg:px-0 min-w-0 min-h-0 overflow-hidden self-start lg:self-stretch">
          <RoomCode
            gameStarted={gameStarted}
            gameOver={gameOver}
            roomName={roomName}
          />

          <div className="items-center gap-[clamp(0.5rem,1vw,1rem)] rounded-xl border bg-white shadow-sm p-[clamp(0.75rem,1.5vw,1.5rem)]">
            <PlayerList
              playerList={playerList}
              clientUsername={playerInfo?.userName}
              gameOver={gameOver}
            />
            <StartGameButton
              gameStarted={gameStarted}
              canvasError={canvasError}
              gameOver={gameOver}
            />
            {/*  Chat button (mobile only, above player list)  */}
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vw,0.75rem)] text-[clamp(0.75rem,1vw,0.875rem)] font-semibold text-white shadow-md hover:bg-rose-400 transition"
            >
              <ChatBubbleLeftIcon className="size-[clamp(1rem,1.5vw,1.25rem)]" />
              Show Chat
            </button>
          </div>
          <ChatContainer
            chatOpen={chatOpen}
            setChatOpen={setChatOpen}
          />
        </div>

        {/*  Right bar Game canvas (top on mobile via order-1, right column on desktop via natural flow)  */}

        <div className="flex flex-col order-1 lg:order-0 h-full w-full min-h-0 min-w-0">
          {gameOver === null ? (
            <PhaserGame />
          ) : (
            <GameInterrupted
              reason={gameOver?.reason}
              winnerId={gameOver?.winnerId}
              playerId={playerInfo?.playerId}
              roomName={roomName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
