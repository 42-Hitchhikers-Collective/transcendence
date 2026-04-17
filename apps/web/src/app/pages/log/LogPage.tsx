/* 
NOTES FOR TEAM: EntryPage is the main page component for the login and signup page. 
This page is meant to load when the user navigates to our root page and is not authenticated (the logic for that still needs to be implemented).
EntryPage is responsible for rendering the EntryCard component which appears differently based on what mode is active (login or signup).
Login is active by default view (as it's the most common use case) but the user can toggle to signup if they don't have an account yet and viceversa once they have an account.
*/

// https://animate-ui.com/docs/components/animate/tabs1

import {
  Tabs,
  TabsContent,
  TabsContents,
} from "@/shared/animate-ui/components/animate/tabs";

/* My componente */
import { useState } from "react";
/* Hooks */
import { useLogHandlers } from "./hooks/useLogHandlers";
/* My components */
import { Login } from "./components/LogIn";
import { Signup } from "./components/Signup";
import background from "@/assets/backgrounds/bg_center.jpg";
/* Types */

export default function EntryPage() {
  const { handleLogin, handleSignup, error, isLoading } = useLogHandlers();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const onRequestMode = (target?: "login" | "signup") =>
    setMode((pendMode) =>
      target ? target : pendMode === "login" ? "signup" : "login",
    );
  // in setmode parenthesis is an updater function, a function that assigns nextState to pendingState when setMode is triggered by children

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-black/50 blur-xs z-0"
        style={{ backgroundImage: `url(${background})` }}
      />
      {/* Login / Signup tab animated switch */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
            <TabsContents /* className="py-6" */>
              <TabsContent value="login">
                <Login
                  onRequestMode={onRequestMode}
                  onLogin={handleLogin} // calls api
                  error={error}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="signup">
                <Signup
                  onRequestMode={onRequestMode}
                  onSignup={handleSignup}
                  error={error}
                  isLoading={isLoading}
                />
              </TabsContent>
            </TabsContents>
        </Tabs>
      </div>
    </div>
  );
}
