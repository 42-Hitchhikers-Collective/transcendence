import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket"; // adjust path if different
import cardBack from "@/assets/icons/uno_card_back.png";
import { useRoomState } from "@/gameCanvas/hooks/useRoomState";


function useTimeout(durationMs: number) {
  const [timeLeft, setTimeLeft] = useState<number>(durationMs);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => setIsRunning(true);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(durationMs);
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  return { timeLeft, isRunning, start, reset };
}


export function CreateGameCard() {
  const [isCreating, setIsCreating] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasActiveRoom, setHasActiveRoom] = useState<string | null>(null);
  const navigate = useNavigate();
  useRoomState(); // keep room state subscription for active-room updates

  const { timeLeft, isRunning, start, reset } = useTimeout(30_000);
  
  useEffect(() => {
  socket.on("leave_room", () => {
    console.log("Leave_room event received on CreateGameCard");
    setHasActiveRoom(null);
  });
  socket.on("error", handleError);
  socket.on("room_created", navigateToGameRoom);
  socket.on("active_room", handleActiveRoom);
  socket.emit("get_room_state");

  return () => {
    console.log("Unmounting CreateGameCard - removing socket listeners for error, room_created, active_room, leave_room");
    socket.off("error", handleError);
    socket.off("room_created", navigateToGameRoom);
    socket.off("active_room", handleActiveRoom);
    socket.off("leave_room"); // unsure
  };
}, []);

  useEffect(() => {

    
  }, []); // placeholder to avoid "defined but not used" warnings for now; we will use these in the ProfileSection component



const handleActiveRoom = (data: { roomName: string }) => {
  console.log(`[🦄SOCKET] active_room event received with data: ${JSON.stringify(data)}`);
  setHasActiveRoom(data.roomName);
};

const handleError = (err: { message: string }) => {
  console.log(`GAMECREATE SOCKET_ERROR: ${err.message}`);
  setError(err.message);
  setIsCreating(false);
};

const navigateToGameRoom = (data: { roomName: string }) => {
  setIsCreating(false);
  setError(null);
  navigate(`/game?room=${encodeURIComponent(data.roomName)}`);
};

  // Triggered by clicking "Start a room" button.
  const handleCreateRoom = () => {
    const name = roomNameInput.trim();
    if (!/^[\w-]{1,20}$/.test(name) || !name) {
      setError(
        "Invalid room name. Only letters allowed with a max length of 20",
      );
      return;
    }
    setError(null);
    setIsCreating(true);
    socket.emit("create_room", { roomName: name }); // emits signal to create room
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room");
    setHasActiveRoom(null);
  }

  return (
    <>
      {hasActiveRoom ? (
    
        <div 
        ref={(el) => { if (el && !isRunning) start(); }}
        className="relative h-full overflow-hidden rounded-2xl border border-rose-200 bg-linear-to-br from-rose-50 via-white to-amber-50 p-12 shadow-sm">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />

          <div className="relative flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="space-y-3">
              <h3 className="text-4xl font-extrabold tracking-tight text-slate-900">
               Aren't you forgetting something?
              </h3>
             <p>{timeLeft / 1000}s</p>
              <p className="mx-auto max-w-xl text-lg text-slate-600">
                Your friends are waiting for you in room "<span className="text-rose-500">{hasActiveRoom}</span>" ! <br/>
                You won&apos;t be able to join or create a new room until you leave this one for good, decide wisely...
              </p>
            </div>

            <div className="flex flex-row items-center justify-center gap-4 py-10">
              <button
                type="button"
                onClick={() => navigate(`/game?room=${encodeURIComponent(hasActiveRoom)}`)}
                className="h-12 rounded-lg bg-emerald-500 px-8 text-lg font-semibold text-white hover:opacity-90"
              >
                Rejoin room
              </button>
              <button
                type="button"
                onClick={() => handleLeaveRoom()}
                className="h-12 rounded-lg bg-rose-500 px-8 text-lg font-semibold text-white hover:opacity-90"
              >
                Leave room
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-full overflow-hidden rounded-2xl border bg-linear-to-br from-rose-50 via-white to-amber-50 p-12">
          <style>{styles}</style>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />

          <div className="relative flex h-full flex-col items-center justify-center gap-8 p-24">
            <div
              className={`fan-wrapper${isCreating ? " is-active" : ""}`}
              style={
                { "--card-back": `url(${cardBack})` } as React.CSSProperties
              }
              aria-hidden="true"
            >
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className={`fan-card fan-card-${i + 1}`} />
              ))}
            </div>

            <div className="space-y-3 text-center">
              <h3 className="text-5xl font-extrabold tracking-tight text-slate-900">
                Start playing now
              </h3>
              <p className="max-w-xl text-lg text-slate-600">
                Pick a room name and share the link with a friend.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <input
                type="text"
                value={roomNameInput}
                onChange={(e) => setRoomNameInput(e.target.value)}
                placeholder="Room name"
                disabled={isCreating}
                className="h-12 w-72 rounded-lg border border-slate-300 px-4 text-lg"
              />

              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={isCreating || !roomNameInput.trim()}
                className="h-14 rounded-lg bg-rose-500 px-8 text-lg font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Loading room..." : "Create room"}
              </button>

              {error && <p className="text-sm text-rose-600">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = `
.fan-wrapper {
  position: relative;
  width: 320px;
  height: 240px;
}

.fan-card {
  position: absolute;
  width: 128px;
  height: 192px;
  left: 96px;
  top: 24px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: var(--card-back) center / cover no-repeat;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.12);
  transform-origin: 50% 90%;
  transform: rotate(0deg) translateY(0);
}

.fan-card-1 { z-index: 1; }
.fan-card-2 { z-index: 2; }
.fan-card-3 { z-index: 3; }
.fan-card-4 { z-index: 4; }
.fan-card-5 { z-index: 5; }
.fan-card-6 { z-index: 6; }
.fan-card-7 { z-index: 7; }

.fan-wrapper.is-active .fan-card {
  animation: fan-open-close 1.6s ease-in-out infinite;
}

.fan-wrapper.is-active .fan-card-1 { animation-delay: 0s; }
.fan-wrapper.is-active .fan-card-2 { animation-delay: 0.04s; }
.fan-wrapper.is-active .fan-card-3 { animation-delay: 0.08s; }
.fan-wrapper.is-active .fan-card-4 { animation-delay: 0.12s; }
.fan-wrapper.is-active .fan-card-5 { animation-delay: 0.16s; }
.fan-wrapper.is-active .fan-card-6 { animation-delay: 0.2s; }
.fan-wrapper.is-active .fan-card-7 { animation-delay: 0.24s; }

@keyframes fan-open-close {
  0% {
    transform: rotate(0deg) translateY(0);
  }
  45% {
    transform: rotate(var(--fan-angle, 0deg)) translateY(-4px);
  }
  100% {
    transform: rotate(0deg) translateY(0);
  }
}

.fan-card-1 { --fan-angle: -30deg; }
.fan-card-2 { --fan-angle: -20deg; }
.fan-card-3 { --fan-angle: -10deg; }
.fan-card-4 { --fan-angle: 0deg; }
.fan-card-5 { --fan-angle: 10deg; }
.fan-card-6 { --fan-angle: 20deg; }
.fan-card-7 { --fan-angle: 30deg; }
`;
