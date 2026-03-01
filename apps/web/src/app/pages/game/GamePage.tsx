import { Link } from "react-router";
function GamePage() {
  return (
    <>
      <p>Game page Loaded 👾 </p>
      <Link to="/profile">Go back to profile </Link> <br />
      <Link to="/"> Log out </Link>
    </>
  );
}

export default GamePage;
