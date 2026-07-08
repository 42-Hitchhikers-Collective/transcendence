/*
ABOUT: AuthContext manages authentication state via HttpOnly cookies (XSS-safe).
On mount it checks /api/users/me — if the cookie is valid, the user is authenticated.
login/signup set the cookie via the backend; logout clears it.

HOW:
- Boot: fetch /api/users/me (cookie sent automatically).
- login(): POST /api/auth/login → cookie set → fetch user.
- signup(): POST /api/auth/register, then login().
- logout(): POST /api/auth/logout → cookie cleared → disconnect socket → clear state.

WHAT:
- user: User | null
- isAuthenticated: boolean
- login(email, password)
- signup(email, password, username)
- logout()
*/

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { socket } from "@/socket/Socket";

type User = {
  id: string;
  email: string;
  createdAt?: string;
  username?: string;
  profile?: {
    username?: string;
    avatarUrl?: string | null;
  } | null;
  stats?: {
    rank: number | null;
    wins: number;
    losses: number;
  };
}; /* TODO: put null rendering case */

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // state to track if the user is authenticated
  const [loading, setLoading] = useState(true); // true until initial check completes

  // Fetches the current user on component mount so that the profile page is loaded if the user stayed logged in and/or token did not expire
  // useEffect would run again and again, so we use useCallback to memoize (cache) the function and prevent unnecessary re-renders
  // IMPORTANT: if fetch users /me fails  it is expected behaviour, it just means that the user is not logged in!
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me", { credentials: "include" /* includes the token */});
      if (!res.ok) throw new Error("not authenticated");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : null;
      const fetchedUser = data?.user ?? data;
      if (fetchedUser) {
        setUser(fetchedUser);
        setIsAuthenticated(true);
      }
    } catch {
      console.log("👤 AUTHENTICATION: profile could not load due to user not being logged in or token session expiration");
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // When fetchUser state changes the loadin state that we set to true when lo
  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser]);

  // Connects/disconnects socket based on authentication state
  useEffect(() => {
    if (isAuthenticated) {
      if (!socket.connected) {
        socket.once("connect", () => {
          console.log(`👤 AUTHENTICATION: socket connected, ID: ${socket.id}`);
        });
        socket.connect();
      }
    } else {
      if (socket.connected) {
        socket.disconnect();
        console.log("👤 AUTHENTICATION: socket disconnected");
      }
      setUser(null);
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string) => {
    console.log("🚪 LOGIN: sending request to backend");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const raw = await res.text();
    if (!res.ok) {
      const err = raw ? JSON.parse(raw) : null;
      console.log("🚪 LOGIN: failed with error ", err);
      throw new Error(err?.error ?? err?.message ?? "login failed");
    }
    console.log("🚪 LOGIN: success, cookie set");
    // Cookie is now set — fetch user to hydrate state
    await fetchUser();
  };

  // signup first registers the user, then logs them in to set the cookie
  const signup = async (email: string, password: string, username: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, username }),
    });
    console.log("📋 SIGNUP: status", res.status);
    const signupRawText = await res.text(); 
    console.log("📋 SIGNUP: signupRawText body", signupRawText);
    if (!res.ok) {
      const err = signupRawText ? JSON.parse(signupRawText) : null;
      console.log("📋 SIGNUP: error payload", err);
      throw new Error(err?.error ?? err?.message ?? "signup failed");
    }
    // Register succeeded, awaits login to set the cookie and fetches user
    await login(email, password);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors; clear client state regardless
    }
    console.log("👋 LOGOUT: clearing auth state");
    setIsAuthenticated(false);
    setUser(null);
    console.info("LOGOUT: success");
  };

  // Don't render children until initial auth check completes
  if (loading) return null;

  return (
    // auth context provider that provides the user, isAuthenticated, 
    // login, signup, and logout functions to its children
    // we do this so that we can access the auth context from any component in the app
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook that checks the authentication state
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
