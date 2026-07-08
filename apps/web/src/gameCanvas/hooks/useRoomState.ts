import { useState, useEffect } from "react";
import { EventBus } from "../../events/EventBus";
import { FrontendRoom } from "../types/roomTypes";

export function useRoomState() {
  const [room, setRoom] = useState<FrontendRoom | null>(null);

  useEffect(() => {
    const handleRoomState = (newRoom: FrontendRoom) => {
      setRoom(newRoom);
    };

    EventBus.on("room_state", handleRoomState);

    return () => {
      EventBus.off("room_state", handleRoomState);
    };
  }, []);

  return room;
}
