import { Link } from "react-router";
import GameCanvas from "../../../features/game/App"
function GamePage() {
  return (
    <>
      <p>Game page Loaded 👾 </p>
      <Link to="/profile">Go back to profile </Link> <br />
      <Link to="/"> Log out </Link>
      < GameCanvas />
    </>
  );
}

export default GamePage;
