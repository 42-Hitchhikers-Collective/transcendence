import type { PlayerListItem } from "../hooks/useGamePage";

type PlayerListProps = {
  playerList: PlayerListItem[];
  clientUsername?: string;
};

function PlayerStatus({ dropped }: { dropped: boolean }) {
  if (dropped) {
    return (
      <div className="">
        <span className="flex items-center justify-center gap-1 text-xs font-medium text-slate-500">
          Dropped
          {/* <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" /> */}
        </span>
      </div>
    );
  }
}

function TurnStatus({ turnPlayer }: { turnPlayer: PlayerListItem | undefined }) {
  if (!turnPlayer) return null;

  if (turnPlayer.dropped) {
    return (
      <div>
        <p className="mt-10 text-2xl font-medium">
          <span className="animate-bounce text-slate-200">
            {turnPlayer.userName}
          </span>{" "}
          was playing but dropped from the game!
        </p>
        <p className="mt-4 text-xs text-red-500">
          Player will be kicked out and removed from the game if not
          returning within{" "}
          <span className="font-semibold text-red-600">30 seconds.</span>
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mt-10 text-2xl font-medium">
        <span className="animate-bounce text-emerald-500">
          {turnPlayer.userName}
        </span>{" "}
        is playing
      </p>
    </div>
  );
}

function PlayerItem({
  player,
  clientUsername,
}: {
  player: PlayerListItem;
  clientUsername?: string;
}) {
  const isYou = player.userName === clientUsername;

  return (
    <div
      className={`flex w-22 flex-col items-center gap-2 rounded-xl border-2 px-5 py-3 shadow-md ${
        player.dropped
          ? "border-slate-200"
          : player.isPlayerTurn
            ? "border-emerald-300 animate-bounce bg-emerald-200 shadow-emerald-200 text-emerald-900" // ← turn highlight
            : ""
      }`}
    >
      {/* avatar */}
      <img
        src={player.avatarUrl}
        alt={player.userName}
        className={`h-12 w-12 rounded-full object-cover ${
          player.dropped ? "grayscale opacity-50" : ""
        }`}
        onError={(e) => {
          console.warn(
            `Failed to load avatar for ${player.userName}, using default.`,
            e,
          );
          (e.target as HTMLImageElement).src = "/avatars/default.png";
        }}
      />

      {/* username */}
      <p
        className={`text-center text-s font-semibold leading-tight wrap-break-word w-full ${
          player.dropped
            ? "text-slate-300"
            : player.isPlayerTurn
              ? " text-emerald-800" // ← turn name color
              : "text-slate-600"
        }`}
      >
        {isYou ? `You` : player.userName}
      </p>
      <PlayerStatus dropped={player.dropped} />
    </div>
  );
}

// Runs at every time useGamePage gets updated playerList and re-renders
export default function PlayerList({
  playerList,
  clientUsername,
}: PlayerListProps) {
  const turnPlayer = playerList.find((p) => p.isPlayerTurn);



      if (playerList.length > 0) {
      // Debugging logs to track changes
        console.log(`👤👤👤👤 PLAYER LIST UPDATED`);
        playerList.forEach((p, i) =>{
          console.log(
            ` ${i++}. ${p.userName} - ${p.dropped ? "(dropped)" : "in room"} - Is player turn: ${p.isPlayerTurn}`,
          );
        }
      );
    }

  return (
    <div className="mb-4 p-4 my-2">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
        Joined:
        <span className="ml-2 rounded-full bg-emerald-100 p-2 text-xs font-medium text-emerald-800">
          {playerList.length}
        </span>
      </h2>
      {playerList.length === 0 && (
        <p className="text-sm text-slate-400">Waiting for someone to join...</p>
      )}
      <div className="my-10 flex flex-wrap gap-3 ">
        {/* Sorts list before rendering, so that clientUser is set first */}
        {[...playerList]
          .sort((a, b) => {
            if (a.userName === clientUsername) return -1;
            if (b.userName === clientUsername) return 1;
            return 0;
          })
          .map((player, index) => (
            <PlayerItem
              key={index}
              player={player}
              clientUsername={clientUsername}
            />
          ))}
      </div>
      <TurnStatus turnPlayer={turnPlayer} />
    </div>
  );
}
