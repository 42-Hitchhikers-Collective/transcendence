/* 
NOTES FOR TEAM: useAuth is a custom hook that handles the logic for login and signup.
It provides two functions, handleLogin and handleSignup these functions are called from the AuthForm component depending
what mode us active (login or signup).
Currently these functions are not implemented but am planning to test them out with mock data to see if they work.

Backend API routes to send requests:
- app.get("/me") in users.ts is the API route that should be used from handleLogin() ?
- also auth.ts has the /login as a post route, but not sure this is correct as i would assume login should use get request. 

TODO: This might perhaps need to go into features folder, but will better check how the logic is shared across the app before deciding on that.
*/

import { useState } from "react";

export type EntryMode = "login" | "signup";
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: login logic
      console.log("login", username, password);
    } catch {
      setError("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: signup logic
      console.log("signup", data);
    } catch {
      setError("Signup failed");
    } finally {
      setIsLoading(false);
    }
  };
  return {
    handleLogin,
    handleSignup,
    error,
    isLoading,
  };
}
