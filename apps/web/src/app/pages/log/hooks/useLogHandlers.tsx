/* 
NOTES FOR TEAM: useLogHandlers is a custom hook that handles the logic for login and signup.
It provides two functions, handleLogin and handleSignup these functions are called from the AuthForm component depending
what mode us active (login or signup).
Currently these functions are not implemented but am planning to test them out with mock data to see if they work.

Backend API routes to send requests:
- app.post("/me") in users.ts is the API route that should be used from handleLogin() ?

NOTES FOR TEAM: page-local hook for the login/signup forms.
Owns form state (loading, error) and post-submit navigation.
Delegates the actual auth network calls + token storage to AuthContext.

TUTORIAL:
https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications


Goal: Handle the form-level concerns of the login/signup UI — loading spinner, error message display, redirect after success — while delegating the actual auth work to the context.
What it does:

Calls the context useLogHandlers() (aliased as useAuthContext) to get login and signup.
Calls useNavigate() to get the function that redirects after success.
Owns two pieces of local form state: isLoading (for disabling the submit button / showing a spinner) and error (for rendering an error message in the form).
handleLogin(data): sets loading true, calls context login() with the form values, on success navigates to /, on failure catches the thrown error and puts its message in error state. Always clears loading at the end.
handleSignup(data): same pattern with context signup().

Why it matters: This is the seam between your form UI and your auth system. The form components (<Login>, <Signup>) don't know anything about tokens or fetch calls — they just call handleLogin(data) and display whatever error shows up. Keeping these concerns split means you can redesign the forms, change the API, or swap auth providers later without rewriting the other side.


*/

import { useState } from "react";
import { useNavigate } from "react-router"; // hook that returns a function for programmatic navigation, it allows to change routes in response to actions like form submissions or button clicks. It enables moving to specific paths, relative routing, or navigating through the history stack (back/forward)
import { useAuthContext} from "../../../auth/AuthContext";
import type { FieldValues } from "../types";

export type EntryMode = "login" | "signup";

export function useLogHandlers() {
  const { login, signup } = useAuthContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: FieldValues) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Auth UI: submit login", {
        email: data.email,
        username: data.username,
      });
      await login(data.email ?? data.username, data.password);
      console.log("Auth UI: login ok, navigating to /");
      navigate("/"); // HomePage will render ProfilePage
    } catch (e: any) {
      console.log("Auth UI: login failed", e);
      setError(e?.message ?? "login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: FieldValues) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Auth UI: submit signup", {
        email: data.email,
        username: data.username,
      });
      await signup(data.email, data.password, data.username);
      console.log("Auth UI: signup ok, navigating to /");
      navigate("/");
    } catch (e: any) {
      console.log("Auth UI: signup failed", e);
      setError(e?.message ?? "signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, handleSignup, error, isLoading };
}