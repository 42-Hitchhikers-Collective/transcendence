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
      className="bg-neutral-800 flex flex-col relative h-screen overflow-hidden py-4 md:py-8 lg:py-10 px-2 md:px-6 lg:px-12"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backgroundBlendMode: "saturation",
      }}
    >
      <div className="grid flex-1 min-h-0 w-full max-w-7xl 2xl:max-w-[90vw] mx-auto grid-cols-1 grid-rows-[auto_1fr] lg:grid-rows-1 lg:grid-cols-[30%_1fr] 2xl:grid-cols-[26%_1fr] gap-3 md:gap-4 lg:gap-6">
        {/*  Sidebar column */}
        <div className="flex flex-col gap-3 md:gap-4 order-2 lg:order-0 min-w-0 min-h-0 overflow-hidden self-start lg:self-stretch">
          <RoomCode
            gameStarted={gameStarted}
            gameOver={gameOver}
            roomName={roomName}
          />

          <div className="flex flex-col items-center gap-1 md:gap-2 rounded-xl border bg-white shadow-sm p-3 md:p-4 lg:p-6">
            <PlayerList
              playerList={playerList}
              clientUsername={playerInfo?.userName}
              gameOver={gameOver}
            />
            {/*  Chat button on its own row below Start Game button  */}
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="lg:hidden flex items-center rounded-lg bg-rose-500 px-5 md:px-5 py-2  text-sm md:text-base font-semibold text-white shadow-md hover:bg-rose-400 transition mt-3 md:mt-4 truncate max-w-full"
            >
              <ChatBubbleLeftIcon className="size-4 md:size-5 mr-2" />
              Chat
            </button>
            <StartGameButton
              gameStarted={gameStarted}
              canvasError={canvasError}
              gameOver={gameOver}
            />

          </div>
          <ChatContainer chatOpen={chatOpen} setChatOpen={setChatOpen} />
        </div>

        {/*  Right bar Game canvas (top on mobile via order-1, right column on desktop via natural flow)  */}

        <div className="flex flex-col order-1 lg:order-0 w-full max-w-250 2xl:max-w-1000 aspect-5/4 min-h-0 min-w-0">
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
