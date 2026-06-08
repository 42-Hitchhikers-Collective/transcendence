/* 
ABOUT: AuthContext owns the token and user info (isAuthenticated, user object) and exposes login/signup/logout methods that update them. 
It also runs the effect that fetches the user on app boot and whenever the token changes, so that the rest of the app can just read from context and not worry about syncing with the backend.

WHY: It's important that every component gets informed about the authentication status so that they can react accordingly (show/hide UI, redirect, etc).
Instead of having multiple fetch calls across to check through the app if the user is authenticated (through multiple fetches and prop drilling),
we use just a single fetch call on app boot to get the user info, and then we centralize this information in a global context that can be read from anywhere.
For example: this prevents to non-signeup users to access the /game route and profile page.


HOW:
- Boot: reads token from localStorage.
- When token changes: fetch /api/users/me to hydrate user.
- login(): POST /api/auth/login, store token, trigger user fetch.
- signup(): POST /api/auth/register, then login().
- logout(): POST /api/auth/logout and clear local state.
Components call useLogHandlersContext() to read state or call actions.

WHAT:
- token: string | null
- user: User | null
- isAuthenticated: boolean (derived from token)
- login(email, password)
- signup(email, password, username)
- logout()

HttpOnly, Secure cookies (best for most apps): JS can’t read them, so XSS can’t steal the token directly. Pair with CSRF protection (same‑site cookies + CSRF token).
In‑memory access token + HttpOnly refresh token: access token lives in memory (lost on refresh), refresh token in HttpOnly cookie.

*/

import {
  createContext,
  useContext,
  useState,
  useEffect,
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
}; /* TODO: put null rendering case */

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
// storage key name for the token; in a real app -> TODO : consider more secure storage than localStorage (e.g. HttpOnly cookies or in-memory with refresh tokens)
const TOKEN_KEY = "auth_token"; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<User | null>(null);

  // Fetches user whenever token changes; self-clean on failure
  useEffect(() => {
    if (!token) {
      // console.warn("AuthContext: no token found, clearing user");  
      if (socket.connected) {
        socket.disconnect();
      }
      // should the leave room or waiting show here?
      setUser(null);
      return;
    }

    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }

    console.info("Auth[token] - token present, fetching /api/users/me");
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const rawText = await res.text();
        // console.log("Auth[token] - /api/users/me raw body", rawText);
        if (!res.ok) throw new Error("invalid token");
        const data = rawText ? JSON.parse(rawText) : null;
        return data;
      })
      .then((data) => {
        console.log("Auth[token] - /api/users/me payload", data);
        if (data) setUser(data.user ?? data);
      })
      .catch(() => {
        console.warn("Auth[token] - /api/users/me failed, clearing token");
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      });
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    // console.log("LOGIN - /api/auth/login status", res.status);
    const loginRawText = await res.text();
    console.log("LOGIN - /api/auth/login token created", loginRawText);
    if (!res.ok) {
      const err = loginRawText ? JSON.parse(loginRawText) : null;
      console.log("LOGIN - /api/auth/login error payload", err);
      throw new Error(err?.error ?? err?.message ?? "login failed");
    }
    const parsed = loginRawText ? JSON.parse(loginRawText) : null;
    const newToken = parsed?.token ?? null;
    console.log("LOGIN - /api/auth/login token present", !!newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const signup = async (email: string, password: string, username: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, username }),
    });
    console.log("SIGNUP - /api/auth/register status", res.status);
    const signupRawText = await res.text();
    console.log("SIGNUP - /api/auth/register raw body", signupRawText);
    if (!res.ok) {
      const err = signupRawText ? JSON.parse(signupRawText) : null;
      console.log("SIGNUP - /api/auth/register error payload", err);
      throw new Error(err?.error ?? err?.message ?? "signup failed");
    }
    // Backend /register doesn't return a token; so we call auto-login on register success
    await login(email, password);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignoring network errors; clear client state regardless
    }
    if(socket.connected) // need to ensure we disconnect socket on LOGOUT TO SOLVE BUG
      { 
        console.warn("Logout - token disconnected");
        socket.disconnect();
      }
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      console.info("Logout success");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook that checks the authentication state
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useLogHandlersContext must be used inside AuthProvider");
  return ctx;
}