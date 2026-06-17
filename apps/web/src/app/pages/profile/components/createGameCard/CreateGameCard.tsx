import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/socket/Socket";
import { useRoomState } from "@/gameCanvas/hooks/useRoomState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import PendingGameCard from "./PendingGameCard/PendingGameCard";
import CreateRoomCard from "./CreateRoomCard";
import JoinRoomCard from "./JoinRoomCard";

export function CreateGameCard() {
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
    console.warn(`User ${hasPendingRoom}`);

    return () => {
      socket.off("leave_room");
      socket.off("error", handleError);
      socket.off("player_info_response", handlePlayerInfo);
    };
  }, []);

  useEffect(() => {
      console.warn(`User pensing room: ${hasPendingRoom}`);
  }, [hasPendingRoom]); // placeholder to avoid "defined but not used" warnings for now; we will use these in the ProfileSection component


  const handlePlayerInfo = (data: any) => {
    // prints json data in a readable format without needing to remember the structure of the data object
    console.log(
      `🃏 CREATE GAME CARD: Player info received:\n` +
        Object.entries(data)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join("\n"),
    );

    if (data.activeRoom) {
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
        <Tabs defaultValue="create" className="h-full">
          <TabsList className="mx-auto mb-4 w-fit">
            <TabsTrigger value="create">Create room</TabsTrigger>
            <TabsTrigger value="join">Join room</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="h-full">
            <CreateRoomCard
              roomNameInput={roomNameInput}
              onRoomNameChange={setRoomNameInput}
              isCreating={isCreating}
              error={error}
              onCreateRoom={handleCreateRoom}
            />
          </TabsContent>
          <TabsContent value="join" className="h-full">
            <JoinRoomCard
              roomNameInput={joinRoomName}
              onRoomNameChange={setJoinRoomName}
              isJoining={isJoining}
              error={joinError}
              onJoinRoom={handleJoinRoom}
            />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}

