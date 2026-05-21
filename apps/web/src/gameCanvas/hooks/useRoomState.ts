import { useState, useEffect } from "react";
import { EventBus } from "../../events/EventBus";
import { FrontendRoom } from "../types/roomTypes";

export function useRoomState() {
  const [room, setRoom] = useState<FrontendRoom | null>(null);

  useEffect(() => {
    const handleRoomState = (newRoom: FrontendRoom) => {
      setRoom(newRoom);
    };

    EventBus.on("ROOM_STATE", handleRoomState);

    return () => {
      EventBus.off("ROOM_STATE", handleRoomState);
    };
  }, []);

  return room;
}
