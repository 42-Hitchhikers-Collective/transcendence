# Frontend Routing & Route Protection

> **Last updated**: 2026-07-03

---

## 1. Overview

The app uses **React Router v7** with `createBrowserRouter` to define routes declaratively, which means we can define the route tree in a single place which is the `AppRouter.tsx` file.

Our routing architecture is designed to support **protected routes** (only accessible to authenticated users) and **public routes** (accessible to anyone) and we do that by:

- Wrapping the entire app in an `AuthProvider`, a component that provides the auth state to all routes via React Context.
- Wrapping protected routes in an `AuthGuard`, a component that takes authentication state from the context passed by `AuthProvider` and renders the protected page if user is authenticated, or redirects to the login if not.

```
App.tsx
  └── AuthProvider (wraps entire app, provides auth state)
        └── AppRouter (route definitions)
              ├── /           → HomePage (renders LogPage or ProfilePage based on auth)
              └── /game?room= → AuthGuard → GamePage (protected, room via query param)
```

**Key files:**

| File | Role |
|---|---|
| `apps/web/src/app/App.tsx` | Wraps `AuthProvider` around `AppRouter` |
| `apps/web/src/app/router/AppRouter.tsx` | Declares all routes with `createBrowserRouter` |
| `apps/web/src/app/auth/AuthGuard.tsx` | Route wrapper that redirects to `/` if not authenticated |

---

## 2. App.tsx — the entry point

```tsx
// App.tsx
export default function App() {
  return (
    <AuthProvider>        {/* provides auth state to all routes */}
      <AppRouter />       {/* route definitions */}
    </AuthProvider>
  );
}
```

`AuthProvider` wraps the router so that any component inside any route can access auth state via `useAuthContext()`.

This is what makes `<AuthGuard>` work: it reads `isAuthenticated` from the context provided here.

---

## 3. AppRouter — route definitions

**File**: `apps/web/src/app/router/AppRouter.tsx`

```tsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
// ...

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,  // renders LogPage if not authenticated, ProfilePage if authenticated
  },
  {
    path: "/game",
    element: (
      <AuthGuard>
        <GamePage />
      </AuthGuard>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,  // catch-all: redirect unknown paths to home
  },
]);
```

### Route table

| Path | Protected? | Component | Notes |
|---|---|---|---|
| `/` | No | `HomePage` | Renders `LogPage` (login/signup) if not logged in, `ProfilePage` if logged in |
| `/game?room=<name>` | Yes | `GamePage` | Game room accessed via query parameter |
| `*` (any other) | No | `<Navigate to="/">` | Catch-all: redirects unknown paths (e.g., `/profile`, `/anything`) to `/` |

Only **three routes** exist. There is no separate `/profile` route — `HomePage` handles both auth states. This avoids duplication: the profile is the app's "home" when authenticated. The catch-all `*` route ensures unknown paths (like the old `/profile`) redirect gracefully instead of showing a 404.

### How HomePage works

```tsx
export default function HomePage() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <ProfilePage /> : <LogPage />;
}
```

- Not authenticated → shows login/signup forms
- Authenticated → shows the full profile page (stats, history, avatar, create game)

No redirect, no separate route — just conditional rendering at `/`.

---

## 4. AuthGuard — how route protection works

**File**: `apps/web/src/app/auth/AuthGuard.tsx`

```tsx
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

### Behavior

| `isAuthenticated` | Result |
|---|---|
| `false` | Redirects to `/` (home/login) using `<Navigate replace />` |
| `true` | Renders the child component (the protected page) |

The `replace` prop means: replace the current history entry instead of pushing a new one. Without it, a user who types `/game` in the URL bar while logged out would be redirected to `/`, and pressing "back" would take them back to `/game` (which would redirect again) — creating an infinite loop. With `replace`, "back" skips the redirect.

### No redirect flash

`AuthProvider` has a `loading` state that returns `null` until the initial auth check completes:

```
User navigates to /game while logged out
  │
  ▼
AuthProvider: loading = true → renders nothing
  │
  ▼
fetchUser() → GET /api/users/me → fails (not authenticated)
  │
  ▼
loading = false → renders children
  │
  ▼
AuthGuard: isAuthenticated === false → <Navigate to="/" />
```

Without the loading guard, `isAuthenticated` would initially be `false`, causing a flash redirect to `/` before `fetchUser()` completes. The user would briefly see the login page, then nothing, then the login page again — a flicker. With the guard, they see nothing until the real auth state is known.

### It's UX-only. Backend handles real security.

| Layer | What it does |
|---|---|
| **AuthGuard** | Prevents unauthenticated users from seeing protected pages (UX) |
| **`preHandler: [app.auth]`** | Returns 401 for any API call without a valid token (security) |

Even if someone bypasses AuthGuard by modifying the React app in DevTools, all API calls still require a valid JWT in the HttpOnly cookie. The backend is the real security boundary.

---

## 5. Game room routing via query parameter

The game page uses a **query parameter** rather than a URL path segment:

```
/game?room=my-room-name     ← actual URL
```

This is intentional: the room is discovered at runtime when a player creates or joins a game, not hardcoded in a route pattern.

### GamePage flow

```tsx
export default function GamePage() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("room");

  if (!roomName) return <Navigate to="/" replace />;
  return <GamePageContent roomName={roomName} />;
}
```

- Reads `?room=` from the URL
- If no room name → redirects to `/` (user shouldn't be here without a room)
- If room name present → renders the game canvas, chat, player list, etc.

### How players enter a room

1. Player A creates a room → receives a room name → navigates to `/game?room=my-room`
2. Player A shares the room name (via the in-app UI)
3. Player B enters the room name → navigates to `/game?room=my-room`
4. Both are now in the same game room via Socket.IO

The URL is not a "deep link" others can guess — the room name is generated by the server and only shared between players in the app.
