import { useEffect } from "react";
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
          {/* <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" /> */}
        </span>
      </div>
    );
  }
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
      className={`flex w-[88px] flex-col items-center gap-2 rounded-xl border-2 px-5 py-3 shadow-md ${
        player.dropped ? "border-slate-200" : "border-emerald-300"
      }`}
    >
      <img
        src={player.avatarUrl }
        alt={player.userName}
        className={`h-12 w-12 rounded-full object-cover ${
          player.dropped ? "grayscale opacity-50" : ""
        }`}
        onError={(e) => {
          const img = e.currentTarget;

          console.log("Failed URL:", img.src);

          if (img.src.includes("/avatars/default.png")) {
            console.log("Default avatar missing too, aborting.");
            return;
          }

          img.src = "/avatars/default.png";
        }}
      />
      <p
        className={`text-center text-s font-semibold leading-tight wrap-break-word w-full ${
          player.dropped ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {isYou ? (
            `You`
        ) : (
          player.userName
        )}
      </p>
      <PlayerStatus dropped={player.dropped} />
    </div>
  );
}

export default function PlayerList({
  playerList,
  clientUsername,
}: PlayerListProps) {
  // reloads component when list of players updates
  useEffect(() => {
    if (playerList.length > 0) {
      console.log(`👤👤👤👤 PLAYER LIST UPDATED`);
      let i = 0;
      playerList.map((p) =>
        console.log(
          ` ${i++}. ${p.userName} - ${p.dropped ? "(dropped)" : "in room"}`,
        ),
      );
    }
  }, [playerList]);

  return (
    // <div className="mb-4 bg-white rounded-xl p-4 my-2 shadow-sm">
    <div className="mb-4 p-4 my-2">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
        Joined:
        <span className="ml-2 rounded-full bg-emerald-100 p-2 text-xs font-medium text-emerald-800">
        {playerList.length}
          </span>
      </h2>
      {playerList.length === 0 && (
        <p className="text-sm text-slate-400">Waiting for someone to join...</p>
      )}{" "}
      <div className="mt-4 flex flex-wrap gap-3 ">
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
    </div>
  );
}
