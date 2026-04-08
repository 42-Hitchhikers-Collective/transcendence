import "./App.css";
import { AppRouter } from "./router/AppRouter.tsx";
import { useEffect } from "react";

function App() {

  /* 
  THIS IS NOT MEANT TO BE HERE IN THE FINAL APP AS ONLY A TEST. 
  - testing here if the backend can be properly connected to the frontend.
  - i do not expect this endpoint to be used in the final app, unless we want to add also an admin dashboard (i would prefer not and that this is only available via backend testing)
  
  Right now both backend and frontend run either on https://localhost/ or https://127.0.0.1/
  If they do not run on the same port the connection of course won't work as we need
  both cross-origin permissions and tsl certificates to do that
  */
   useEffect(() => {
    fetch("api/users") // as both backend and frontend run on the same port, for now we can use a relative path to call the backend API
      .then((res) => res.json())
      .then((data) => console.log("Users from API:", data))
      .catch((err) => console.error("API Error:", err));
  }, []);


  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
