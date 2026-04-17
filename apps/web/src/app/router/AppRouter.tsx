/* 

This is the static route map, it declares every URL the app responds to and which component handles it.
It has a home page that redirects to either login/signup or profile based on auth, and protected routes for profile and game pages.
It also guards routes that require the user to be logged in so it can protect against URL-based access from non-authenticated users.

Idiomatic usage - via dataRuters
https://reactrouter.com/start/data/custom  - info on data APIs in React Router
https://reactrouter.com/start/data/routing - how to use the createBrowserRouter API to define routes with loaders, actions, and error boundaries.
https://reactrouter.com/start/data/navigating

*/

import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from "../pages/home/HomePage.tsx"; // dynamic home page 
import GamePage from "../pages/game/GamePage";
import ProfilePage from "../pages/profile/ProfilePage";
import { AuthGuard } from "../auth/AuthGuard.tsx"; // guard wrapper

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage, /* HomePage redirects to /profile form if user is logged in, if not to login/signup form  */
  },
  {
    path: "/profile",
    element: (
      <AuthGuard> {/* Guard wrapped around page components that need to show only if logged in */}
        <ProfilePage />
      </AuthGuard>
    ),
  },
  {
    path: "/game", // to be changed to "/game/:roomId" later
    element: (
      <AuthGuard>  {/* Guard wrapped around page components that need to show only if logged in */}
        <GamePage />
      </AuthGuard>
    ),
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
