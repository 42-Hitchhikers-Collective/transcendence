import type { PlayerListItem } from "../hooks/useGamePage";
import { useRef, useState, useEffect } from "react";
import { Clock } from "lucide-react";

type PlayerListProps = {
  playerList: PlayerListItem[];
  clientUsername?: string;
};

function PlayerStatus({
  dropped,
  isPlayerTurn,
}: {
  dropped: boolean;
  isPlayerTurn: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 min-h-[clamp(1.1rem,2.8vw,1.4rem)] lg:min-h-[clamp(1.2rem,2vw,1.5rem)] 2xl:min-h-[clamp(1.6rem,1.5vw,2rem)]">
      {dropped && (
        <>
          <span className="flex items-center justify-center gap-[clamp(0.15rem,0.3vw,0.25rem)] text-[clamp(0.45rem,1.2vw,0.55rem)] lg:text-[clamp(0.5rem,0.8vw,0.65rem)] 2xl:text-[clamp(0.7rem,0.7vw,1rem)] font-medium text-slate-500">
            <Clock className="size-[clamp(0.5rem,1vw,0.6rem)] lg:size-[clamp(0.55rem,0.7vw,0.7rem)] 2xl:size-[clamp(0.75rem,0.6vw,0.9rem)]" />
            Dropped
          </span>
        </>
      )}
      {!dropped && isPlayerTurn && (
        <span className="text-[clamp(0.4rem,1vw,0.5rem)] lg:text-[clamp(0.45rem,0.7vw,0.55rem)] 2xl:text-[clamp(0.6rem,0.6vw,0.8rem)] font-medium text-emerald-600 animate-pulse">
          Is playing
        </span>
      )}
      {dropped && isPlayerTurn && (
        <span className="text-[clamp(0.4rem,1vw,0.5rem)] lg:text-[clamp(0.45rem,0.7vw,0.55rem)] 2xl:text-[clamp(0.6rem,0.6vw,0.8rem)] font-medium text-emerald-600 animate-pulse">
          Dropped while playing
        </span>
      )}
    </div>
  );
}

// function TurnStatus({
//   turnPlayer,
// }: {
//   turnPlayer: PlayerListItem | undefined;
// }) {
//   if (!turnPlayer) return null;

//   return (
//     <div className="mt-[clamp(0.4rem,0.8vw,0.6rem)]">
//       <p className="lg:mt-[clamp(0.25rem,0.5vw,0.5rem)] text-[clamp(0.8rem,3vw,1rem)] lg:text-[clamp(1rem,2.5vw,1.5rem)] 2xl:text-[clamp(1.5rem,1.5vw,2.2rem)] font-normal wrap-break-word overflow-hidden">
//         <span className="animate-bounce text-emerald-500">
//           {turnPlayer.userName}
//         </span>{" "}
//         is playing
//       </p>
//     </div>
//   );
// }

