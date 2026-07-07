import { useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";
import cardBack from "@/assets/icons/plus4.png";

type JoinCardProps = {
  roomNameInput: string;
  onRoomNameChange: (value: string) => void;
};

export default function JoinCard({
  roomNameInput,
  onRoomNameChange,
}: JoinCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    const name = roomNameInput.trim();
    if (!/^[\w-]{1,20}$/.test(name) || !name) {
      setErrorMessage(
        "Invalid room name. Only letters allowed with a max length of 20",
      );
      return;
    }

    // One-shot: listen for error on this specific join attempt
    socket.once("error", (err: { message: string }) => {
      setErrorMessage(err.message);
      setIsJoining(false);
    });

    // One-shot: listen for room existence response
    socket.once("room_exists_response", ({ roomName, exists }) => {
      if (exists) {
        // setIsJoining(false);
        // setErrorMessage(null);
        // navigate(`/game?room=${encodeURIComponent(roomName)}`);
        setTimeout(() => {
          console.log(`Room joined successfully: ${roomName}`);
          setIsJoining(false);
          setErrorMessage(null);
          navigate(`/game?room=${encodeURIComponent(roomName)}`);
        }, 2000);
      } else {
        setErrorMessage("Room not found. Check the name and try again.");
        setIsJoining(false);
      }
    });

    setIsJoining(true);
    setErrorMessage(null);
    socket.emit("is_room_exists", { roomName: name });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 p-6 md:p-10 rounded-2xl border bg-linear-to-br from-sky-50 via-white to-emerald-50">
      <style>{cardAnimation}</style>

      <div
        className="mx-auto mb-6 w-full"
        style={{ maxWidth: 320, height: 280 }}
      >
        <div
          className={`fan-wrapper${isJoining ? " is-active" : ""}`}
          style={{ "--card-back": `url(${cardBack})` } as React.CSSProperties}
          aria-hidden="true"
        >
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={`fan-card fan-card-${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Title + description */}
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">
          Join a room
        </h3>
        <p className="text-sm md:text-base text-slate-600 max-w-xs mx-auto mt-1">
          Enter a room code to join your friends.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-xs mx-auto">
        <input
          type="text"
          value={roomNameInput}
          onChange={(e) => onRoomNameChange(e.target.value)}
          placeholder="Paste room name here.."
          disabled={isJoining}
          className="h-12 w-full text-slate-300 bg-white rounded-lg border border-slate-100 px-4 text-sm md:text-base outline-none mb-3 block"
        />
        <button
          type="button"
          onClick={handleJoinRoom}
          disabled={isJoining || !roomNameInput.trim()}
          className="h-12 w-full rounded-lg bg-sky-500 font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-60 text-sm md:text-base block"
        >
          {isJoining ? "Joining..." : "Join"}
        </button>
        {errorMessage && (
          <p className="text-sm text-rose-600 font-medium mt-2 text-center">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

const cardAnimation = `
.fan-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: center center;
  overflow: hidden;
}

.fan-card {
  position: absolute;
  width: 128px;
  height: 192px;
  left: calc(50% - 64px);
  top: calc(50% - 96px);
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: var(--card-back) center / cover no-repeat;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.12);
  transform-origin: 50% 90%;
}
.fan-card-1 { z-index:1; --fan-angle:-30deg; }
.fan-card-2 { z-index:2; --fan-angle:-20deg; }
.fan-card-3 { z-index:3; --fan-angle:-10deg; }
.fan-card-4 { z-index:4; --fan-angle:0deg; }
.fan-card-5 { z-index:5; --fan-angle:10deg; }
.fan-card-6 { z-index:6; --fan-angle:20deg; }
.fan-card-7 { z-index:7; --fan-angle:30deg; }

.fan-wrapper.is-active .fan-card { animation: fan-open-close 1.6s ease-in-out infinite; }
.fan-wrapper.is-active .fan-card-1 { animation-delay: 0s; }
.fan-wrapper.is-active .fan-card-2 { animation-delay: 0.04s; }
.fan-wrapper.is-active .fan-card-3 { animation-delay: 0.08s; }
.fan-wrapper.is-active .fan-card-4 { animation-delay: 0.12s; }
.fan-wrapper.is-active .fan-card-5 { animation-delay: 0.16s; }
.fan-wrapper.is-active .fan-card-6 { animation-delay: 0.2s; }
.fan-wrapper.is-active .fan-card-7 { animation-delay: 0.24s; }

@keyframes fan-open-close {
  0%   { transform: rotate(0deg) translateY(0); }
  45%  { transform: rotate(var(--fan-angle, 0deg)) translateY(-4px); }
  100% { transform: rotate(0deg) translateY(0); }
}
`;
