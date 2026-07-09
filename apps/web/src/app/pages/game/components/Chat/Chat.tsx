import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket/Socket";
import type { PlayerListItem } from "../../hooks/useGamePage";

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
    "bg-rose-400",
    "bg-emerald-400",
    "bg-amber-400",
    "bg-sky-400",
    "bg-violet-400",
    "bg-pink-400",
    "bg-teal-400",
    "bg-orange-400",
  ];
  const color = colors[name.length % colors.length];

  return (
    <div
      className={`flex h-6 md:h-8 2xl:h-10 w-6 md:w-8 2xl:w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs md:text-sm 2xl:text-base font-bold text-white ${!src ? color : ""}`}
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

export default function Chat() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleChatMessage = (data: {
      msg: string;
      senderId?: string;
      avatarUrl?: string;
    }) => {
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
    const handleHistory = (
      history: { username: string; msg: string; avatarUrl?: string }[],
    ) => {
      setMessages(
        history.map((h) => ({
          senderId: h.username,
          msg: h.msg,
          avatarUrl: h.avatarUrl,
        })),
      );
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
    if (text.includes("dropped") && text.includes("30 seconds")) return "⏰ ";
    if (text.includes("is back")) return "⚡️ ";
    if (text.includes("joined the room") || text.includes("created the room"))
      return "👋 ";
    if (text.includes("left the room")) return "❌ ";
    if (text.includes("won")) return "🏆 ";
    if (text.includes("started the game")) return "🎬 ";
    if (text.includes("UNO")) return "🚨 ";
    return "📢 ";
  };

  const renderSystemMsg = (msg: string) => {
    const space = msg.indexOf(" ");
    if (space === -1) return <span>{msg}</span>;
    const name = msg.slice(0, space);
    const rest = msg.slice(space);
    return (
      <>
        <span className="text-emerald-500 font-semibold">{name}</span>
        <span className="text-slate-500">{rest}</span>
      </>
    );
  };

  const isSystem = (senderId: string) =>
    senderId.startsWith("👀") || senderId === "🦄";

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0">
      {/* Messages area */}
      <div className="rounded-2xl border border-rose-200/60 bg-white flex flex-col flex-1 min-h-0 min-w-0 relative">
        <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-2">
          {messages.map((msg, i) =>
            isSystem(msg.senderId) ? (
              <p
                key={i}
                className="text-light text-start px-8 py-0.5 wrap-break-word overflow-hidden"
              >
                {" "}
                {systemIcon(msg.msg)}
                {renderSystemMsg(msg.msg)}
              </p>
            ) : (
              <div
                className="flex gap-2 md:gap-3 2xl:gap-3 bg-green-100 pl-3 md:pl-4 2xl:pl-4 py-3 md:py-4 2xl:py-4 m-3 md:m-6 rounded-2xl "
                key={i}
              >
                <MessageAvatar name={msg.senderId} src={msg.avatarUrl} />
                <div className="flex-1 min-w-0 ">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm md:text-base 2xl:text-lg font-semibold text-slate-800 truncate">
                      {msg.senderId}
                    </span>
                    <span className="text-xs md:text-sm 2xl:text-base text-slate-400">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-sm 2xl:text-base pr-2 text-slate-600 wrap-break-word text-start overflow-hidden">
                    {msg.msg}
                  </p>
                </div>
              </div>
            ),
          )}
          {messages.length === 0 && (
            <p className="text-center text-sm 2xl:text-base text-slate-400 truncate">
              No messages yet.
            </p>
          )}
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 2xl:gap-2 border-t p-2 md:p-4 2xl:p-4">
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Write something..."
            className="flex-1 min-w-0 rounded-lg bg-slate-200 px-2 md:px-3 2xl:px-4 py-1.5 md:py-2 2xl:py-2 text-sm 2xl:text-base text-slate-800 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="rounded-lg bg-emerald-500 px-2 md:px-3 2xl:px-4 py-1.5 md:py-2 2xl:py-2 text-xs md:text-sm 2xl:text-base font-semibold uppercase tracking-wide text-white hover:bg-emerald-600 shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
