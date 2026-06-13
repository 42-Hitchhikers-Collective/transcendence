import { Navigate, useSearchParams } from "react-router";
import { useState } from "react";
import background from "@/assets/backgrounds/unocards_gemini.png";

import Chat from "./components/ChatWindow/Chat";
import { useGamePage } from "./hooks/useGamePage";
import PlayerList from "./components/PlayerList/PlayerList";
import StartGameButton from "./components/StartGameButton";
import PhaserGame from "@/gameCanvas/PhaserGame";

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room");

  if (!roomName) return <Navigate to="/" replace />;

  return <GamePageContent roomName={roomName} />;
}

function GamePageContent({ roomName }: { roomName: string }) {
  const { playerInfo, players, gameStarted, canvasError, roomError, playerAvatars } =
    useGamePage(roomName);

  if (roomError) {
    return (
      <div
        className="flex h-screen items-center justify-center bg-neutral-800"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "saturation",
        }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-12 shadow-sm text-center">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="relative space-y-4">
            <p className="text-lg font-semibold text-slate-900">Error</p>
            <p className="text-slate-600">{roomError}</p>
            <a
              href="/profile"
              className="inline-block rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              Back to Profile
            </a>
          </div>
        </div>
      </div>
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
      {/* <div className="flex items-start justify-end gap-4 p-4">
        <button
          type="button"
          onClick={logout}
          className="rounded-full border-2 border-slate-100/20 bg-gray-400 px-4 py-2 text-xs font-semibold uppercase text-white shadow-sm transition hover:bg-red-500"
        >
          Logout
        </button>
      </div> */}
      {/* <ProfileSection user={user} stats={stats} onLogout={logout} /> */}
      <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        
        <div className="flex flex-col min-h-0 overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 shadow-sm">
          <PlayerList
            players={players}
            currentUserName={playerInfo?.userName}
            playerAvatars={playerAvatars}
          />
          <StartGameButton disabled={gameStarted} canvasError={canvasError} />
          <RoomInfo roomName={roomName} />
          <Chat playerAvatars={playerAvatars} />
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

function RoomInfo({ roomName }: { roomName: string }) {
  const [copied, setCopied] = useState(false);

  const copyRoomName = async () => {
    await navigator.clipboard.writeText(roomName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-white/60 px-4 py-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
        Room Code
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Share this with friends so they can join
      </p>
      <button
        onClick={copyRoomName}
        className="mt-2 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-center text-lg font-bold tracking-wider text-slate-800 hover:bg-rose-50 transition"
      >
        {roomName}
      </button>
      {copied && (
        <p className="mt-1 text-xs text-emerald-500">Copied!</p>
      )}
    </div>
  );
}
