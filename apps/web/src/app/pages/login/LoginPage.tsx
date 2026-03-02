import { useState } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginCard } from "@/app/pages/login/components/LoginCard";
import { SignupForm } from "@/shared/components/signup-form";

type Mode = "login" | "signup";

export default function LoginPage() {
  // const [mode, setMode] = useState<Mode>("login"); // tbd when implementing login/signup toggle functionality

  return (
    <div className="relative min-h-svh overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-black/50"
      />
      <div className="relative z-10 flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-xl  p-8 "> 
          {/* bg-white/90 shadow-xl backdrop-blur-md */}
          <LoginCard
            className="w-full"
            handleLogin={() => Promise.resolve()}
            error={null}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}
