import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket/Socket";
import type { PlayerListItem } from "../hooks/useGamePage";

type ChatMessage = {
  senderId: string;
  msg: string;
  time: string;
};

// Avatar: loads real user avatar, falls back to initials
function MessageAvatar({ name, src }: { name: string; src?: string }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    "bg-rose-400", "bg-emerald-400", "bg-amber-400", "bg-sky-400",
    "bg-violet-400", "bg-pink-400", "bg-teal-400", "bg-orange-400",
  ];
  const color = colors[name.length % colors.length];

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white ${!src ? color : ""}`}
    >
      {src ? (
        <img
          src={src}
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
    const handleChatMessage = (data: { msg: string; senderId?: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: data.senderId || "",
          msg: data.msg,
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
    const handleHistory = (history: { username: string; msg: string }[]) => {
      setMessages(history.map((h) => ({
        senderId: h.username,
        msg: h.msg,
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
    <div className="flex flex-1 flex-col min-h-0">
      {/* <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">
        Chat
      </h2> */}

      {/* Messages area */}
      <div className=" rounded-2xl border border-rose-200/60 bg-white flex flex-col h-56 lg:h-98">
        <div
          ref={scrollRef}
          className="flex-1 space-y-2 overflow-y-auto p-2"
        >
          {messages.map((msg, i) =>
            isSystem(msg.senderId) ? (
              <div key={i} className="text-[10px] text-center px-10 py-0.5">
                <span>{systemIcon(msg.msg)} </span>
                {renderSystemMsg(msg.msg)}
              </div>
            ) : (
              <div className="flex gap-3 bg-green-100 pl-4 py-4 m-6 rounded-2xl " key={i}>
                <MessageAvatar
                  name={msg.senderId}
                  src={playerList.find(p => p.userName === msg.senderId)?.avatarUrl}
                />
                <div className="flex-1 min-w-0 ">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {msg.senderId}
                    </span>
                    <span className="text-xs text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 break-words text-start">
                    {msg.msg}
                  </p>
                </div>
              </div>
            ),
          )}
          {messages.length === 0 && (
            <p className="text-center text-sm text-slate-400">
              No messages yet.
            </p>
          )}
       
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 border-tpx-3 p-4">
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Write something..."
            className="flex-1 rounded-lg bg-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-emerald-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
