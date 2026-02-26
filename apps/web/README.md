<div align="center">
  <img src="images/logo.png" alt="Logo" width="80" height="80">
  <p style="font-size: 40px;">Uno Game Web Client</p>
  <p>
    A modern, responsive React web client for multiplayer Uno gameplay
  <p>
    <a href="https://www.notion.so/42wolfsburgberlin/Transcendence-2e9937251cae8026ac8ee6f59b496509?source=copy_link">Notion</a>
    &middot;
    <a href="https://github.com/othneildrew/Best-README-Template/issues/new?labels=bug&template=bug-report---.md">Kanban Board</a>
    &middot;
    <a href="../../README.md"> Main ReadMe</a>
  </p>
</div>


# About the Project
A single page web application built with React and TypeScript, serving as the frontend client for a multiplayer Uno card game.
### Table of Contents
- [Current Project Status](#current-project-status)
- [Tech Stack](#current-tech-stack)
- [Getting Started](#getting-started)
> **Note:** This documentation is meant to be changed as the project evolves and grows.


# Current Project Status

Currently the web client is a simple MVP (Minimum Viable Product) that sets up the base frontend architecture and development environment. The main features of this MVP include:

- Users can log in as a mock user with mocked data and navigate between different pages of the app, such as the login page, profile page, and game page.

- See a simple `< Canvas >` element on the Game page where the Uno game will eventually be rendered using Phaser.js.


# Tech Stack
- **[Vite](https://vite.dev/)**: Frontend build tool providing a high-speed local development environment and optimized production bundles
- **[@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc/tree/main/packages/plugin-react-swc)**: Uses [SWC](https://swc.rs/) for Fast Refresh and the fastest build times.
SWC is written in Rust and compiles so much faster than Babel, making it ideal for large projects with complex component trees and frequent code changes during development, which is common in game development.
- **[React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)**: Component-based UI library serving as the application shell, managing SPA state and channeling backend data to the game canvas
- **[React Router](https://reactrouter.com/)**: Client-side routing that intercepts URL changes (e.g., `/login`, `/profile`, `/game`) to navigate between views without full page reloads, keeping the game canvas and WebSocket connections alive.
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework providing complete control over visual design through composable CSS classes
- **[Shadcn UI](https://ui.shadcn.com/)** - Pre-built, accessible UI component collection powered by Radix UI and Tailwind CSS, enabling rapid development with full design customization
- **[Phaser.js](https://phaser.io/)** - 2D web game framework that renders the Uno game inside an HTML canvas element. Handles graphics rendering, sprite animations, game loops, and user interaction (clicks, drags) within the `/game` route.
- **ESLint**: Configured with `tseslint.configs.recommended` for basic TypeScript linting rules. You can expand this configuration to include type-aware lint rules and React-specific lint rules as your project grows.

[↑ Back to top](#top)

# Getting started

These instructions are only for previewing the web client in isolation during development. </br> The full application is launched via Docker — see the root [`README.md`](../../README.md) for instructions.

### Before you begin, make sure you have [Node.js](https://nodejs.org/) installed on your machine:

**1. Navigate to the web app directory**
```bash
cd apps/web
```

**2. Install dependencies**
```bash
npm install
```

**3. Start the development server**
```bash
npm run dev
```

Vite will start a local dev server with hot module replacement:
```bash
> web@0.0.0 dev
> vite

  VITE v7.3.1  ready in 370 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

The browser will reflect any code changes instantly without a full page reload.

[↑ Back to top](#top)