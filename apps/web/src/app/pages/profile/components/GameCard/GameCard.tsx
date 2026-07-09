import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";
import { useRoomState } from "@/gameCanvas/hooks/useRoomState";
import PendingCard from "./CardTypes/PendingCard";
import CreateCard from "./CardTypes/CreateCard";
import JoinRoom from "./CardTypes/JoinCard";
import { cn } from "@/shared/lib/utils";

export function GameCard() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [roomNameInput, setRoomNameInput] = useState("");
  const [hasPendingRoom, setHasPendingRoom] = useState<string | null>(null);
  const navigate = useNavigate();
  useRoomState();

  // Join room state
  const [joinRoomName, setJoinRoomName] = useState("");

  useEffect(() => {
    socket.on("leave_room", () => {
      // console.log("Leave_room event received on GameCard");
      setHasPendingRoom(null);
    });
    socket.on("player_info_response", handlePlayerInfo);
    socket.emit("player_info_request");

    return () => {
      socket.off("leave_room");
      socket.off("player_info_response", handlePlayerInfo);
    };
  }, []);

  useEffect(() => {
    if (!hasPendingRoom) {
      // console.log(
      //   "User has no pending room: room was pending or dropout timer just expired.",
      // );
    } else {
      console.warn(
        `⏰ User has a pending active room: ${hasPendingRoom}. \n They can rejoin as long as the dropout timer is active.`,
      );
    }
  }, [hasPendingRoom]); // placeholder to avoid "defined but not used" warnings for now; we will use these in the ProfileSection component

  const handlePlayerInfo = (data: any) => {
    // prints json data in a readable format without needing to remember the structure of the data object

    // console.log(
    //   `🃏 CREATE GAME CARD: Player info received:\n` +
    //     Object.entries(data)
    //       .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    //       .join("\n"),
    // );

    // Only show rejoin card if player is in an active (not finished) room
    if (data.activeRoom && data.activeRoom !== null) {
      setHasPendingRoom(data.activeRoom.roomName);
    }
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room");
    setHasPendingRoom(null);
  };

  return (
    <>
      {hasPendingRoom ? (
        <PendingCard
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
            <CreateCard
              roomNameInput={roomNameInput}
              onRoomNameChange={setRoomNameInput}
            />
          ) : (
            <JoinRoom
              roomNameInput={joinRoomName}
              onRoomNameChange={setJoinRoomName}
            />
          )}
        </div>
      )}
    </>
  );
}
