/* 

This is the static route map, it declares every URL the app responds to and which component handles it.
It has a home page that redirects to either login/signup or profile based on auth, and protected routes for profile and game pages.
It also guards routes that require the user to be logged in so it can protect against URL-based access from non-authenticated users.

Idiomatic usage - via dataRuters
https://reactrouter.com/start/data/custom  - info on data APIs in React Router
https://reactrouter.com/start/data/routing - how to use the createBrowserRouter API to define routes with loaders, actions, and error boundaries.
https://reactrouter.com/start/data/navigating

*/

import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import HomePage from "../pages/home/HomePage.tsx"; // renders LogPage or ProfilePage based on auth
import GamePage from "../pages/game/GamePage";
import { AuthGuard } from "../auth/AuthGuard.tsx"; // guard wrapper

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage, /* renders LogPage (login/signup) if not authenticated, ProfilePage if authenticated */
  },
  {
    path: "/game",
    element: (
      <AuthGuard>  {/* Guard wrapped around page components that need to show only if logged in */}
        <GamePage />
      </AuthGuard>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,  // redirects all unknown paths  to home
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
