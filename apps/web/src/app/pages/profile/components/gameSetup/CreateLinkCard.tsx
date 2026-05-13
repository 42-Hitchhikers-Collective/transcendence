import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthContext } from "@/app/auth/AuthContext";

export function CreateLinkRoom() {
  const { token } = useAuthContext();
  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRoomName, setCreatedRoomName] = useState<string | null>(null);
  const [pendingRoomName, setPendingRoomName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    if (!createdRoomName) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/game?room=${encodeURIComponent(
      createdRoomName,
    )}`;
  }, [createdRoomName]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const connectSocket = (roomName: string) => {
    if (socketRef.current) {
      if (socketRef.current.connected) {
        socketRef.current.emit("create_room", { roomName });
      } else {
        socketRef.current.once("connect", () => {
          socketRef.current?.emit("create_room", { roomName });
        });
      }
      return socketRef.current;
    }
    const socket = io("https://localhost:8443", {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("create_room", { roomName });
    });

    socket.on("room_created", (data: { roomName: string }) => {
      setCreatedRoomName(data.roomName);
      setPendingRoomName(null);
      setIsCreating(false);
      setError(null);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });

    socket.on("error", (data: { message?: string }) => {
      setError(data?.message ?? "Failed to create room.");
      setPendingRoomName(null);
      setIsCreating(false);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });

    socket.on("connect_error", (err: Error) => {
      setError(err.message || "Socket connection failed.");
      setPendingRoomName(null);
      setIsCreating(false);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });

    socketRef.current = socket;
    return socket;
  };

  const generateRoomName = () => {
    return `room-${Math.random().toString(36).slice(2, 6)}`;
  };

  const handleCreateLink = () => {
    if (!token) {
      setError("Log in to create a room link.");
      return;
    }

    setError(null);
    setCopied(false);
    setCreatedRoomName(null);
    setIsCreating(true);

    const roomName = generateRoomName();
    setPendingRoomName(roomName);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setError("Timed out creating the room. Please try again.");
      setPendingRoomName(null);
      setIsCreating(false);
      timeoutRef.current = null;
    }, 8000);

    connectSocket(roomName);
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setError("Copy failed. Please copy the link manually.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Create a private link for a room with up to 4 players (you + 3 friends).
      </p>

      <button
        type="button"
        onClick={handleCreateLink}
        disabled={isCreating}
        className="bg-primary text-primary-foreground w-full rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreating ? "Creating link..." : "Create room link"}
      </button>

      {pendingRoomName && isCreating && (
        <div className="bg-muted rounded-md px-4 py-3 text-sm">
          Creating room: {pendingRoomName}
        </div>
      )}

      {createdRoomName && link && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Shareable link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={link}
              className="bg-background w-full rounded-md border px-3 py-2 text-sm"
            />
            <a
              href={link}
              className="bg-amber-300 text-slate-900 rounded-md px-3 py-2 text-sm font-medium hover:opacity-90"
            >
              Open
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="bg-slate-900 text-white rounded-md px-3 py-2 text-sm font-medium hover:opacity-90"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-muted-foreground text-xs">
            Anyone with this link can join the room until it is full.
          </p>
        </div>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
