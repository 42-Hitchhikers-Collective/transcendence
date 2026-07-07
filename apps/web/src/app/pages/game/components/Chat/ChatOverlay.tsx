
import { ChatBubbleLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Chat from "./Chat";

export default function ChatOverlay({
  chatOpen,
  setChatOpen,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}) {
  if (!chatOpen) return null;

  return (
    <div className="absolute inset-0 z-40 flex bg-white">
      <div className="w-full h-full flex flex-col min-h-0 relative">
        {/*  Red X close button, top-left corner  */}
        <button
          type="button"
          onClick={() => setChatOpen(false)}
          className="absolute top-[clamp(0.5rem,1.5vw,0.75rem)] right-[clamp(0.5rem,1.5vw,0.75rem)] z-10 rounded-full bg-red-500 p-[clamp(0.35rem,0.6vw,0.5rem)] text-white shadow-lg hover:bg-red-400 transition"
          aria-label="Close chat"
        >
          <XMarkIcon className="size-[clamp(1.25rem,2vw,1.5rem)]" />
        </button>
        <Chat />
      </div>
    </div>
  );
}
