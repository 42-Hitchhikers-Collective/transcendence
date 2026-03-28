/* 
NOTES FOR TEAM: EntryPage is the main page component for the login and signup page. 
This page is meant to load when the user navigates to our root page and is not authenticated (the logic for that still needs to be implemented).
EntryPage is responsible for rendering the EntryCard component which appears differently based on what mode is active (login or signup).
Signin is active by default view (as it's the most common use case) but the user can toggle to signup if they don't have an account yet and viceversa once they have an account.
*/

// https://animate-ui.com/docs/components/animate/tabs1

import { useState } from "react";
import {
  EntryCard,
  type EntryMode,
} from "@/app/pages/entry/components/EntryCard";
import { useAuth } from "./hooks/useAuth";
import background from "@/assets/backgrounds/bg_center.jpg";

export default function EntryPage() {
  const { handleLogin, handleSignup, error, isLoading } = useAuth();

  const [mode, setMode] = useState<EntryMode>("login");
  const onToggleMode = () =>
    setMode((mode) => (mode === "login" ? "signup" : "login"));

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-black/50 blur-xs z-0"
        style={{ backgroundImage: `url(${background})` }}
      />

      {/* Overlay content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <EntryCard
          mode={mode}
          onToggleMode={onToggleMode}
          handleLogin={handleLogin}
          handleSignup={handleSignup}
          error={error}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
