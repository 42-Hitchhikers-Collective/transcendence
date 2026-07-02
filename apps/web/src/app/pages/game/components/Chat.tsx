import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket/Socket";
import type { PlayerListItem } from "../hooks/useGamePage";

type ChatMessage = {
  senderId: string;
  msg: string;
  time?: string;
  avatarUrl?: string;
};

// Avatar: loads real user avatar, falls back to initials
function MessageAvatar({ name, src }: { name: string; src?: string }) {
  const cacheBuster = useRef(Date.now()); //used to force reload the image when the src changes
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    "bg-rose-400", "bg-emerald-400", "bg-amber-400", "bg-sky-400",
    "bg-violet-400", "bg-pink-400", "bg-teal-400", "bg-orange-400",
  ];
  const color = colors[name.length % colors.length];

  return (
    <div
      className={`flex h-[clamp(1.5rem,2vw,2rem)] 2xl:h-[clamp(3rem,2vw,3.5rem)] w-[clamp(1.5rem,2vw,2rem)] 2xl:w-[clamp(3rem,2vw,3.5rem)] shrink-0 items-center justify-center overflow-hidden rounded-full text-[clamp(0.6rem,0.9vw,0.75rem)] 2xl:text-[clamp(1.1rem,0.9vw,1.5rem)] font-bold text-white ${!src ? color : ""}`}
    >
      {src ? (
        <img
          src={src ? `${src}?t=${cacheBuster.current}` : undefined} // add cache buster to force reload the image when the src changes
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            el.parentElement!.classList.add(color);
            el.parentElement!.textContent = initial;
          }}
        />
      ) : (
        initial
      )}
    </div>
  );
}

export default function Chat({ playerList = [] }: { playerList?: PlayerListItem[] }) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleChatMessage = (data: { msg: string; senderId?: string; avatarUrl?: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: data.senderId || "",
          msg: data.msg,
          avatarUrl: data.avatarUrl,
        },
      ]);
    };

    socket.on("chat_message", handleChatMessage);

    return () => {
      socket.off("chat_message", handleChatMessage);
    };
  }, []);

  // Request chat history on mount
  useEffect(() => {
    const handleHistory = (history: { username: string; msg: string; avatarUrl?: string }[]) => {
      setMessages(history.map((h) => ({
        senderId: h.username,
        msg: h.msg,
        avatarUrl: h.avatarUrl,
      })));
    };
    socket.on("chat_history_response", handleHistory);
    socket.emit("chat_history_request");
    return () => {
      socket.off("chat_history_response", handleHistory);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    socket.emit("send_msg", { msg: trimmed });
    setChatInput("");
  };

  const systemIcon = (text: string) => {
    if (text.includes("dropped") && text.includes("30 seconds")) return "⚠️";
    if (text.includes("is back")) return "🔄";
    if (text.includes("joined the room") || text.includes("created the room")) return "👋";
    if (text.includes("left the room")) return "🚪";
    if (text.includes("won the game")) return "🏆";
    if (text.includes("started the game")) return "🎬";
    if (text.includes("UNO")) return "🚨";
    return "📢";
  };

  const renderSystemMsg = (msg: string) => {
    const space = msg.indexOf(" ");
    if (space === -1) return <span>{msg}</span>;
    const name = msg.slice(0, space);
    const rest = msg.slice(space);
    return <><span className="text-emerald-500 font-semibold">{name}</span><span className="text-slate-500">{rest}</span></>;
  };

  const isSystem = (senderId: string) =>
    senderId.startsWith("👀") || senderId === "🦄";

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0">
      {/* Messages area */}
      <div className="rounded-2xl border border-rose-200/60 bg-white flex flex-col flex-1 min-h-0 min-w-0 relative">
        <div
          ref={scrollRef}
          className="flex-1 space-y-2 overflow-y-auto p-2"
        >
          {messages.map((msg, i) =>
            isSystem(msg.senderId) ? (
              <div key={i} className="text-[clamp(0.6rem,0.9vw,0.7rem)] 2xl:text-[clamp(1.1rem,1vw,1.5rem)] text-start px-[clamp(0.5rem,2vw,2.5rem)] py-0.5 wrap-break-word overflow-hidden">
                <span>{systemIcon(msg.msg)} </span>
                {renderSystemMsg(msg.msg)}
              </div>
            ) : (
              <div className="flex gap-[clamp(0.5rem,0.8vw,0.75rem)] 2xl:gap-[clamp(0.75rem,1vw,1.25rem)] bg-green-100 pl-[clamp(0.75rem,1.5vw,1rem)] 2xl:pl-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1vw,1rem)] 2xl:py-[clamp(1rem,1.5vw,1.5rem)] m-[clamp(0.75rem,2vw,1.5rem)] rounded-2xl " key={i}>
                <MessageAvatar
                  name={msg.senderId}
                  src={msg.avatarUrl}
                />
                <div className="flex-1 min-w-0 ">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[clamp(0.75rem,1.1vw,0.875rem)] 2xl:text-[clamp(1.2rem,1vw,1.6rem)] font-semibold text-slate-800 truncate">
                      {msg.senderId}
                    </span>
                    <span className="text-[clamp(0.6rem,0.9vw,0.75rem)] 2xl:text-[clamp(1rem,0.8vw,1.3rem)] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-[clamp(0.7rem,1vw,0.875rem)] 2xl:text-[clamp(1.1rem,1vw,1.5rem)] text-slate-600 wrap-break-word text-start overflow-hidden">
                    {msg.msg}
                  </p>
                </div>
              </div>
            ),
          )}
          {messages.length === 0 && (
            <p className="text-center text-[clamp(0.7rem,1vw,0.875rem)] 2xl:text-[clamp(1.1rem,1vw,1.5rem)] text-slate-400 truncate">
              No messages yet.
            </p>
          )}
       
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 2xl:gap-3 border-t p-[clamp(0.5rem,1vw,1rem)] 2xl:p-[clamp(0.75rem,1.5vw,1.5rem)]">
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Write something..."
            className="flex-1 min-w-0 rounded-lg bg-slate-200 px-[clamp(0.5rem,1vw,0.75rem)] 2xl:px-[clamp(1rem,1.5vw,1.5rem)] py-[clamp(0.35rem,0.6vw,0.5rem)] 2xl:py-[clamp(0.6rem,0.8vw,1rem)] text-[clamp(0.7rem,1vw,0.875rem)] 2xl:text-[clamp(1.1rem,1vw,1.5rem)] text-slate-800 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="rounded-lg bg-emerald-500 px-[clamp(0.5rem,1vw,0.75rem)] 2xl:px-[clamp(1rem,1.5vw,1.5rem)] py-[clamp(0.35rem,0.6vw,0.5rem)] 2xl:py-[clamp(0.6rem,0.8vw,1rem)] text-[clamp(0.6rem,0.9vw,0.75rem)] 2xl:text-[clamp(1.1rem,0.9vw,1.4rem)] font-semibold uppercase tracking-wide text-white hover:bg-emerald-600 shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
