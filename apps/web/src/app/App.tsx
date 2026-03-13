// import { useState } from 'react'
// import reactLogo from '../assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import { AppRouter } from "./router/AppRouter.tsx";
import { useEffect } from "react";

function App() {

  /* 
  THIS IS NOT MEANT TO BE HERE IN THE FINAL APP AS ONLY A TEST. 
  - testing here if the backend can be properly connected to the frontend.
  - i do not expect this endpoint to be used in the final app, unless we want to add also an admin dashboard (i would prefer not and that this is only available via backend testing)
  */
   useEffect(() => {
    fetch("https://localhost/api/users/")
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
