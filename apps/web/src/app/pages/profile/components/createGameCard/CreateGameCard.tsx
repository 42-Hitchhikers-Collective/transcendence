import { useEffect, useMemo, useState } from "react";
import cardBack from "@/assets/icons/uno_card_back.png";

export function CreateGameCard() {
  const [isCreating, setIsCreating] = useState(false);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const link = useMemo(() => {
    if (!roomName) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/game?room=${encodeURIComponent(roomName)}`;
  }, [roomName]);

  useEffect(() => {
    if (!link) return;
    if (typeof window === "undefined") return;
    window.location.assign(link);
  }, [link]);

  const handleCreate = () => {
    setIsCreating(true);
    setRoomName(null);

    const id = `room-${Math.random().toString(36).slice(2, 8)}`;
    window.setTimeout(() => {
      setRoomName(id);
      setIsCreating(false);
    }, 700);
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
          <div className="fan-card fan-card-1" />
          <div className="fan-card fan-card-2" />
          <div className="fan-card fan-card-3" />
          <div className="fan-card fan-card-4" />
          <div className="fan-card fan-card-5" />
          <div className="fan-card fan-card-6" />
          <div className="fan-card fan-card-7" />
        </div>
      

        <div className="space-y-3">
          <h3 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Start playing now
          </h3>
          <p className="max-w-xl text-lg text-slate-600">
            Create a private room link and jump straight into the game. We will
            redirect you as soon as the room is ready.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-14 rounded-lg bg-rose-500 px-8 text-lg font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? "Creating room..." : "Play Uno"}
          </button>
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
