import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* TODO: Change app viewport so that background extends to full screen */}
    <App />
  </StrictMode>,
);
