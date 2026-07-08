# Architecture Overview

The web client application is organized into a **page-centric modular architecture** that promotes separation of concerns, reusability, and maintainability. The main layers are: `app/`, `assets/`, `gameCanvas/`, `socket/`, `network/`, `events/`, and `shared/`.

Each layer has a specific responsibility, and pages colocate their own hooks, components, and types rather than splitting them into a separate `features/` layer.

---

# Table of Contents

- [App](#app)
  - [Router](#router)
  - [Auth](#auth)
  - [Pages](#pages)
- [Assets](#assets)
- [Game Canvas](#gamecanvas)
- [Socket & Network](#socket--network)
- [Events](#events)
- [Shared](#shared)
- [Full Structure Preview](#full-structure-preview)

---

# App

`apps/web/src/app/`

This folder contains the frontend application shell, global providers, the router, and all page-level components. It is responsible for defining the overall structure of the app and how users navigate between webpages.

```
app/
├── router/
│   └── AppRouter.tsx
├── auth/
│   ├── AuthContext.tsx
│   ├── AuthGuard.tsx
│   └── mockProfiles.ts
├── pages/
│   ├── home/
│   │   └── HomePage.tsx
│   ├── log/
│   │   ├── LogPage.tsx
│   │   ├── types.ts
│   │   ├── hooks/
│   │   │   └── useLogHandlers.tsx
│   │   └── components/
│   │       ├── LogIn.tsx
│   │       ├── Signup.tsx
│   │       └── formCard/
│   │           ├── Header.tsx
│   │           ├── Socials.tsx
│   │           └── Fields.tsx
│   ├── profile/
│   │   ├── ProfilePage.tsx
│   │   └── components/
│   │       ├── profileSection/
│   │       │   ├── ProfileSection.tsx
│   │       │   ├── StatsCards.tsx
│   │       │   ├── ProgressBar.tsx
│   │       │   ├── ProfileAvatar.tsx
│   │       │   └── ExperienceBadge.tsx
│   │       ├── GameCard/
│   │       │   ├── GameCard.tsx
│   │       │   ├── CreateCard.tsx
│   │       │   ├── JoinRoom.tsx
│   │       │   ├── GameOptions/
│   │       │   │   ├── GameOptionsCard.tsx
│   │       │   │   ├── OptionSwitcherBtn.tsx
│   │       │   │   ├── InviteFriends.tsx
│   │       │   │   └── JoinRandom.tsx
│   │       │   └── PendingGameCard/
│   │       │       ├── PendingGameCard.tsx
│   │       │       └── PendingGameTimer.tsx
│   │       └── GameHistorySection/
│   │           ├── GameHistorySection.tsx
│   │           ├── HistoryCard.tsx
│   │           └── OpponentsList.tsx
│   └── game/
│       ├── GamePage.tsx
│       └── hooks/
│           └── useGamePage.ts
├── App.tsx
└── App.css
```

[↑ Back to top](#table-of-contents)

---

## Router

`apps/web/src/app/router/AppRouter.tsx`

Uses **React Router v7** (`createBrowserRouter` + `RouterProvider`) to define all routes declaratively. Each route maps a URL path to a page component.
*Routes that require authentication are wrapped in `<AuthGuard>`.*

| Path | Component | Guarded | Description |
|---|---|---|---|
| `/` | `HomePage` | No | Dynamic redirect: authenticated → ProfilePage, unauthenticated → LogPage |
| `/profile` | `ProfilePage` | Yes (`AuthGuard`) | User profile, game creation, match history |
| `/game` | `GamePage` | Yes (`AuthGuard`) | Game lobby + Phaser canvas |

[↑ Back to top](#table-of-contents)

---

## Auth

`apps/web/src/app/auth/`

Centralized authentication using React Context. Handles token storage, user fetching, and guards.

| File | Purpose |
|---|---|
| `AuthContext.tsx` | `AuthProvider` + `useAuthContext` hook. On boot, reads token from `localStorage` and fetches `/api/users/me`. Exposes `login()`, `signup()`, `logout()`, `user`, `isAuthenticated`. Also manages the socket.io connection (connect on login, disconnect on logout). |
| `AuthGuard.tsx` | Wrapper component that redirects unauthenticated users away from protected routes. |
| `mockProfiles.ts` | Mock avatar data used in development. |

**Flow:**
1. App boots → `AuthProvider` reads token from localStorage to check if user is authentication is active.
2. If token exists → we need to fetch `/api/users/me` to get user data and confirm token validity. If valid, set user in context and connect socket (user then loads already authenticated and logged in)
3. If invalid, clears token and user from context (user then loads unauthenticated and sees login/signup).
3. `login()` / `signup()` → POST to backend → store token → fetch user → connect socket
4. `logout()` → POST `/api/auth/logout` → clear token → clear user → disconnect socket

[↑ Back to top](#table-of-contents)

---

## Pages

`apps/web/src/app/pages/`

Each page is a route-level component. Pages colocate their own hooks, sub-components, and types — keeping related code together. Pages should be thin orchestrators; complex logic lives in hooks.

### `home/HomePage.tsx`
Dynamic landing page. Reads `isAuthenticated` from `AuthContext` and renders either `ProfilePage` (logged in) or `LogPage` (logged out). No redirect — renders inline.

### `log/LogPage.tsx`
Combined login/signup view. Uses `useLogHandlers` hook for form state and submission logic. Renders either `<LogIn>` or `<Signup>` based on toggle state.

### `profile/ProfilePage.tsx`
The main dashboard after login. Composed of three sections:
- **ProfileSection** — avatar upload, username, stats, progress bar, experience badge
- **GameCard** — create room, join room, game options (invite friends, join random), pending game status
- **GameHistorySection** — match history with opponent lists and result cards

### `game/GamePage.tsx`
The game lobby and active game view. Uses `useGamePage` hook for socket communication (join room, player list, room state). Once the game starts, renders the Phaser canvas (`<PhaserGame>`).

[↑ Back to top](#table-of-contents)

---

# Assets

`apps/web/src/assets/`

Static files imported into components or the Phaser engine.

```
assets/
├── icons/              # Card images, logo, etc.
│   ├── couple-cards.webp
│   ├── uno_card_back.png
│   ├── reverse_card.jpg
│   ├── skip_card.webp
│   └── big-logo.png
├── backgrounds/        # Full-page background images
│   ├── bg_blur.jpg
│   ├── bg_side.jpg
│   ├── bg_hero.jpg
│   ├── bg_center.jpg
│   ├── bg_logo.jpg
│   └── unocards_gemini.png
└── default_images/
    └── default-avatar.png
```

[↑ Back to top](#table-of-contents)

---

# Game Canvas (Gabriel)

`apps/web/src/gameCanvas/`

The **Phaser 3** game engine layer. Completely decoupled from React — Phaser manages its own rendering loop. Communication between React and Phaser happens via the `EventBus` and socket events.

```
gameCanvas/
├── main.ts                 # Phaser game config & bootstrap
├── App.tsx                 # React component that mounts the Phaser canvas
├── PhaserGame.tsx          # Bridge: creates/destroys Phaser instance, forwards EventBus events
├── gameTypes.ts            # Shared TypeScript types (Card, Player, etc.)
├── scenes/
│   ├── Boot.ts             # Minimal bootstrap scene
│   ├── Preloader.ts        # Asset loading with progress bar
│   ├── MainMenu.ts         # Main menu / lobby scene
│   ├── GameScene.ts        # Active gameplay scene
│   └── GameOver.ts         # End-of-game results scene
├── managers/
│   ├── AssetLoader.ts      # Centralised asset loading
│   ├── BoardManager.ts     # Card layout, discard pile, draw pile
│   ├── InputManager.ts     # Click/tap handling on cards and UI
│   ├── RenderManager.ts    # Coordinates all rendering
│   └── UIManager.ts        # HUD, turn indicator, player info
├── models/
│   └── Render.ts           # Card rendering model
├── components/
│   ├── RoomState.tsx        # React component overlaid on Phaser for room state
│   └── RoomState.css
├── hooks/
│   └── useRoomState.ts     # React hook bridging socket room_state → React state
└── types/
    └── roomTypes.ts        # FrontendRoom type for socket payloads
```

**How it connects:**
1. React renders `<PhaserGame>` inside `GamePage`
2. `PhaserGame.tsx` creates a Phaser `Game` instance with the scene list
3. Socket events (`room_state`) flow through `EventBus` (Phaser's EventEmitter) to both React (`useRoomState`) and Phaser scenes
4. Player actions (`play_card`, `draw_card`) are emitted via `network/gameNetwork.ts` → socket.io

[↑ Back to top](#table-of-contents)

---

# Socket & Network

`apps/web/src/socket/` and `apps/web/src/network/`

### `socket/Socket.ts`
The singleton **socket.io client** instance. Configured with:
- `autoConnect: false` — connection is manually controlled by `AuthContext` (connect on login, disconnect on logout)
- `auth` callback reads JWT token from `localStorage`
- Listens for `room_state` and `display_pass_button` events and forwards them to the `EventBus`

### `network/gameNetwork.ts`
Thin wrapper functions that emit game actions to the socket. Keeps socket event names in one place.

| Function | Socket Event |
|---|---|
| `playCard(cardIndex)` | `play_card` |
| `drawCard()` | `draw_card` |
| `selectWildColor(color)` | `select_wild_color` |
| `passTurn()` | `on_press_pass_button` |

[↑ Back to top](#table-of-contents)

---

# Events

`apps/web/src/events/EventBus.ts`

A **Phaser `EventEmitter`** used as a global event bus. Decouples socket events from both React components and Phaser scenes without either knowing about the other.

```ts
// How it's used:
socket.on("room_state", (data) => EventBus.emit("room_state", data));
// React side:
EventBus.on("room_state", (data) => { /* update React state */ });
// Phaser side:
EventBus.on("room_state", (data) => { /* update game scene */ });
```

[↑ Back to top](#table-of-contents)

---

# Shared

`apps/web/src/shared/`

Reusable code not owned by any single page. If something is used by only one page, it belongs colocated in that page's folder.

```
shared/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── avatar.tsx
│   │   ├── card.tsx
│   │   ├── alert.tsx
│   │   ├── tabs.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── label.tsx
│   │   ├── field.tsx
│   │   ├── input-group.tsx
│   │   ├── file-upload.tsx
│   │   └── animated-tooltip.tsx
│   ├── footer.tsx
│   ├── signup-form.tsx
│   ├── file-upload-special-1.tsx
│   ├── scroll-area-chat-messages.tsx
│   └── legal/
│       ├── PrivacyPolicyContent.tsx
│       └── TermsContent.tsx
├── hooks/
│   ├── use-as-ref.ts
│   ├── use-controlled-state.tsx
│   ├── use-isomorphic-layout-effect.ts
│   └── use-lazy-ref.ts
├── lib/
│   ├── get-strict-context.tsx
│   └── utils.ts               # `cn()` classname helper (clsx + tailwind-merge)
├── animate-ui/                 # Animated component primitives
│   ├── components/
│   └── primitives/
├── shadcn-space/               # shadcn block examples
│   └── alert/
│       └── alert-04.tsx
└── shadcn-studio/              # shadcn block examples
    └── alert/
```

### `shared/components/ui/`
**shadcn/ui** component library primitives. These are the atomic building blocks used across all pages. They are unstyled by default and styled via Tailwind CSS classes passed as props.

### `shared/hooks/`
Generic React hooks with no domain-specific logic. These handle low-level React patterns (refs, controlled state, layout effects).

### `shared/lib/`
- `utils.ts` — the `cn()` helper for merging Tailwind classes
- `get-strict-context.tsx` — a type-safe context accessor that throws if used outside its provider

### `shared/components/`
Higher-level reusable components (footer, legal content, chat scroll area) that are used by multiple pages.

[↑ Back to top](#table-of-contents)

---

# Full Structure Preview

```
src/
├── app/
│   ├── router/
│   │   └── AppRouter.tsx              # React Router v7 route definitions
│   ├── auth/
│   │   ├── AuthContext.tsx            # Auth provider, login/signup/logout, socket lifecycle
│   │   ├── AuthGuard.tsx              # Route guard for protected pages
│   │   └── mockProfiles.ts           # Dev mock avatar data
│   ├── pages/
│   │   ├── home/
│   │   │   └── HomePage.tsx           # Dynamic landing (auth → profile, no-auth → log)
│   │   ├── log/
│   │   │   ├── LogPage.tsx            # Login/signup toggle page
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   │   └── useLogHandlers.tsx # Form state + submit logic
│   │   │   └── components/
│   │   │       ├── LogIn.tsx          # Login form
│   │   │       ├── Signup.tsx         # Signup form
│   │   │       └── formCard/
│   │   │           ├── Header.tsx     # Form header with logo
│   │   │           ├── Socials.tsx    # OAuth (42) login button
│   │   │           └── Fields.tsx     # Email/password/username inputs
│   │   ├── profile/
│   │   │   ├── ProfilePage.tsx        # Dashboard: profile + game creation + history
│   │   │   └── components/
│   │   │       ├── profileSection/    # Avatar, stats, progress bar
│   │   │       ├── GameCard/    # Create/join room, game options, pending game
│   │   │       └── GameHistorySection/# Match history list
│   │   └── game/
│   │       ├── GamePage.tsx           # Game lobby + Phaser canvas host
│   │       └── hooks/
│   │           └── useGamePage.ts     # Socket room lifecycle, player list, game start
│   ├── App.tsx                        # Shell: AuthProvider → AppRouter
│   └── App.css                        # App shell styles
│
├── assets/                            # Static files
│   ├── icons/                         # Card images, logo
│   ├── backgrounds/                   # Full-page backgrounds
│   └── default_images/                # Fallback avatars
│
├── gameCanvas/                        # Phaser 3 game engine
│   ├── main.ts                        # Phaser config & bootstrap
│   ├── App.tsx                        # React host for Phaser canvas
│   ├── PhaserGame.tsx                 # React-Phaser bridge (EventBus)
│   ├── gameTypes.ts                   # Game type definitions
│   ├── scenes/                        # Phaser scenes
│   │   ├── Boot.ts
│   │   ├── Preloader.ts
│   │   ├── MainMenu.ts
│   │   ├── GameScene.ts
│   │   └── GameOver.ts
│   ├── managers/                      # Phaser managers
│   │   ├── AssetLoader.ts
│   │   ├── BoardManager.ts
│   │   ├── InputManager.ts
│   │   ├── RenderManager.ts
│   │   └── UIManager.ts
│   ├── models/
│   │   └── Render.ts
│   ├── components/                    # React overlays on Phaser
│   │   ├── RoomState.tsx
│   │   └── RoomState.css
│   ├── hooks/
│   │   └── useRoomState.ts
│   └── types/
│       └── roomTypes.ts
│
├── socket/
│   └── Socket.ts                      # socket.io client singleton
│
├── network/
│   └── gameNetwork.ts                 # Game action emitters (play_card, draw_card, etc.)
│
├── events/
│   └── EventBus.ts                    # Phaser EventEmitter — global event bus
│
├── shared/                            # Reusable code (no single page owner)
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives (button, input, card, etc.)
│   │   ├── footer.tsx
│   │   ├── signup-form.tsx
│   │   ├── file-upload-special-1.tsx
│   │   ├── scroll-area-chat-messages.tsx
│   │   └── legal/                     # Privacy policy & terms content
│   ├── hooks/                         # Generic React hooks
│   ├── lib/                           # cn() helper, strict context
│   ├── animate-ui/                    # Animated primitives
│   ├── shadcn-space/                  # shadcn block examples
│   └── shadcn-studio/                 # shadcn block examples
│
├── lib/
│   └── get-strict-context.tsx         # (duplicate of shared/lib, may be deprecated)
│
├── main.tsx                           # Entry point — ReactDOM.createRoot
└── index.css                          # Global CSS / Tailwind imports
```

[↑ Back to top](#table-of-contents)
