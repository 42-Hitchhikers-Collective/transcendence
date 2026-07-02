/* 
NOTES FOR TEAM: EntryPage is the main page component for the login and signup page. 
This page is meant to load when the user navigates to our root page and is not authenticated (the logic for that still needs to be implemented).
EntryPage renders a 3D flip card: Login on the front face, Signup on the back. 
Flipping is triggered by clicking the "Sign up" / "Login" toggle buttons inside each form.
*/

// Flip animation powered by animate-ui community flip-card pattern:
// https://animate-ui.com/docs/components/community/flip-card

import { easeOut, motion } from "motion/react";

/* My components */
import { useState } from "react";
/* Hooks */
import { useLogHandlers } from "./hooks/useLogHandlers";
/* My components */
import { Login } from "./components/LogIn";
import { Signup } from "./components/Signup";
import background from "@/assets/backgrounds/bg_center.jpg";
/* Types */

const cardVariants = {
  front: { rotateY: 0, transition: { duration: 0.6, ease: easeOut } },
  back: { rotateY: 180, transition: { duration: 0.6, ease: easeOut } },
};

export default function EntryPage() {
  const { handleLogin, handleSignup, error, isLoading } = useLogHandlers();
  const [mode, setMode] = useState<"login" | "signup">("login");


  const onRequestMode = (target?: "login" | "signup") =>
    setMode((pendMode) =>
      target ? target : pendMode === "login" ? "signup" : "login",
    );
  // in setmode parenthesis is an updater function, a function that assigns nextState to pendingState when setMode is triggered by children

  return (
    <div className="relative min-h-screen flex items-center justify-center ">
      {/* Background image */}
      <motion.div
        className="absolute inset-0 bg-center bg-cover z-0"
        style={{ backgroundImage: `url(${background})` }}
        animate={{
          filter: mode === "signup"
            ? "grayscale(100%) brightness(0.30)"
            : "grayscale(0%) brightness(1)",
        }}
        transition={{ duration: 0.6, ease: easeOut }}
      />
      {/* Login / Signup tab animated switch */}
      <div className="relative z-10 w-[92vw] sm:w-[450px] h-[clamp(380px,75vh,550px)] perspective-1000">
        {/* FRONT: Login (white card face) */}
        <motion.div
          className="absolute inset-0 backface-hidden"
          animate={mode === "signup" ? "back" : "front"} // back and front are card variants style of the component
          variants={cardVariants}
          style={{  }}
        >
          <Login
            onRequestMode={onRequestMode}
            onLogin={handleLogin}
            error={error}
            isLoading={isLoading}
          />
        </motion.div>

        {/* BACK: Signup (dark-mode card) */}
        <motion.div
          className="absolute inset-0 backface-hidden"
          initial={{ rotateY: 180 }}
          animate={mode === "signup" ? "front" : "back"} // back and front are card variants style of the component
          variants={cardVariants}
          style={{ rotateY: 180 }}
        >
          <Signup
            onRequestMode={onRequestMode}
            onSignup={handleSignup}
            error={error}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </div>
  );
}
