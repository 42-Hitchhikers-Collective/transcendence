import { useEffect, useState } from "react";
import { Link, useSearchParams, Navigate, useNavigate } from "react-router";
import GameCanvas from "../../../gameCanvas/App";
import { socket } from "@/socket/Socket";
import { useRoomState } from "@/gameCanvas/hooks/useRoomState";

import { useLocation } from "react-router";


export default function GamePage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room");
  const navigate = useNavigate();
  
  // const location = useLocation();
  // const hasActiveRoom = location.state?.hasActiveRoom;

  // Guard: no room id means no game
  if (!roomName) return <Navigate to="/" replace />;

  // Subscribe to live room state from server
  const room = useRoomState();
  const players = room?.players ?? [];

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  // On mount, ensure socket is connected and we are in the room.
  // join_room is unchanged on the backend: if you are already a member
  // (because you are the room creator), it succeeds without side effects.
  useEffect(() => {
    
  socket.on("active_room", handleActiveRoom);
  socket.emit("get_room_state");
    socket.emit("join_room", { roomName });

    const handleError = (payload: { message?: string }) => {
      if (payload?.message === "Room not found") {
        navigate("/profile", { replace: true });
      }
    };

    socket.on("error", handleError);

    return () => {
      socket.off("error", handleError);
      socket.emit("user_dropped"); // <-- tell the backend when the use leaved the page but we don't want to kick them out of the room yet
      // Leaving the game page should remove the player from the room list.
      console.log("[GamePage] leaving room", roomName);
      // socket.emit("leave_room"); // <---- leaves the room


      // on unmount we  do 
    };
  }, [navigate, roomName]);

  useEffect(() => {
    const handleChatMessage = (data: { msg: string; senderId?: string }) => {
      const prefix = data.senderId ? `${data.senderId}: ` : "";
      setMessages((prev) => [...prev, `${prefix}${data.msg}`]);
    };

    socket.on("chat_message", handleChatMessage);

    return () => {
      socket.off("chat_message", handleChatMessage);
    };
  }, []);


   const handleActiveRoom = (data: { roomName: string }) => {
    console.log(`[GamePage] active_room: ${data.roomName} room from url ${roomName}`);
    if (data.roomName !== roomName) {
      console.warn(`[GamePage] active_room mismatch! url: ${roomName} payload: ${data.roomName}`);
       navigate("/profile", { replace: true });
      // This can happen if the player creates a room, then tries to access the game page before the backend has processed the room creation and updated the player's active room. In this case, we can just ignore the mismatch and wait for the correct active_room event to arrive.
    }
  };

  const sendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    socket.emit("send_msg", { msg: trimmed });
    setChatInput("");
  };

  const toggleReady = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    // Only let the observer toggle their OWN ready state
    if (!player.isTheObserver) return;
    socket.emit("set_ready", { isReady: !player.isReady });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Game Lobby ({roomName})
          </h1>
          <div className="space-x-4 text-sm">
            <Link
              className="text-emerald-300 hover:text-emerald-200"
              to="/profile"
            >
              Go back to profile
            </Link>
            <Link className="text-rose-300 hover:text-rose-200" to="/">
              Log out
            </Link>
          </div>
        </div> */}

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <section className="flex flex-col gap-6 rounded-3xl bg-slate-900/70 p-6 shadow-xl">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Players ({players.length})
              </h2>
              <div className="mt-4 space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-100">
                        {player.userName}
                        {player.isTheObserver && " (you)"}
                      </p>
                      <p className="text-xs text-slate-400">Ready to start</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleReady(player.id)}
                      disabled={!player.isTheObserver}
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                        player.isReady
                          ? "bg-emerald-400/20 text-emerald-200"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {player.isReady ? "Ready" : "Not ready"}
                    </button>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Waiting for the room state to load...
                  </p>
                )}
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
                  {messages.length === 0 && (
                    <p className="text-slate-400">No messages yet.</p>
                  )}
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
        </div>
      </div>
    </div>
  );
}
