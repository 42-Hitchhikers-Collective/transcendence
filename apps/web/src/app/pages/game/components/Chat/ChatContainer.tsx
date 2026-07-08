import Chat from "./Chat";
import ChatOverlay from "./ChatOverlay";

export default function ChatContainer(
  { chatOpen, setChatOpen }: { chatOpen: boolean; setChatOpen: (open: boolean) => void },
) {
  if (chatOpen) {
    return (
      <ChatOverlay chatOpen={chatOpen} setChatOpen={setChatOpen} />
    );
  }

  return (
    <div className="hidden lg:flex flex-1 min-h-0 min-w-0">
      <Chat />
    </div>
  );
}
