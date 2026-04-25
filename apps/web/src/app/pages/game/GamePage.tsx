import { Link } from "react-router";
function GamePage() {
  return (
    
    <div className="bg-green-500">
      <p>Game page Loaded 👾 </p>
      {/* 
      Game loading bg component cold be cool - unsure if necessary and adding a note
      https://ui.aceternity.com/components/wavy-background
      */}
      <Link to="/profile">Go back to profile </Link> <br />
      <Link to="/"> Log out </Link>
    </div>
  );
}

export default GamePage;