function PlayerItem({
  player,
  clientUsername,
}: {
  player: PlayerListItem;
  clientUsername?: string;
}) {
  const cacheBuster = useRef(Date.now()); // cache buster to force reload the avatar image when the src changes
  const isYou = player.userName === clientUsername;

  return (
    /* player item */
    <div
      className={`flex w-[clamp(3.5rem,10vw,4.5rem)] lg:w-[clamp(4.5rem,7vw,5.5rem)] 2xl:w-[clamp(5.5rem,5vw,7rem)] min-w-0 flex-col items-center justify-center gap-[clamp(0.15rem,0.4vw,0.3rem)] rounded-xl border-2 p-[clamp(0.3rem,0.7vw,0.5rem)] shadow-md ${
        player.dropped
          ? "border-slate-200"
          : player.isPlayerTurn
            ? "border-emerald-300 animate-bounce bg-emerald-200 shadow-emerald-200 text-emerald-900" // ← turn highlight
            : ""
      }`}
    >
      {/* username */}
      <p
        className={`text-center text-[clamp(0.45rem,1.8vw,0.6rem)] lg:text-[clamp(0.6rem,0.9vw,0.75rem)] 2xl:text-[clamp(0.8rem,0.8vw,1.1rem)] font-semibold leading-tight truncate w-full ${
          player.dropped
            ? "text-slate-300"
            : player.isPlayerTurn
              ? " text-emerald-800" // ← turn name color
              : "text-slate-600"
        }`}
      >
        {isYou ? `You` : player.userName}
      </p>
      {/* avatar */}
      <img
        src={`${player.avatarUrl}?t=${cacheBuster.current}`} // add cache buster to force reload the image when the src changes
        alt={player.userName}
        className={`h-[clamp(1.3rem,5vw,2rem)] lg:h-[clamp(1.8rem,3.5vw,2.3rem)] 2xl:h-[clamp(2.5rem,3vw,3.5rem)] w-[clamp(1.3rem,5vw,2rem)] lg:w-[clamp(1.8rem,3.5vw,2.3rem)] 2xl:w-[clamp(2.5rem,3vw,3.5rem)] max-w-full shrink-0 rounded-full object-cover ${
          player.dropped ? "grayscale opacity-50" : ""
        }`}
        onError={(e) => {
          console.warn(
            `Failed to load avatar for ${player.userName}, using default.`,
            e,
          );
          (e.target as HTMLImageElement).src = "/avatars/default.png";

          console.log(
            `Avatar URL for ${player.userName}: ${player.avatarUrl}, defaulting to /avatars/default.png`,
          );
          // Jess to Inbar -> This is not a bug that the frontend has to handle, it is caused because
          // the backend is incorrectly returning a default avatar string while it should return `null`
          // when a player has no custom avatar.
          // The API should ONLY report if data exists; by handling a default_avatar, it tricks the fronend into
          // thinking that the player has a custom avatar and because of this the frontend UI logic breaks,
          // and we are forced to cover this up in a dirty fix (i commented it out because not happy with this)

          // const img = e.currentTarget;
          // console.log("Failed URL:", img.src);
          // if (img.src.includes("/avatars/default.png")) {
          //   console.log("Default avatar missing too, aborting.");
          //   return;
          // }
          // img.src = "/avatars/default.png";
        }}
      />
      <PlayerStatus
        dropped={player.dropped}
        isPlayerTurn={player.isPlayerTurn}
      />
    </div>
  );
}

// Leaving player with red fade-out animation
function LeavingPlayerItem({ player }: { player: PlayerListItem }) {
  const cacheBuster = useRef(Date.now());

  return (
    <div className="flex w-[clamp(3.5rem,10vw,4.5rem)] lg:w-[clamp(4.5rem,7vw,5.5rem)] 2xl:w-[clamp(5.5rem,5vw,7rem)] min-w-0 flex-col items-center justify-center gap-[clamp(0.15rem,0.4vw,0.3rem)] rounded-xl border-2 border-red-300 bg-red-100 p-[clamp(0.3rem,0.7vw,0.5rem)] shadow-md animate-[fadeOut_1.5s_ease-out_forwards]">
      <img
        src={`${player.avatarUrl}?t=${cacheBuster.current}`}
        alt={player.userName}
        className="h-[clamp(1.3rem,5vw,2rem)] lg:h-[clamp(1.8rem,3.5vw,2.3rem)] 2xl:h-[clamp(2.5rem,3vw,3.5rem)] w-[clamp(1.3rem,5vw,2rem)] lg:w-[clamp(1.8rem,3.5vw,2.3rem)] 2xl:w-[clamp(2.5rem,3vw,3.5rem)] max-w-full shrink-0 rounded-full object-cover grayscale opacity-50"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/avatars/default.png";
        }}
      />
      <p className="text-center text-[clamp(0.45rem,1.8vw,0.6rem)] lg:text-[clamp(0.6rem,0.9vw,0.75rem)] 2xl:text-[clamp(0.8rem,0.8vw,1.1rem)] font-semibold leading-tight truncate w-full text-red-400">
        {player.userName}
      </p>
      <div className="flex flex-col items-center justify-center gap-0.5 min-h-[clamp(1.1rem,2.8vw,1.4rem)] lg:min-h-[clamp(1.2rem,2vw,1.5rem)] 2xl:min-h-[clamp(1.6rem,1.5vw,2rem)]">
        <span className="text-[clamp(0.45rem,1.2vw,0.55rem)] lg:text-[clamp(0.5rem,0.8vw,0.65rem)] 2xl:text-[clamp(0.7rem,0.7vw,1rem)] font-medium text-red-400">
          Left
        </span>
      </div>
    </div>
  );
}

