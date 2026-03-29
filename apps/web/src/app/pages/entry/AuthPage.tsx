/* 
NOTES FOR TEAM: EntryPage is the main page component for the login and signup page. 
This page is meant to load when the user navigates to our root page and is not authenticated (the logic for that still needs to be implemented).
EntryPage is responsible for rendering the EntryCard component which appears differently based on what mode is active (login or signup).
Login is active by default view (as it's the most common use case) but the user can toggle to signup if they don't have an account yet and viceversa once they have an account.
*/

// https://animate-ui.com/docs/components/animate/tabs1

/* My componente */
import {useState } from "react";
/* Hooks */
import { useAuth } from "./hooks/useAuth";
/* My components */
import { Login } from "./components/LogIn";
import { Signup } from "./components/Signup";
import background from "@/assets/backgrounds/bg_center.jpg";
/* Types */
import type { AuthMode } from "./Types";



export default function EntryPage() {
  const { handleLogin, handleSignup, error, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const onRequestMode = () =>
    setMode((pendMode) => (pendMode === "login" ? "signup" : "login"));
  // in setmode parenthesis is an updater function, a function that assigns nextState to pendingState when setMode is triggered by children

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-black/50 blur-xs z-0"
        style={{ backgroundImage: `url(${background})` }}
      />

      {/*  */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {mode === "login" ? (
          <Login
            onRequestMode={onRequestMode}
            onLogin={handleLogin}
            error={error}
            isLoading={isLoading}
          />
        ) : (
          <Signup
            onRequestMode={onRequestMode}
            onSignup={handleSignup}
            error={error}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
