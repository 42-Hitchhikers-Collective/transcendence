
# Architecture Overview
The web client application is organized into a modular architecture that promotes separation of concerns, reusability and maintainability. The main layers of the architecture are divided into the following folders: `app/`, `assets/`, `features/`, and `shared/`.
Each layer has a specific responsibility in the overall structure of the app.

This architecture was built by considering the ["feature-sliced design"](https://feature-sliced.design/) approach, which emphasizes organizing code by feature/domain rather than by technical type (e.g., components, hooks, utils). This helps to keep related code together and makes it easier to navigate and maintain as the project grows. For more on this approach, see:
 [Creating a Good Folder Structure For Your Vite App ](https://www.thatsoftwaredude.com/content/14110/creating-a-good-folder-structure-for-your-vite-app)

</br>
</br>

# Table of Contents
- [Router](#router)
- [Pages](#pages)
- [Features](#features)
- [Shared](#shared)
- [Full Structure Preview](#full-structure-preview)

</br>
</br>

# App
This folder contains the main application setup, including the router and the page-level components that correspond to different routes in the app. It is responsible for defining the overall structure of the app and how users navigate between different views.
``` bash
    app/
    ├──router/
    └── pages/ 
```

- ### **`router/`**:
    This folder contains react-router configuration which defines all routes for the web client application.
    Each route corresponds to a specific page or view in the app
    When the user navigates to a path, the router decides which page to render, without triggering a full browser reload (this is what makes it a Single Page Application).

    ```bash
    router/
    └── AppRouter.tsx        
    ```

    Example routes include: `/login`, `/profile`, `/game`, `/signup`.

- ### **`pages/`**: 
    This folder should be reserved for route level components, which are the main views of the app that correspond to specific URLs. Each page is responsible for rendering the UI for that view by composing feature hooks and shared components.
    Pages should simple, they are meant to render components together and they don't own logic.
    If a page starts containing business logic (data fetching, state management, calculations), that logic belongs in a feature instead.

    ``` bash
    pages/                       
    ├── gamePage/
    │   └── Game.tsx
    ├── loginPage/
    │   └── Login.tsx
    ├── profilePage/
    │   └── Profile.tsx
    └── signupPage/
        └── Signup.tsx
    ```

</br>
</br>

## Assets
This folder contains static files that are used in the web client application, such as images, fonts, and SVGs. These are typically imported into components or stylesheets to be rendered in the UI. Examples include:
- `logo.png` — the app's logo image
- `background.jpg` — a background image for the game page
- `Roboto-Regular.ttf` — a custom font file
- `icons.svg` — a sprite sheet of SVG icons used throughout the app

[↑ Back to top](#table-of-contents)

</br>
</br>

# Features
The core logic layer of the application. Each subfolder is a self-contained domain that owns all the logic, API calls, types, and hooks for one area of the app.

```bash
    features/                    
    ├── auth/                   
    ├── profile/                 
    └── game/                     
```

- ### **`auth/`**:
    login, logout, session management, tokens
    ```bash
    auth/                   
    ├── api/
    │   └── authApi.ts
    └── hooks/
        └── useLogHandlers.ts
    ```

- ### **`profile/`**: 
    fetching and storing user profile data (username, avatar, stats)
    ```bash
    profile/                  
    ├── api/
    │   └── profileApi.ts
    ├── hooks/
    │   └── useProfile.ts
    ├── types/
    │   └── types.ts
    └── mock/
        └── mockProfiles.ts   
    ```
- ### **`game/`**: 
    WebSocket connection, game state, and the Phaser game engine

    ```bash
    game/                    
    ├── engine/
    │   └── main.ts           
    ├── scenes/              
    │   ├── LobbyScene.ts
    │   ├── GameScene.ts
    │   └── EndScene.ts
    └── types/
        └── gameTypes.ts
    ```

Features contain pure TypeScript logic. They do not render UI directly — pages and components consume them.

[↑ Back to top](#table-of-contents)

</br>
</br>

# Shared
Reusable code that isn't tied to any one feature.
If something is used by more than one feature and has no single owner, it lives here.
If it is only used by one feature, it belongs in that feature's folder, not here.
> ⚠️ **Rule:** If you can name which feature owns it, put it in that feature, not here.

    
``` bash
    shared/                       
    ├── components/              
    ├── hooks/                   
    ├── styles/                   
    ├── types/                   
    └── utils/                    
```
</br>

- ### **`/Components`**:
    Components are buildingblocks of our app.
    They are generic, reusable UI pieces that aren't tied to any specific feature.
    They render markup and accept props nothing more. </br>
    Examples components include:
        - `Button.tsx` — a styled, reusable button
        - `Modal.tsx` — a dialog/pop-up wrapper
        - `Card.tsx` — a content card container

    [↑ Back to top](#table-of-contents)

</br>

- ### **`/Hooks`:**
    Custom React hooks (prefixed with `use`) that are shared across multiple features. Hooks encapsulate stateful logic so components stay focused on rendering. </br> **Examples:**
    - `useLogHandlers.ts`: exposes login/logout and the current auth state
    - `useGameState.ts`: tracks the active game state (hand, discard pile, status)
    - `useWindowSize.ts`: returns the current viewport dimensions
    
    [↑ Back to top](#table-of-contents)
    
</br>

- ### **`/Styles`**:
    This folder contains the styles for the web client application.
    Global CSS, Tailwind config extensions, and design tokens. Anything that applies across the whole app from a visual standpoint lives here.

    Examples of styles include:
    - `globals.css` — CSS resets and base styles
    - `tailwind.config.ts` — custom colors, spacing, and fonts for this project
    - `theme.ts` — design tokens (color palette, font sizes, spacing scale)

    [↑ Back to top](#table-of-contents)
   
</br>


- ### **`/Types`**:
    This folder is for storing interface definitions, type aliases, and other TypeScript types that are exported and used across the web client application. If they are only used within one feature, they belong in that feature's `types/` folder, not here. This is for types that are shared across multiple features or don't have a clear single owner.

    Examples:
    - `User.ts`: the `User` interface (`id`, `username`, `email`, `avatarUrl`)
    https://github.com/cypress-io/cypress-realworld-app/tree/develop/src/models

    [↑ Back to top](#table-of-contents)
    
</br>


- ### **`/Utils`**:
    This folder contains small helper functions that are used across the web client application.

    Examples:
    - `formatDate.ts`: formats a date string into a readable format (e.g., "January 1, 2024")
    - `generateRandomString.ts`: generates a random alphanumeric string of a given length
    - `deepClone.ts`: creates a deep copy of an object without shared references

    If a util grows to have side effects or is only relevant to one feature, move it into that feature.

    [↑ Back to top](#table-of-contents)

</br>
</br>

# Full Structure Preview

``` bash
src/
├── app/
│   ├──router/                   # Maps URLs to page components
│   │  └── AppRouter.tsx         
│   ├── pages/                   # Route-level views; one folder per page
│   │   ├── gamePage/
│   │   │    └── Game.tsx.       # The main game view where the Phaser canvas is rendered
│   │   ├── loginPage/
│   │   │   └── Login.tsx        # The login form view where users can enter credentials
│   │   ├── profilePage/
│   │   │   └── Profile.tsx      # The user profile view where users can see and edit their info
│   │   └── signupPage/
│   │       └── Signup.tsx       # The signup form view where new users can create an account
├   ├── App.tsx                       # App shell — wraps global providers, renders the router
├   └── App.css                       # Global styles for the app shell
│
├── assets/                       # Static files: images, fonts, SVGs
│
├── features/                     # Core business logic, grouped by domain
│   ├── auth/                     # Login, logout, session management
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   └── hooks/
│   │       └── useLogHandlers.ts
│   ├── game/                     #  Phaser game engine, WebSocket connection, game state management
│   │   ├── main.ts               # Initializes the Phaser game instance
│   │   ├── hooks /               # React hooks related to game state management
│   │   ├── scenes/               # Phaser scenes (one per game screen)
│   │   │   ├── LobbyScene.ts
│   │   │   ├── GameScene.ts
│   │   │   └── EndScene.ts
│   │   ├── gameTypes.ts     # TypeScript types related to the game (e.g., GameState, Card)
│   │   └── main.ts         # Initializes the Phaser game instance
│   │
│   └── profile/                  # User profile data (username, avatar, stats)
│       ├── api/
│       │   └── profileApi.ts     # API calls related to user profiles (fetching/updating profile data)
│       ├── hooks/
│       │   └── useProfile.ts     # Hook for fetching and managing user profile state in components
│       ├── types/
│       │   └── types.ts          # TypeScript types related to user profiles (e.g., UserProfile interface)
│       └── mockData/
│           └── mockProfiles.ts   # Temporary fake data while backend is being built
│   
│
├── shared/                       # Reusable code not owned by any single feature
│   ├── components/               # Generic UI components (Button, Modal, Card, etc.)
│   ├── hooks/                    # Generic React hooks used across features
│   ├── styles/                   # Global CSS and Tailwind configuration
│   ├── types/                    # TypeScript types shared across features
│   └── utils/                    # Pure helper functions (formatting, math, etc.)
│
├── main.tsx                      # Entry point — mounts the React app
└── index.css
```

[↑ Back to top](#table-of-contents)