// Runs at every time useGamePage gets updated playerList and re-renders
export default function PlayerList({
  playerList,
  clientUsername,
}: PlayerListProps) {
  const prevPlayersRef = useRef<PlayerListItem[]>([]); // Store previous player list to detect leaving players
  const [leavingPlayers, setLeavingPlayers] = useState<PlayerListItem[]>([]);// Store players who are leaving to animate them out

  // Detects players who disappeared and animate them out
  useEffect(() => {
    const currentNames = new Set(playerList.map((p) => p.userName)); // creates a set that stores the player names before changes are applied

    const newlyLeft = prevPlayersRef.current.filter(
      // filters players0.
      (p) =>
        !currentNames.has(p.userName) &&
        !leavingPlayers.some((lp) => lp.userName === p.userName),
    );

    if (newlyLeft.length > 0) {
      setLeavingPlayers((prev) => [...prev, ...newlyLeft]);
      // Remove from leaving list after animation ends
      setTimeout(() => {
        setLeavingPlayers((prev) =>
          prev.filter(
            (lp) => !newlyLeft.some((nl) => nl.userName === lp.userName),
          ),
        );
      }, 1600);
    }

    prevPlayersRef.current = playerList;
  }, [playerList]);

  // Combine current + leaving players for rendering
  const allPlayers = [...playerList, ...leavingPlayers];

  if (playerList.length > 0) {
    // Debugging logs to track changes
    console.log(`👤👤👤👤 PLAYER LIST UPDATED`);
    playerList.forEach((p, i) => {
      console.log(
        ` ${i++}. ${p.userName} - ${p.dropped ? "(dropped)" : "in room"} - Is player turn: ${p.isPlayerTurn}`,
      );
    });
  }

  return (
    <div className="min-w-0 overflow-hidden flex flex-col">
      <h2 className="text-[clamp(0.6rem,2vw,0.7rem)] lg:text-[clamp(0.7rem,1vw,0.875rem)] 2xl:text-[clamp(1.2rem,1vw,1.6rem)] font-semibold uppercase tracking-[0.2em] py-0.5 lg:py-[clamp(0.35rem,0.6vw,0.5rem)] mb-[clamp(0.4rem,0.8vw,0.6rem)] truncate">
        Joined:
        <span className="ml-1 lg:ml-2 rounded-full bg-emerald-100 p-[clamp(0.15rem,0.5vw,0.3rem)] lg:p-[clamp(0.25rem,0.5vw,0.5rem)] 2xl:p-[clamp(0.5rem,0.6vw,0.9rem)] text-[clamp(0.5rem,2vw,0.65rem)] lg:text-[clamp(0.6rem,0.9vw,0.75rem)] 2xl:text-[clamp(1.1rem,1vw,1.4rem)] font-medium text-emerald-800">
          {playerList.length}
        </span>
      </h2>
      {allPlayers.length === 0 && (
        <p className="text-[clamp(0.6rem,2vw,0.7rem)] lg:text-[clamp(0.7rem,1vw,0.875rem)] 2xl:text-[clamp(1.2rem,1vw,1.5rem)] text-slate-400">
          Waiting for someone to join...
        </p>
      )}
      <div
        className={`${allPlayers.length === 4 ? "lg:grid lg:grid-cols-2 [&>*:nth-child(odd)]:justify-self-end [&>*:nth-child(even)]:justify-self-start" : ""} flex flex-nowrap gap-[clamp(0.25rem,1.5vw,0.5rem)] lg:gap-[clamp(0.5rem,1vw,0.75rem)] justify-center items-center my-[clamp(0.75rem,1.5vw,1.25rem)]`}
      >
        {/* Sorts list before rendering, so that clientUser is set first */}
        {[...allPlayers]
          .sort((a, b) => {
            if (a.userName === clientUsername) return -1;
            if (b.userName === clientUsername) return 1;
            return 0;
          })
          .map((player) => {
            const isLeaving = leavingPlayers.some(
              (lp) => lp.userName === player.userName,
            );
            return isLeaving ? (
              <LeavingPlayerItem
                key={`leaving-${player.userName}`}
                player={player}
              />
            ) : (
              <PlayerItem
                key={player.userName}
                player={player}
                clientUsername={clientUsername}
              />
            );
          })}
      </div>
    </div>
  );
}
