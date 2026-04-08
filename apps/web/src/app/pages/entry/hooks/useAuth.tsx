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
import type { FieldValues } from "../types";

export type EntryMode = "login" | "signup";
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FielValues are username and password (we do not need email)
  const handleLogin = async (data: FieldValues) => {
    setIsLoading(true);
    setError(null);
    console.log("Requesting Login details:", data);
    try {
      const body = {
        email: data.email ?? data.username,
        password: data.password,
      };

      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.log(
          `Backend responded with error: ${err?.error} \n message: ${err?.message}`,
        );
        setError("Something is wrong \n check console for more details");
        return;
      }

      const json = await res.json();
      // json.token available; app may store it or call refresh as needed
      return json;
    } catch {
      console.log(``);
      setError("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: FieldValues) => {
    setIsLoading(true);
    setError(null);
    console.log("Requesting Signup details:", data);
    try {
      const body = {
        email: data.email,
        password: data.password,
        username: data.username,
      };

      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.log(
          `Backend responded with error: ${err?.error} \n message: ${err?.message}`,
        );
        setError(err.message);
        return;
      }
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
