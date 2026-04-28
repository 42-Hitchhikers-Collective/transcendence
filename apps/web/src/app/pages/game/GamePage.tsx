import { Link } from "react-router";
import GameCanvas from "../../../gameCanvas/App";
// apps/web/src/gameCanvas/App.tsx
import { useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
};
function GamePage() {
  const players = useMemo<Player[]>(
    () => [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
      { id: "p3", name: "Charlie" },
      { id: "p4", name: "Diana" },
    ],
    [],
  );

  const [readyMap, setReadyMap] = useState<Record<string, boolean>>({
    p1: false,
    p2: false,
    p3: false,
    p4: false,
  });

  const allReady = players.every((player) => readyMap[player.id]);

  const toggleReady = (playerId: string) => {
    setReadyMap((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<string[]>([
    "Alice: Ready when you are.",
    "Bob: Testing chat!",
  ]);

  const sendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, `You: ${trimmed}`]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Game Lobby</h1>
          <div className="space-x-4 text-sm">
            <Link className="text-emerald-300 hover:text-emerald-200" to="/profile">
              Go back to profile
            </Link>
            <Link className="text-rose-300 hover:text-rose-200" to="/">
              Log out
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <section className="flex flex-col gap-6 rounded-3xl bg-slate-900/70 p-6 shadow-xl">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Players
              </h2>
              <div className="mt-4 space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-100">{player.name}</p>
                      <p className="text-xs text-slate-400">Ready to start</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleReady(player.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                        readyMap[player.id]
                          ? "bg-emerald-400/20 text-emerald-200"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {readyMap[player.id] ? "Ready" : "Not ready"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Lobby Chat
              </h2>
              <div className="mt-4 flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-950/60">
                <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
                  {messages.map((message, index) => (
                    <p key={index} className="text-slate-200">
                      {message}
                    </p>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-slate-800 px-3 py-2">
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
 <GameCanvas />
          {/* <section className="flex h-full min-h-[420px] flex-col justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-2xl">
            <div className="rounded-2xl border border-white/30 bg-white/15 p-6 text-center text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                Phaser Canvas
              </p>
              <h2 className="mt-2 text-2xl font-bold">GAME STARTS HERE</h2>
              <p className="mt-3 text-sm text-white/80">
                {allReady ? "🎉 GAME CAN NOW START, GAME LOADS 🎉" : "⏰ WAITING FOR ALL PLAYERS TO CLICK READY... ⏰"}
              </p>
            </div>
          </section> */}
        </div>
      </div>
    </div>
  );
}

export default GamePage;
