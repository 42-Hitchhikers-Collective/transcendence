import type { PlayerListItem } from "../hooks/useGamePage";
import { useRef, useState, useEffect } from "react";
import { Clock } from "lucide-react";

type PlayerListProps = {
  playerList: PlayerListItem[];
  clientUsername?: string;
  gameOver?: {
    reason: "finished" | "lonely";
    winnerId?: string;
  } | null;
};

function PlayerStatus({
  dropped,
  isPlayerTurn,
  gameOver,
  playerId,
}: {
  dropped: boolean;
  isPlayerTurn: boolean;
  gameOver?: { reason: "finished" | "lonely"; winnerId?: string } | null;
  playerId: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 min-h-5 lg:min-h-6 2xl:min-h-8">
      {gameOver?.reason === "finished" && gameOver.winnerId === playerId && (
        <span className="text-[11px] lg:text-xs 2xl:text-sm font-medium text-yellow-600">
          Won!
        </span>
      )}
      {dropped && (
        <>
          <span className="flex items-center justify-center gap-0.5 text-[11px] lg:text-xs 2xl:text-sm font-medium text-slate-500">
            <Clock className="size-2 lg:size-2.5 2xl:size-3" />
            Dropped
          </span>
        </>
      )}
      {!dropped && isPlayerTurn && !gameOver && (
        <span className="text-[10px] lg:text-[11px] 2xl:text-xs font-medium text-emerald-600 animate-pulse">
          Is playing
        </span>
      )}
      {dropped && isPlayerTurn && !gameOver && (
        <span className="text-[10px] lg:text-[11px] 2xl:text-xs font-medium text-emerald-600 animate-pulse">
          Dropped while playing
        </span>
      )}
    </div>
  );
}

function PlayerItem({
  player,
  clientUsername,
  gameOver,
}: {
  player: PlayerListItem;
  clientUsername?: string;
  gameOver?: { reason: "finished" | "lonely"; winnerId?: string } | null;
}) {
  const cacheBuster = useRef(Date.now()); // cache buster to force reload the avatar image when the src changes
  const isYou = player.userName === clientUsername;

  return (
    /* player item */
    <div
      className={`flex w-14 lg:w-18 2xl:w-28 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border-2 p-1 lg:p-2 shadow-md ${
        player.dropped
          ? "border-slate-300 bg-slate-200 text-slate-400"
          : gameOver && player.playerId === gameOver.winnerId
            ? "border-yellow-400 bg-yellow-100 animate-pulse"
            : player.isPlayerTurn
              ? "border-emerald-300 animate-bounce bg-emerald-200 shadow-emerald-200 text-emerald-900"
              : ""
      }`}
    >
      {/* username */}
      <p
        className="text-center text-[11px] lg:text-xs 2xl:text-sm font-semibold leading-tight truncate w-full"
      >
        {player.playerId === gameOver?.winnerId ? "🎉 " : ""}
        {isYou ? `You` : player.userName}
      </p>
      {/* avatar */}
      <img
        src={`${player.avatarUrl}?t=${cacheBuster.current}`} // add cache buster to force reload the image when the src changes
        alt={player.userName}
        className={`h-6 lg:h-8 2xl:h-12 w-6 lg:w-8 2xl:w-12 max-w-full shrink-0 rounded-full object-cover ${
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
        gameOver={gameOver}
        playerId={player.playerId}
      />
    </div>
  );
}

// Leaving player with red fade-out animation
function LeavingPlayerItem({ player }: { player: PlayerListItem }) {
  const cacheBuster = useRef(Date.now());

  return (
    <div className="flex w-14 lg:w-18 2xl:w-28 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-red-300 bg-red-100 p-1 lg:p-2 shadow-md animate-[fadeOut_1.5s_ease-out_forwards]">
      <img
        src={`${player.avatarUrl}?t=${cacheBuster.current}`}
        alt={player.userName}
        className="h-6 lg:h-8 2xl:h-12 w-6 lg:w-8 2xl:w-12 max-w-full shrink-0 rounded-full object-cover grayscale opacity-50"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/avatars/default.png";
        }}
      />
      <p className="text-center text-[11px] lg:text-xs 2xl:text-sm font-semibold leading-tight truncate w-full text-red-400">
        {player.userName}
      </p>
      <div className="flex flex-col items-center justify-center gap-0.5 min-h-5 lg:min-h-6 2xl:min-h-8">
        <span className="text-[11px] lg:text-xs 2xl:text-sm font-medium text-red-400">
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
  gameOver,
}: PlayerListProps) {
  const prevPlayersRef = useRef<PlayerListItem[]>([]); // Store previous player list to detect leaving players
  const [leavingPlayers, setLeavingPlayers] = useState<PlayerListItem[]>([]); // Store players who are leaving to animate them out

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
      <h2 className="text-[11px] lg:text-sm 2xl:text-lg font-semibold uppercase tracking-[0.2em] py-1 lg:py-1 mb-1 truncate">
        Joined:
        <span className="ml-1 lg:ml-2 rounded-full bg-emerald-100 p-0.5 text-[11px] lg:text-xs 2xl:text-sm font-medium text-emerald-800">
          {playerList.length}
        </span>
      </h2>
      {allPlayers.length === 0 && (
        <p className="text-xs lg:text-sm 2xl:text-base text-slate-400">
          Waiting for someone to join...
        </p>
      )}
      <div
        className={`${allPlayers.length === 4 ? "lg:grid lg:grid-cols-2 [&>*:nth-child(odd)]:justify-self-end [&>*:nth-child(even)]:justify-self-start" : ""} flex flex-nowrap gap-1 lg:gap-2 justify-center items-center `}
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
                gameOver={gameOver}
              />
            );
          })}
      </div>
    </div>
  );
}
