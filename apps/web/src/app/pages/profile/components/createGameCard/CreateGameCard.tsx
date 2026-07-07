import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";
import { useRoomState } from "@/gameCanvas/hooks/useRoomState";
import PendingGameCard from "./PendingGameCard/PendingGameCard";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import { cn } from "@/shared/lib/utils";

export function CreateGameCard() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [isCreating, setIsCreating] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasPendingRoom, setHasPendingRoom] = useState<string | null>(null);
  const navigate = useNavigate();
  useRoomState();

  // Join room state
  const [joinRoomName, setJoinRoomName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null); // keep room state subscription for active-room updates

  useEffect(() => {
    // TODO: leave rooms mostly may not riun because new socket of the player is not connected
    socket.on("leave_room", () => {
      console.log("Leave_room event received on CreateGameCard");
      setHasPendingRoom(null);
    });
    socket.on("error", handleError);
    socket.on("player_info_response", handlePlayerInfo);

    socket.emit("player_info_request");

    return () => {
      socket.off("leave_room");
      socket.off("error", handleError);
      socket.off("player_info_response", handlePlayerInfo);
    };
  }, []);

  useEffect(() => {
    if (!hasPendingRoom) {
      console.log(
        "User has no pending room: room was pending or dropout timer just expired.",
      );
    } else {
      console.warn(
        `⏰ User has a pending active room: ${hasPendingRoom}. \n They can rejoin as long as the dropout timer is active.`,
      );
    }
  }, [hasPendingRoom]); // placeholder to avoid "defined but not used" warnings for now; we will use these in the ProfileSection component

  const handlePlayerInfo = (data: any) => {
    // prints json data in a readable format without needing to remember the structure of the data object

    console.log(
      `🃏 CREATE GAME CARD: Player info received:\n` +
        Object.entries(data)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join("\n"),
    );

    // Only show rejoin card if player is in an active (not finished) room
    if (data.activeRoom && data.activeRoom !== null) {
      setHasPendingRoom(data.activeRoom.roomName);
    }
  };

  // Used for handling room creation errors only
  const handleError = (err: { message: string }) => {
    console.log(`GAMECREATE SOCKET_ERROR: ${err.message}`);
    setError(err.message);
    setIsCreating(false);
  };

  // Navigates to game room after successful creation
  const navigateToGameRoom = (data: { roomName: string }) => {
    setIsCreating(false);
    setError(null);
    navigate(`/game?room=${encodeURIComponent(data.roomName)}`);
  };

  // Ref to store timeout ID for cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCreateRoom = () => {
    const name = roomNameInput.trim();
    if (!/^[\w-]{1,20}$/.test(name) || !name) {
      setError(
        "Invalid room name. Only letters allowed with a max length of 20",
      );
      return;
    }
    socket.emit("create_room", { roomName: name });
    setIsCreating(true);
    // Delay used to ensure backend has time to process room creation to load
    timeoutRef.current = setTimeout(() => {
      navigateToGameRoom({ roomName: name });
      timeoutRef.current = null;
    }, 2000);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room");
    setHasPendingRoom(null);
  };

  const handleJoinRoom = () => {
    const name = joinRoomName.trim();
    if (!/^[\w-]{1,20}$/.test(name) || !name) {
      setJoinError(
        "Invalid room name. Only letters allowed with a max length of 20",
      );
      return;
    }
    setIsJoining(true);
    setJoinError(null);
    // Check if room exists before navigating
    socket.emit("is_room_exists", { roomName: name });
    socket.once("room_exists_response", ({ roomName, exists }) => {
      if (exists) {
        navigate(`/game?room=${encodeURIComponent(roomName)}`);
      } else {
        setJoinError("Room not found. Check the name and try again.");
        setIsJoining(false);
      }
    });
  };

  return (
    <>
      {hasPendingRoom ? (
        <PendingGameCard
          activeRoomName={hasPendingRoom}
          onRejoin={() =>
            navigate(`/game?room=${encodeURIComponent(hasPendingRoom)}`)
          }
          onLeave={handleLeaveRoom}
        />
      ) : (
        <div className="relative h-full flex flex-col overflow-hidden rounded-2xl">
          {/* Decorative smudgy blobs */}

          {/* Segmented control bar */}
          <div className="flex justify-center mb-[clamp(0.75rem,1.2vw,1.5rem)] min-[450px]:mb-[clamp(1rem,2vw,2rem)] lg:mb-[clamp(0.75rem,1.2vw,1.5rem)]">
            <div className="inline-flex rounded-2xl bg-slate-800/90 backdrop-blur-sm p-1 shadow-xl shadow-slate-900/20 ring-1 ring-white/10">
              {/* Create */}
              <button
                onClick={() => setActiveTab("create")}
                className={cn(
                  "relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                  activeTab === "create"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "text-slate-400 hover:text-white",
                )}
              >
                Start a new game
              </button>

              {/* Join */}
              <button
                onClick={() => setActiveTab("join")}
                className={cn(
                  "relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                  activeTab === "join"
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                    : "text-slate-400 hover:text-white",
                )}
              >
                Join a game
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === "create" ? (
            <CreateRoom
              roomNameInput={roomNameInput}
              onRoomNameChange={setRoomNameInput}
              isCreating={isCreating}
              error={error}
              onCreateRoom={handleCreateRoom}
            />
          ) : (
            <JoinRoom
              roomNameInput={joinRoomName}
              onRoomNameChange={setJoinRoomName}
              isJoining={isJoining}
              error={joinError}
              onJoinRoom={handleJoinRoom}
            />
          )}
        </div>
      )}
    </>
  );
}
