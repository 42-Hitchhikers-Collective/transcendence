# 1. List of chosen modules

- Minor: Use a frontend framework (React, Vue, Angular, Svelte, etc.).
- Minor: Use a backend framework (Express, Fastify, NestJS, Django, etc.).
- Major: Implement real-time features using WebSockets or similar technology.
- Minor: Use an ORM for the database.
- Minor: A complete notification system for all creation, update, and deletion ac-
  tions.
- Minor: file upload and management system.
- Minor: Support for additional browsers.
- Minor: Game statistics and match history (requires a game module).
- Major: Implement a complete web-based game where users can play against eachother.
- Major: Remote players — Enable two players on separate computers to play the same game in real-time.
- Major: Multiplayer game (more than two players).

### Points total: 15

# 2. Custom modules (Bonus)

The standard module checklist covers mostly the building blocks of a fullstack application: a frontend framework, a backend, WebSockets, a database. 
We are suggesting these bonus modules because we think we went beyond this requirement by implementing extra features that can be considered full fledged systems that guide each user through every step of our project.
We wanted to create an immersive experience not only visually but also functionally, where the website feels alive and responsive to every action, never leaving the player wondering what just happened or what they should do next.

### List of Custom Bonus modules (1 major & 3 Minor)
- Major: Gameplay lifecycle management system.
- Minor: Game State Privacy & Transformation Pipeline
- Minor: personaised and Interactive frontend with reactive animated components.
- Minor: State-Driven Routing & Access Control Architecture

### Total points added: 5


# 3. Final points calculation
The mandatory modules give us 15 points and the bonus modules give us 5 points, making a total of **20 points**.


# 4. Detailed description of the chosen modules

### Web section

- #### Minor: Use a frontend framework (React, Vue, Angular, Svelte, etc.).

- #### Minor: Use a backend framework (Express, Fastify, NestJS, Django, etc.)

- #### Major: Implement real-time features using WebSockets or similar technology.
  - Real-time updates across clients.
  - Handle connection/disconnection gracefully.
  - Efficient message broadcasting.

- #### Minor: Use an ORM for the database.

- #### Minor: A complete notification system for all creation, update, and deletion actions.

- #### Minor: File upload and management system.
  - Support multiple file types (images, documents, etc.).
  - Client-side and server-side validation (type, size, format).
  - Secure file storage with proper access control.
  - File preview functionality where applicable.
  - Progress indicators for uploads.
  - Ability to delete uploaded files.

______

### Accessibility and Internationalization section

- #### Minor: Support for additional browsers.
  - Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.).
  - Test and fix all features in each browser.
  - Document any browser-specific limitations.
  - Consistent UI/UX across all supported browsers.

______

### User Management section

- #### Minor: Game statistics and match history (requires a game module).
  - Track user game statistics (wins, losses, ranking, level, etc.).
  - Display match history (1v1 games, dates, results, opponents).
  - Show achievements and progression.
  - Leaderboard integration.

______

### Gaming and user experience section

- #### Major: Implement a complete web-based game where users can play against eachother.
      - The game can be real-time multiplayer (e.g., Pong, Chess, Tic-Tac-Toe, Card
  games, etc.). - Players must be able to play live matches. - The game must have clear rules and win/loss conditions. - The game can be 2D or 3D.
  - #### Major: Remote players — Enable two players on separate computers to play the same game in real-time.
    - Handle network latency and disconnections gracefully.
    - Provide a smooth user experience for remote gameplay.
    - Implement reconnection logic.
- #### Major: Multiplayer game (more than two players).
  - Support for three or more players simultaneously.
  - Fair gameplay mechanics for all participants.
  - Proper synchronization across all clients.


# 5. Detailed description of the bonus modules

### - Major: Gameplay lifecycle management system.

- **Game reconnection system: if player drops from game they are given a grace timer period to come back.**
  - If not back they are kicked out from the game and not included in the match history
  - When kicked out, if the game already started, they cannot go back
  - If returning back to the the game ()
