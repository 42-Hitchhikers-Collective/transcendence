import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket"; // adjust path if different
import cardBack from "@/assets/icons/uno_card_back.png";

export function CreateGameCard() {
  const [isCreating, setIsCreating] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  const onCreated = (data: { roomName: string }) => {
    console.log("[CreateGame] room_created received from server:", data);
    setIsCreating(false);
    console.log("[CreateGame] navigating to /game?room=" + data.roomName);
    navigate(`/game?room=${encodeURIComponent(data.roomName)}`);
  };
  const onError = (data: { message: string }) => {
    console.warn("[CreateGame] error event from server:", data);
    setIsCreating(false);
    setError(data.message);
  };

  console.log("[CreateGame] mounting, registering socket listeners");
  socket.on("room_created", onCreated);
  socket.on("error", onError);

  return () => {
    console.log("[CreateGame] unmounting, removing socket listeners");
    socket.off("room_created", onCreated);
    socket.off("error", onError);
  };
}, [navigate]);

const handleCreate = () => {
  const name = roomNameInput.trim();
  console.log("[CreateGame] handleCreate clicked, input:", JSON.stringify(roomNameInput), "→ trimmed:", JSON.stringify(name));

  if (!name) {
    console.warn("[CreateGame] empty name, aborting");
    setError("Room name required");
    return;
  }

  setError(null);
  setIsCreating(true);

  if (!socket.connected) {
    console.log("[CreateGame] socket not connected, calling socket.connect()");
    socket.connect();
  } else {
    console.log("[CreateGame] socket already connected, id:", socket.id);
  }

  console.log("[CreateGame] emitting create_room with roomName:", name);
  socket.emit("create_room", { roomName: name });
};
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border bg-gradient-to-br from-rose-50 via-white to-amber-50 p-12">
      <style>{styles}</style>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />

      <div className="relative flex h-full flex-col items-center justify-center gap-8 p-24">
        <div
          className={`fan-wrapper${isHovered ? " is-active" : ""}`}
          style={{ "--card-back": `url(${cardBack})` } as React.CSSProperties}
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
            onClick={handleCreate}
            disabled={isCreating || !roomNameInput.trim()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-14 rounded-lg bg-rose-500 px-8 text-lg font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "Start a room"}
          </button>

          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
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
