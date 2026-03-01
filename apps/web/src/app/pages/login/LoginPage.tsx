import { Link } from "react-router";

function LoginPage() {
  return (
    <>
      <p>Login page Loaded 🪵</p>
      <Link to="/profile">Login</Link>
      <p>
        Dont have an account? <Link to="/signup">Sign up</Link>
      </p>
    </>
  );
}

export default LoginPage;