- **Handling unexpected user interaction.**
  - Player tries to join a non-existent room
  - Player tries to join a different room while they are already in another room
  - Player tries to join a full room
  - Player tries to start a game with only 1 player
  - Player tries to join a room where the game already started
  - After being kicked out Player tries to join a room where the game already started
  - Player drops mid-game, they are kicked out if not returning to avoid other players are blocked from continuing the game.
  - Single player remains in a playing game ( game aborts and not recorded in match history)
  - All players leave (room auto-deleted)
  - Duplicate joins (no double partecipation)
    \*\*\* Handles tab navigation , page refreshes and route navigation additonally to website navigation
- **Chat history for each room:**
  - chat messages are not lost on page refreshes
  - chat notifies of room state (create, join, start)
  - chat history is kept in running server until a game is finished

```
README.md justification: Standard multiplayer implementations treat
rooms as a simple join/leave mechanism. Our system implements a
complete lifecycle manager with dual-index lookups, a formal state
machine, cross-layer consistency (backend ↔ frontend ↔ canvas ↔
database), a race-condition-safe disconnect grace period with
cancellation, comprehensive edge-case error handling for every
invalid interaction, automatic resource cleanup, and database-level
game outcome integrity. This required careful coordination between
four independent layers and handling of asynchronous socket events
that can arrive in any order.
```

### - Minor: Game State Privacy & Transformation Pipeline

- Personal player view where opponent cards data is hidden
- Turn-gated action enforcement: we enforce gates to player's interaction id not their turn (players also receive feedback of what they can't do).
- Implementing uno game rules (special cards, turns etc..)

```
README.md justification: For transcendence we decided to bring a card game, whcih together with the articulate uno rules, bring already enough complexity in handling game logic. In a card game, exposing raw server state
to clients would be a critical security flaw — any player could open
the Network tab and see every opponent's hand. Our transformation
pipeline acts as a server-side privacy firewall: each connected
client receives a personalized, read-only view containing only the
data they are authorized to see. This goes beyond a simple filter by
computing derived fields, supporting multiple output formats for
different rendering surfaces, and enforcing turn-based action gating
so that players cannot interact with the game during opponents'
turns. The static typing of all transformed payloads ensures the
contract cannot drift between server and client.
```

### - Minor: personaised and Interactive frontend with reactive animated components.

- The frontend is not just a static display; it is the active, interactive engine that translates human intent into digital actions
- Micro-interactions & Animations
- Client-side state management
- Shows personalised user information and global statics which are updated (if changed) on page reload.
- Users have personalised badges and profile views depending on how many games they played (if none, we have a personal view that invited the user to playe their first game)
- Users can upload an avatar (with a default avatar if none provided).

```
**README.md justification**: The module checklist requires real-time
features via WebSockets and a frontend framework, but says nothing
about how the interface *feels* which is an important
Our website is designed as a reactive, animated experience where every state change ( page transitions, events, turn changes, game outcomes, file uploads, chat messages etc...) produces immediate, animated visual feedback.
The animations are not meant to be simply decorative, but to improve the user experience and waiting times from the server if not reaching our client immediately.
```

### - Minor: State-Driven Routing & Access Control Architecture

- State-driven auth-based routing: we use React Router and authetication states to enable a personalised route navigation experience:
- We use an AuthGuard to wrap protected routes (/profile, /game) and
  redirect unauthenticated users, preventing URL-based
  access to gated pages.
- Non-logged players are gatekept from all website routes besides login/signup
- Homepage is rendered as login/signup page for unathenticated users, while as Profile for authenticated ones
- GamePage is not accessible without an room name, it validates the ?room= search parameter on mount

```
**README.md justification:** The module checklist requires only "use a
frontend framework," but front-end applications need more than rendering
components, they need a coherent routing and access control
architecture. Our system implements a centralized authentication state that drives
both routing decisions and socket lifecycle, protecting gated pages
from unauthenticated access via URL manipulation, validating dynamic
route parameters (?room=) against live server state, and rendering
typed, user-friendly error recovery screens for every possible invalid
state instead of crashing or showing blank pages.
This architecture means no route ever renders in
an inconsistent state:  **every page transition is guarded, validated,
and recoverable**.
```