import { useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { socket } from "@/socket/Socket";

type Props = {
  reason: "finished" | "lonely";
  winnerId?: string;
  playerId?: string;
  roomName?: string;
};

function getReasonDetails(
  reason: "finished" | "lonely",
  winnerId?: string,
  playerId?: string,
  roomName?: string,
) {
  if (reason === "finished") {
    const isWinner = winnerId ? playerId === winnerId : undefined;
    return {
      title:
        isWinner !== undefined
          ? isWinner
            ? "We have a winner! 🎉"
            : "Better luck next time!😞"
          : "Game is Over",
      titleColor:
        isWinner !== undefined
          ? isWinner
            ? "text-emerald-400"
            : "text-sky-400"
          : "text-gray-400",
      subtitle:
        isWinner !== undefined
          ? isWinner
            ? `Congratulations, you are the champion of room " ${roomName}"!`
            : `Loosing sucks.. But we trust you can do better so don't give up!!!`
          : `This game in room "${roomName}" is over.`,
      description:
        isWinner !== undefined
          ? isWinner
            ? "Your victory has been saved to your match history."
            : `Game results for room "${roomName}" were saved to your match history.`
          : "The results are accessible in your profile with the updated match history!",
    };
  } else if (reason === "lonely") {
    return {
      title: "Where's everyone?!!! 😱",
      titleColor: "text-yellow-400",
      subtitle: `All other players abandoned room "${roomName}"!`,
      description: `Either this was intentional or an accident, the game cannot continue.. you can play again by starting or joining a new game from the homepage!`,
    };
  }
  return {
    title: "Game interrupted",
    titleColor: "text-gray-400",
    description:
      "The game was interrupted either because it was completed or abandoned from other players. Please leave the page",
  };
}

export default function GameInterrupted({
  reason,
  winnerId,
  playerId,
  roomName,
}: Props) {
  const navigate = useNavigate();
  const leftRef = useRef(false);

  // Emit leave_room on unmount so browser back / direct navigation
  // also cleans up the player's room state on the backend
  useEffect(() => {
    return () => {
      if (!leftRef.current) {
        socket.emit("leave_room");
      }
    };
  }, []);

  const handleBack = () => {
    leftRef.current = true;
    socket.emit("leave_room");
    navigate("/", { replace: true });
  };

  const { title, titleColor, subtitle, description } = getReasonDetails(
    reason,
    winnerId,
    playerId,
    roomName,
  );



  return (
    <div className="h-full w-full flex items-center justify-center bg-black/60 rounded-2xl p-2 sm:p-4">
      <div className="h-full w-full flex flex-col items-center justify-center rounded-2xl border border-slate-200/20 bg-neutral-900 p-4 sm:p-6 md:p-10 lg:p-12 text-center shadow-2xl overflow-y-auto">
        <p className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 ${titleColor}`}>
          {title}
        </p>
        <div className="w-full max-w-prose px-2 sm:px-4">
          <p className="text-sm sm:text-base md:text-xl lg:text-3xl font-medium text-white text-start">
            {subtitle}
          </p>
          <p className="mb-4 md:mb-6 lg:mb-8 text-xs sm:text-sm md:text-base lg:text-lg text-slate-400 text-start font-thin">
            {description}
          </p>
        </div>

        <button
          onClick={handleBack}
          className="mt-3 sm:mt-5 md:mt-7 lg:mt-8 inline-block rounded-lg bg-amber-400 px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 text-xs md:text-sm lg:text-base font-semibold text-white hover:bg-amber-500 transition shrink-0"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
