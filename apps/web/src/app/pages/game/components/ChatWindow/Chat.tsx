import { useEffect, useState } from "react";
import { socket } from "@/socket/Socket";

export default function Chat() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const handleChatMessage = (data: { msg: string; senderId?: string }) => {
      const prefix = data.senderId ? `${data.senderId}: ` : "";
      setMessages((prev) => [...prev, `${prefix}${data.msg}`]);
    };


    // socket.on("chat_history", (data: { history: { msg: string; senderId?: string }[] }) => {
    //   const formattedHistory = data.history.map((entry) => {
    //     const prefix = entry.senderId ? `${entry.senderId}: ` : "";
    //     return `${prefix}${entry.msg}`;
    //   });
    //   setMessages(formattedHistory);
    // });
    socket.on("chat_message", handleChatMessage);

    return () => {
      socket.off("chat_message", handleChatMessage);
    };
  }, []);

  const sendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    socket.emit("send_msg", { msg: trimmed });
    setChatInput("");
  };

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
        Chat
      </h2>
      <div className="mt-4 flex flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
          {messages.map((message, index) => (
            <p key={index} className="text-slate-200">
              {message}
            </p>
          ))}
          {messages.length === 0 && (
            <p className="text-slate-400">No messages yet.</p>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-slate-800 px-3 py-2">
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
