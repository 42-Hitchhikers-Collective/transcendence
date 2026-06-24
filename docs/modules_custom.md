# Custom modules 
These details are also reported on our Kanban board as [ticket #58](https://github.com/42-Hitchhikers-Collective/transcendence/issues/58)

### **Why should we add them**:
- There are some special features and edgecase handling that our project implements, these cases have technical complexity that go beyond the mandatory requirements and are worth to be mentioned (also the standard modules do not mention any of these features we added on our own behalf, and since this is not little work but represent specific proven skills, it is worth to propose them as their own modules).

### Suggestions: 1 major & 3 Minor.
 Points added: + 5 (with a total of 20 points)

##  🔄 1. Major: Gameplay lifecycle management system.
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
    *** Handles tab navigation , page refreshes and route navigation additonally to website navigation 
- **Chat history for each room:**
    - chat messages are not lost on page refreshes
    -  chat notifies of room state (create, join, start)
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

## 👁️ 2. Minor: Game State Privacy & Transformation Pipeline
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

## 🎥 3. Minor: personaised and Interactive frontend with reactive animated components.
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


## 🚪 4. Minor: State-Driven Routing & Access Control Architecture
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

    