import { mockProfiles } from "@/features/profile/mockData/mockProfiles";
import { GameHistoryItem } from "./HistoryListItem";

export function GameHistoryCard({className}: React.ComponentProps<"div">) {
  
  // Using a mock profile for demonstration. In the real application, this data has to be fetched in the global state management layer (e.g. using React Query or Redux) and passed down to this component as a prop.
  const profile = mockProfiles[0]; 
  const gamesPlayed = profile.history.slice(0, 5); // show only 5 most recent gamesPlayed
  // const gamesPlayed = []; // <-------- if we want to test empty state, uncomment this and comment the line above

  const emptyHistory = () => (
    <p className="text-muted-foreground">Play your first match to add it in your history!</p>
  );

  const foundHistory = () => (
    <div className="space-y-3">
      {gamesPlayed.map((game) => (
        <GameHistoryItem key={game.id} game={game} />
      ))}
    </div>
  );

  return (
    <div className="text-center">
      <h2 className="mb-6 text-xl font-bold">Game History</h2>
      {gamesPlayed.length === 0 ? emptyHistory() : foundHistory()}
    </div>
  );

}