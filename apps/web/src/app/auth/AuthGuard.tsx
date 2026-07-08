/* 
By default, React Router v6 doesn't have a built-in way to protect routes based on authentication status.
It's a simple wrapper that is used around components in the router that should only be accessible to logged-in users.
It checks if the user is authenticated, and based on the result it redirects the user accordingly.
*/
import { Navigate } from "react-router";
import { useAuthContext } from "./AuthContext";
import type { ReactNode } from "react";

// children: the component that is wrapped by the guard (example: /game)
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/" replace />; // navigates to homePage if auth fails
  return <>{children}</>;
}