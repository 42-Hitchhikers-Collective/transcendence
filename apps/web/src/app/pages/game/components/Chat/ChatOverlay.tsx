
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
    <div className="fixed inset-0 z-50 flex bg-white ">
      <div className="w-full h-full flex flex-col min-h-0 relative">
        {/*  Red X close button, top-left corner  */}
        <button
          type="button"
          onClick={() => setChatOpen(false)}
          className="absolute top-3 md:top-4 right-3 md:right-4 z-10 rounded-full bg-red-500 p-2 md:p-3 text-white shadow-lg hover:bg-red-400 transition"
          aria-label="Close chat"
        >
          <XMarkIcon className="size-5 md:size-6" />
        </button>
        <Chat />
      </div>
    </div>
  );
}
