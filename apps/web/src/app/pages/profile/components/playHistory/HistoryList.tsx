import { mockProfiles } from "@/app/auth/mockProfiles";
import { GameHistoryItem } from "./HistoryListItem";

export function GameHistoryCard({ className }: React.ComponentProps<"div">) {
  // Using a mock profile for demonstration. In the real application, this data has to be fetched in the global state management layer (e.g. using React Query or Redux) and passed down to this component as a prop.
  const profile = mockProfiles[0];
  const gamesPlayed = profile.history.slice(0, 5); // show only 5 most recent gamesPlayed
  // const gamesPlayed = []; // <-------- if we want to test empty state, uncomment this and comment the line above

  const emptyHistory = () => (
    <div className="w-full">
      <div className="py-20 mx-auto max-w-md rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-900 shadow-sm">
        <div className="mx-auto w-fit text-center px-10">
          <p className="text-base text-sky-800 font-medium uppercase tracking-widest  ">
            No history available
          </p>
          <p className="text-xs text-start pb-10">
            This section here will show you the history of your recent matches,
            including who you played against, when you played, and whether you
            won or lost.
          </p>
          <p className="font-medium  text-sky-300  ">
            Well, what are you waiting for?
          </p>
        </div>
      </div>
    </div>
  );

  const foundHistory = () => (
    <div>
      {gamesPlayed.map((game) => (
        <GameHistoryItem key={game.id} game={game} />
      ))}
    </div>
  );

  return (
    <div>
      {/* {emptyHistory()} */}
      {foundHistory()}
    </div>
    // <div>{gamesPlayed.length === 0 ? emptyHistory() : foundHistory()}</div>
  );
}
