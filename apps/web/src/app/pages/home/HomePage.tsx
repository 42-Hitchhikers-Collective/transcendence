/*
Homepage is meant to be a dynamic page, it changes its content based on the authentication state of the user.
It reads the auth state from AuthContext and:
- If there is no logged-in user, renders LogPage (the login/signup forms).
- If there is a logged-in user, renders ProfilePage.

The useAuthContext hook here works as a gateway to showing the right UI based on auth state.
*/

import { useAuthContext } from "../../auth/AuthContext.tsx";
import LogPage from "../log/LogPage.tsx";
import ProfilePage from "../profile/ProfilePage.tsx";

export default function HomePage() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <ProfilePage /> : <LogPage />;
}