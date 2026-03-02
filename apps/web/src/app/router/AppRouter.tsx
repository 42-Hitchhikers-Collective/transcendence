/* 
https://reactrouter.com/start/data/custom  - info on data APIs in React Router
https://reactrouter.com/start/data/routing - how to use the createBrowserRouter API to define routes with loaders, actions, and error boundaries.
*/

import { createBrowserRouter, RouterProvider } from "react-router";
import EntryPage from "../pages/entry/EntryPage"; // pages are imported as deafult exports as they are specific non-shared route components and ro enable lazy loading (thet are loaded only when the user navigates to that route)
import GamePage from "../pages/game/GamePage";
import ProfilePage from "../pages/profile/ProfilePage";

// Define your routes as a data object
const router = createBrowserRouter([
  {
    path: "/",
    element: <EntryPage />, // the default page will change  depending on if the user is authenticated or not, but for now we will just load the EntryPage as the default page for simplicity and to test the login/signup flow.
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/game", // to be changed to "/game/:roomId" when we implement dynamic routing for different game rooms id https://reactrouter.com/start/data/routing#dynamic-segments
    element: <GamePage />,

    // TO BE ADDED LATER:
    // path: "teams/:teamId",
    // loader: async ({ params }) => {
    //   console.log("Fetching data for room:", params.roomId);
    //   return { roomId: params.roomId }; //  In a real app, you would fetch data from an API here using the roomId
    //   }
    // Loader functions are used to fetch data before rendering a route.
    // They run on the server during SSR and in the browser during client-side navigation.
    // The data returned from a loader is available in the route component via the useLoaderData hook.
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
