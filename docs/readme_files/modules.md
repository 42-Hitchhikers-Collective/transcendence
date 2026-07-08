# 1. List of chosen modules

- [Minor: Use a frontend framework (React, Vue, Angular, Svelte, etc.).](#frontend-framework)
- [Minor: Use a backend framework (Express, Fastify, NestJS, Django, etc.).](#backend-framework)
- [Major: Implement real-time features using WebSockets or similar technology.](#real-time-websockets)
- [Minor: Use an ORM for the database.](#orm)
- [Minor: A complete notification system for all creation, update, and deletion actions.](#notifications)
- [Minor: file upload and management system.](#file-upload)
- [Minor: Support for additional browsers.](#additional-browsers)
- [Minor: Game statistics and match history (requires a game module).](#game-stats)
- [Major: Implement a complete web-based game where users can play against eachother.](#web-based-game)
- [Major: Remote players — Enable two players on separate computers to play the same game in real-time.](#remote-players)
- [Major: Multiplayer game (more than two players).](#multiplayer)

### Points total: 15

# 2. Custom modules (Bonus)

The standard module checklist covers mostly the building blocks of a fullstack application: a frontend framework, a backend, WebSockets, a database. 
We are suggesting these bonus modules because we think we went beyond this requirement by implementing extra features that can be considered full fledged systems that guide each user through every step of our project.
We wanted to create an immersive experience not only visually but also functionally, where the website feels alive and responsive to every action, never leaving the player wondering what just happened or what they should do next.

### List of Custom Bonus modules (1 major & 3 Minor)
- [Major: Gameplay lifecycle management system.](#gameplay-lifecycle)
- [Minor: Game State Privacy & Transformation Pipeline](#game-state-privacy)
- [Minor: personaised and Interactive frontend with reactive animated components.](#interactive-frontend)
- [Minor: State-Driven Routing & Access Control Architecture](#routing-access-control)

### Total points added: 5


# 3. Final points calculation
The mandatory modules give us 15 points and the bonus modules give us 5 points, making a total of **20 points**.


# 4. Detailed description of the chosen modules

### Web section

<a id="frontend-framework"></a>
- ### Minor: Use a frontend framework (React, Vue, Angular, Svelte, etc.).
    ```Team members: jslusark```

<a id="backend-framework"></a>
- ### Minor: Use a backend framework (Express, Fastify, NestJS, Django, etc.)

    ```Team members: wlucke```

<a id="real-time-websockets"></a>
- ### Major: Implement real-time features using WebSockets or similar technology.
  - Real-time updates across clients.
  - Handle connection/disconnection gracefully.
  - Efficient message broadcasting.

    ```Team members: ilazar```

<a id="orm"></a>
- ### Minor: Use an ORM for the database.
    ```Team members: wlucke```

<a id="notifications"></a>
- ### Minor: A complete notification system for all creation, update, and deletion actions.
    ```Team members: ilazar, jslusark```

<a id="file-upload"></a>
- ### Minor: File upload and management system.
  - Support multiple file types (images, documents, etc.).
  - Client-side and server-side validation (type, size, format).
  - Secure file storage with proper access control.
  - File preview functionality where applicable.
  - Progress indicators for uploads.
  - Ability to delete uploaded files.
    
    ```Team members: wlucke, jslusark```

<p align="right"><a href="#1-list-of-chosen-modules">↑ back to top</a></p>

______

### Accessibility and Internationalization section

<a id="additional-browsers"></a>
- ### Minor: Support for additional browsers.
  - Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.).
  - Test and fix all features in each browser.
  - Document any browser-specific limitations.
  - Consistent UI/UX across all supported browsers.

    ```Team members: jslusark```

<p align="right"><a href="#1-list-of-chosen-modules">↑ back to top</a></p>

______

### User Management section

<a id="game-stats"></a>
- ### Minor: Game statistics and match history (requires a game module).
  - Track user game statistics (wins, losses, ranking, level, etc.).
  - Display match history (1v1 games, dates, results, opponents).
  - Show achievements and progression.
  - Leaderboard integration.

    ```Team members: wlucke, jslusark```

<p align="right"><a href="#1-list-of-chosen-modules">↑ back to top</a></p>

______

### Gaming and user experience section

<a id="web-based-game"></a>
- ### Major: Implement a complete web-based game where users can play against eachother.
    - The game can be real-time multiplayer (e.g., Pong, Chess, Tic-Tac-Toe, Card
  games, etc.). - Players must be able to play live matches. - The game must have clear rules and win/loss conditions. - The game can be 2D or 3D.

    ```Team members: grial```

<a id="remote-players"></a>
- ### Major: Remote players — Enable two players on separate computers to play the same game in real-time.
    - Handle network latency and disconnections gracefully.
    - Provide a smooth user experience for remote gameplay.
    - Implement reconnection logic.

    ```Team members: ilazar, grial, jslusark```

<a id="multiplayer"></a>
- ### Major: Multiplayer game (more than two players).
  - Support for three or more players simultaneously.
  - Fair gameplay mechanics for all participants.
  - Proper synchronization across all clients.

    ```Team members: ilazar, grial, jslusark```

<p align="right"><a href="#1-list-of-chosen-modules">↑ back to top</a></p>


# 5. Detailed description of the bonus modules

<a id="gameplay-lifecycle"></a>
### Major: Gameplay lifecycle management system.

- **Create a Game reconnection system that gives players a grace period to rejoin a room if their socket connection drops:**
  - If player drops from the room they are given a 30 seconds grace timer period to come back.
  - If the player is back within the grace period, the timer resets and they appear as back in the room.
  - If the player is not back within the grace period, they are automatically kicked out from the room and cannot rejoin if the game has already started.
  - If a player dropped and grace period is active, the profile page notifies the user that a room is waiting for them. If the timer expires, the option disappears from the page.
  - Users that leave an active game are not included in the match history
  - The feature works either when navigating through the website ui, browser tab navigation and page refreshes.

- **Handling unexpected user interaction between rooms**:
We give cover error edge cases for every possible invalid interaction that a player can do, and we provide user-friendly error messages to guide the user back to a valid state. We handle the following edge cases:
  - Player tries to join a non-existent room
  - Player tries to join a different room while they are already in another room
  - Player tries to join a room with 4 players (the maximum number of players allowed for each game)
  - Player tries to start a game with only 1 player
  - Player tries to join a room where the game already started
  - Player is left alone when a game has started (game is aborted and not recorded in match history)
  - After leaving, Player tries to join a room where the game already started
  - All players leave (room auto-deleted)
  - Duplicate joins (no double partecipation, user has only one socket connection per room)

- **Chat history for each room:**
  - chat messages are not lost on page refreshes
  - chat notifies of room state (create, join, start, drop, leave, end)
  - chat history is kept in running server until a game is finished

```Team members: ilazar jslusark```

```
Why we suggest as a bonus module: 

Our room is not a standard join/leave mechanism.
Our system implements a complete lifecycle manager with dual-index lookups, a formal state machine, cross-layer consistency (backend ↔ frontend ↔ canvas ↔ database), a race-condition-safe disconnect grace period with cancellation, comprehensive edge-case error handling for every invalid interaction, automatic resource cleanup and database-level game outcome integrity.
The value of this module is that it provides a robust, user-friendly, and secure experience for players, ensuring that the game state is always consistent and intuitive. It's importnat top provide an experience that allows the user not to break the app navigation and to always be able to recover from any unexpected situation.
```

<p align="right"><a href="#1-list-of-chosen-modules">↑ back to top</a></p>

---
<a id="game-state-privacy"></a>
### Minor: Game State Privacy and edge-case handling between frontend (canvas) and backend (game engine)

- **Phaser canvas enforcement**: opponent cards render as card-backs only; the local player's hand renders face-up with full card data
- **Turn-gated canvas input**: drag-and-drop and draw-pile interactions are disabled during opponents' turns
- **Out-of-turn feedback**: attempting to interact out of turn triggers an animated "Wait for your turn" toast via Phaser tweens
- **Game handling edgecases involving unusual player interaction and special cards:**
    - Handles edgecase when player leaves while having to choose a color for wild cards: auto-selects a random color and continues the game
    - Handles edgecases for +4/+2 when player leaves while still having to draw cards: cards are returned to the draw pile and the next player inherits the pending draw
    - Ensures the game does not start with a special card as the first card in the discard pile: `initialCard()` re-draws until a valid number card is found
    - Handles player leaving mid-game: returns their hand to the draw pile, removes them from the turn order, and auto-advances if it was their turn
    - Prevents double participation: validates on join, room creation, and socket reconnection that a player cannot be in two rooms simultaneously
    - Guards against stale socket connections: on disconnect, ignores older socket IDs to prevent false grace-period triggers from closed tabs


```Team members: grial```

```
Why we suggest as a bonus module: 

We chose to implement a card game because the UNO rule set (special cards, stacking penalties, turn direction changes) already introduces enough complexity to make the game logic interesting. But a card game also introduces a critical security problem that a simpler game like Pong does not: raw server state cannot be sent to clients because any player could open the Network tab and see every opponent's hand.

Our transformation pipeline solves this by acting as a server-side privacy firewall. Instead of broadcasting the full game state to all players, each connected client receives a personalized, read-only view containing only the data they are authorized to see: opponent cards are stripped, only the local player's hand is face-up, and turn-gated action enforcement prevents interactions during opponents' turns. The pipeline also handles derived fields (card count, current color, pending draw) and enforces action validation at the game-engine level so that even if a client were tampered with, the server would reject invalid moves. The static typing of all transformed payloads ensures the contract between server and client never drifts.
```

<p align="right"><a href="#1-list-of-chosen-modules">↑ back to top</a></p>

---

<a id="interactive-frontend"></a>
### Minor: personaised and Interactive frontend with reactive animated components.

- **Reactive state management:** Every UI component reacts instantly to state changes without needing a page refresh.
- **Real-time UX management:** Socket-driven lifecycle where the frontend proactively manages connections — emits `user_dropped` on tab close/refresh/navigation, shows a drop timer UI with rejoin/leave options during the 30s grace period, and handles bfcache reconnection cleanly.
- **Personalised experience across all states:** Contextual game-end screens (win/lose/lonely), a one-time welcome prompt for new players with game instructions, match history capped at 5 recent entries, paginated leaderboard, and distinct login/signup UIs for a sense of belonging.
- **Interactive real-time player list:** Live player list states (Dropped, Dropped while playing, Is playing, left, won) with pulse animations to be easilt spotted by the user.
- **Responsive & animated UI:** Grid reordering for mobile/desktop, mobile chat drawer, staggered entrance animations on profile and avatar upload with spinner guard.

```Team members: jslusark```

```
Why we suggest as a bonus module: 

The module checklist requires WebSockets for real-time features and a frontend framework for rendering, but it says nothing about how the interface *feels* and feel is what turns a functional application into an intuitive, trustworthy experience.

A frontend that only displays data is just a mirror: a frontend that manages state, animates transitions, handles errors gracefully, reacts to disconnections, and guides the user through every step becomes the connective tissue between the player and the backend.
In many ways, the frontend is *more* critical than the backend because it is the only layer the user ever sees: if it fails to communicate state clearly, no amount of backend correctness can save the experience. 

Our frontend is designed as this active, reactive layer: every state change (page transitions, turn changes, game outcomes, file uploads, chat messages, socket drops) produces immediate animated feedback, socket lifecycle is managed proactively rather than reactively, and every error screen is a styled, informative recovery path instead of a crash or blank page.
```

<p align="right"><a href="#1-list-of-chosen-modules">↑ back to top</a></p>

---

<a id="routing-access-control"></a>
### Minor: State-Driven Routing & Access Control Architecture

- **Centralized auth-driven routing**: a single `AuthContext` manages authentication state and drives all routing decisions the router reads this state on every navigation to determine which page to render
- **Protected route wrapper**: `AuthGuard` wraps all gated pages (`/profile`, `/game`) and redirects unauthenticated users to login, preventing URL-based access to protected content
- **Dual-purpose homepage**: the root path `/` renders the login/signup page for unauthenticated users and the personalized Profile page for authenticated users — no redirects, no flicker
- **Dynamic parameter validation**: `GamePage` validates the `?room=` search parameter on mount and redirects to home if missing, preventing direct URL access to an invalid game state
- **Comprehensive route coverage**: every other path (`*`) falls back to a redirect to `/`, ensuring no route ever renders in an inconsistent state

```Team members: jslusark```

```
Why we suggest as a bonus module: 

The module checklist says "use a frontend framework," which is usually interpreted as "render some components with a router."

But a frontend framework without a coherent routing and access control architecture is just a collection of pages, it cannot protect itself from URL manipulation, cannot adapt to authentication state, and cannot recover from invalid navigation.

A routing architecture is not just about mapping URLs to components, it is about **guarding every entry point** so the application is never in an inconsistent state. Our system does this at three levels:

1. Authentication gating
The `AuthGuard` does not just check "is the user logged in?" on mount; the entire route tree is built on top of a centralized `AuthContext` that propagates state changes instantly. When the user logs out, every protected route is immediately inaccessible no page can linger in a stale authenticated state.

2. Dynamic parameter validation
The `GamePage` validates the `?room=` parameter before any component mounts. If the parameter is missing or malformed, the user is redirected to home immediately rather than seeing a half-broken game page. This prevents users from bookmarking or sharing invalid game URLs.

3. Recovery over crash: When an invalid navigation does occur (wrong room name, game already started, room full), the system renders a styled, typed error recovery screen with a clear explanation and a "Back to Profile" action.

The result is that every page transition is guarded, validated, and recoverable — the user can never reach a state where the UI is broken, unresponsive, or inconsistent with their authentication status.
```
<p align="right"><a href="#1-list-of-chosen-modules">↑ back to top</a></p>