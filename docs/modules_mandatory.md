# Mandatory Modules
These details are also reported on our Kanban board as [ticket #58](https://github.com/42-Hitchhikers-Collective/transcendence/issues/58)

# 📋 Done modules: 7 Minor & 4 Major (15 points)
```
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
```

# Modules List

## IV.1 Web
- ### Major: Use a framework for both the frontend and backend.
    - [ ] Use a frontend framework (React, Vue, Angular, Svelte, etc.).
    - [ ] Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails,
etc.).
    - [ ] Full-stack frameworks (Next.js, Nuxt.js, SvelteKit) count as both if you use
both their frontend and backend capabilities.
- ### Minor:
    - [x] Use a frontend framework (React, Vue, Angular, Svelte, etc.).
- ### Minor:
    - [x] Use a backend framework (Express, Fastify, NestJS, Django, etc.).
- ### Major: Implement real-time features using WebSockets or similar technology.
    - [x] Real-time updates across clients.
    - [x] Handle connection/disconnection gracefully.
    - [x] Efficient message broadcasting.
- ### Major: Allow users to interact with other users. The minimum requirements are:
    - [x] A basic chat system (send/receive messages between users).
    - [x] A profile system (view user information).
    - [ ] A friends system (add/remove friends, see friends list).
- ### Major: A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints:
    - [x] GET /api/{something}
    - [x] POST /api/{something}
    - [ ] PUT /api/{something}
    - [ ] DELETE /api/{something}
- ### Minor:
    - [x] Use an ORM for the database.
- ### Minor:
    - [x] A complete notification system for all creation, update, and deletion ac-
tions.
- ### Minor:
    - [ ] Real-time collaborative features (shared workspaces, live editing, collabo-
rative drawing, etc.).
- ### Minor:
    - [ ] Server-Side Rendering (SSR) for improved performance and SEO.
- ### Minor:
    - [ ] Progressive Web App (PWA) with offline support and installability.
- ### Minor:
    - [ ] Custom-made design system with reusable components, including a proper
color palette, typography, and icons (minimum: 10 reusable components).
12
ft_transcendence Surprise.
- ### Minor:
    - [ ] Implement advanced search functionality with filters, sorting, and pagina-
tion.
- ### Minor:
    - [x] File upload and management system.
    - [x] Support multiple file types (images, documents, etc.).
    - [x] Client-side and server-side validation (type, size, format).
    - [x] Secure file storage with proper access control.
    - [x] File preview functionality where applicable.
    - [x] Progress indicators for uploads.
    - [x] Ability to delete uploaded files.
## IV.2 Accessibility and Internationalization
- ### Major: Complete accessibility compliance (WCAG 2.1 AA) with screen reader
support, keyboard navigation, and assistive technologies.
- ### Minor:
    - [ ] Support for multiple languages (at least 3 languages).
    - [ ] Implement i18n (internationalization) system.
    - [ ] At least 3 complete language translations.
    - [ ] Language switcher in the UI.
    - [ ] All user-facing text must be translatable.
- ### Minor:
    - [ ] Right-to-left (RTL) language support.
    - [ ] Support for at least one RTL language (Arabic, Hebrew, etc.).
    - [ ] Complete layout mirroring (not just text direction).
    - [ ] RTL-specific UI adjustments where needed.
    - [ ] Seamless switching between LTR and RTL.
- ### Minor:
    - [x] Support for additional browsers.
    - [x] Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge,
etc.).
    - [x] Test and fix all features in each browser.
    - [x] Document any browser-specific limitations.
    - [x] Consistent UI/UX across all supported browsers.

## IV.3 User Management
- ### Major: Standard user management and authentication.
    - [x] Users can update their profile information.
    - [x] Users can upload an avatar (with a default avatar if none provided).
    - [ ] Users can add other users as friends and see their online status.
    - [x] Users have a profile page displaying their information.
- ### Minor:
    - [x] Game statistics and match history (requires a game module).
    - [x] Track user game statistics (wins, losses, ranking, level, etc.).
    - [x] Display match history (1v1 games, dates, results, opponents).
    - [x] Show achievements and progression.
    - [x] Leaderboard integration.
This module requires you to have implemented at least one game (see
"Gaming and user experience" section). You cannot claim this module
without a functional game.
- ### Minor:
    - [ ] Implement remote authentication with OAuth 2.0 (Google, GitHub, 42,
etc.).
- ### Major: Advanced permissions system:
    - [ ] View, edit, and delete users (CRUD).
    - [ ] Roles management (admin, user, guest, moderator, etc.).
    - [ ] Different views and actions based on user role.
- ### Major: An organization system:
    - [ ] Create, edit, and delete organizations.
    - [ ] Add users to organizations.
    - [ ] Remove users from organizations.
    - [ ] View organizations and allow users to perform specific actions within an or-
ganization (minimum: create, read, update).
- ### Minor:
    - [ ] Implement a complete 2FA (Two-Factor Authentication) system for the
users.
- ### Minor:
    - [ ] User activity analytics and insights dashboard.


## IV.4 Artificial Intelligence
- ### Major: Introduce an AI Opponent for games.
    - [ ] The AI must be challenging and able to win occasionally.
    - [ ] The AI should simulate human-like behavior (not perfect play).
    - [ ] If you implement game customization options, the AI must be able to use
them.
    - [ ] You must be able to explain your AI implementation during evaluation.
```
This module requires you to have implemented at least one game (see
"Gaming and user experience" section). The AI must be able to play
your game competently.
```

- ### Major: Implement a complete RAG (Retrieval-Augmented Generation) system.
    - [ ] Interact with a large dataset of information.
    - [ ] Users can ask questions and get relevant answers.
    - [ ] Implement proper context retrieval and response generation.
- ### Major: Implement a complete LLM system interface.
    - [ ] Generate text and/or images based on user input.
    - [ ] Handle streaming responses properly.
    - [ ] Implement error handling and rate limiting.
- ### Major: Recommendation system using machine learning.
    - [ ] Personalized recommendations based on user behavior.
    - [ ] Collaborative filtering or content-based filtering.
    - [ ] Continuously improve recommendations over time.
- ### Minor:
    - [ ] Content moderation AI (auto moderation, auto deletion, auto warning,
etc.)
- ### Minor:
    - [ ] Voice/speech integration for accessibility or interaction.
- ### Minor:
    - [ ] Sentiment analysis for user-generated content.
- ### Minor:
    - [ ] Image recognition and tagging system.

## IV.5 Cybersecurity
- ### Major: Implement WAF/ModSecurity (hardened) + HashiCorp Vault for secrets:
    - [ ] Configure strict ModSecurity/WAF.
    - [ ] Manage secrets in Vault (API keys, credentials, environment variables), en-
    crypted and isolated.

## IV.6 Gaming and user experience
- ### Major: Implement a complete web-based game where users can play against eachother.
    - [x] The game can be real-time multiplayer (e.g., Pong, Chess, Tic-Tac-Toe, Card
games, etc.).
    - [x] Players must be able to play live matches.
    - [x] The game must have clear rules and win/loss conditions.
    - [x] The game can be 2D or 3D.
  - ### Major: Remote players — Enable two players on separate computers to play the same game in real-time.
    - [x] Handle network latency and disconnections gracefully.
    - [x] Provide a smooth user experience for remote gameplay.
    - [x] Implement reconnection logic.
- ### Major: Multiplayer game (more than two players).
    - [x] Support for three or more players simultaneously.
    - [x] Fair gameplay mechanics for all participants.
    - [x] Proper synchronization across all clients.
```
This module requires you to have implemented at least one game (see
"Gaming and user experience" section). You’re extending your game to
support three or more players.
```
- ### Major: Add another game with user history and matchmaking.
    - [ ] Implement a second distinct game.
    - [ ] Track user history and statistics for this game.
    - [ ] Implement a matchmaking system.
    - [x] Maintain performance and responsiveness.

```
This module requires you to have already implemented a first game
(see "Implement a complete web-based game" module above). You cannot
claim this module without having a functional first game.
```

- ### Major: Implement advanced 3D graphics using a library like Three.js or Babylon.js.
    - [ ] Create an immersive 3D environment.
    - [ ] Implement advanced rendering techniques.
    - [ ] Ensure smooth performance and user interaction.
- ### Minor:
    - [ ] Advanced chat features (enhances the basic chat from "User interaction"
module).
    - [ ] Ability to block users from messaging you.
    - [ ] Invite users to play games directly from chat.
    - [ ] Game/tournament notifications in chat.
    - [ ] Access to user profiles from chat interface.
    - [x] Chat history persistence.
    - [ ] Typing indicators and read receipts.
```
This module enhances the basic chat system from the "Allow users
to interact" module. You cannot claim this module without having
implemented the basic chat first.
```
- ### Minor:
    - [ ] Implement a tournament system.
    - [ ] Clear matchup order and bracket system.
    - [ ] Track who plays against whom.
    - [ ] Matchmaking system for tournament participants.
    - [ ] Tournament registration and management.
```This module requires you to have implemented at least one game (see
"Gaming and user experience" section). You cannot have tournaments
without a game to play.
```

- ### Minor:
    - [ ] Game customization options.
    - [ ] Power-ups, attacks, or special abilities.
    - [ ] Different maps or themes.
    - [ ] Customizable game settings.
    - [ ] Default options must be available.
This module requires you to have implemented at least one game (see
"Gaming and user experience" section). You’re adding customization
to an existing game.
- ### Minor:
    - [ ] A gamification system to reward users for their actions.
    - [x] Implement at least 3 of the following: achievements, badges, leaderboards,
XP/level system, daily challenges, rewards
    - [x] System must be persistent (stored in database)
    - [x] Visual feedback for users (notifications, progress bars, etc.)
    - [ ] Clear rules and progression mechanics
  While this is a Minor module (1 point), implementing a complete
  gamification system can be substantial. Focus on quality over
  quantity—three well-implemented features are better than six poorly
  done ones.
  - ### Minor:
      - [ ] Implement spectator mode for games.
      - [ ] Allow users to watch ongoing games.
      - [ ] Real-time updates for spectators.
      - [ ] Optional: spectator chat.
  This module requires you to have implemented at least one game (see
  "Gaming and user experience" section). Spectators need a game to
  watch.

## IV.7 Devops
- ### Major: Infrastructure for log management using ELK (Elasticsearch, Logstash, Kibana).
    - [ ] Elasticsearch to store and index logs.
    - [ ] Logstash to collect and transform logs.
    - [ ] Kibana for visualization and dashboards.

    - [ ] Implement log retention and archiving policies.
    - [ ] Secure access to all components.

- ### Major: Monitoring system with Prometheus and Grafana.
    - [ ] Set up Prometheus to collect metrics.
    - [ ] Configure exporters and integrations.
    - [ ] Create custom Grafana dashboards.
    - [ ] Set up alerting rules.
    - [ ] Secure access to Grafana.
- ### Major: Backend as microservices.
    - [ ] Design loosely-coupled services with clear interfaces.
    - [ ] Use REST APIs or message queues for communication.
    - [x] Each service should have a single responsibility.
- ### Minor:
    - [ ] Health check and status page system with automated backups and disaster
recovery procedures.

## IV.8 Data and Analytics
- ### Major: Advanced analytics dashboard with data visualization.
    - [ ] Interactive charts and graphs (line, bar, pie, etc.).
    - [ ] Real-time data updates.
    - [ ] Export functionality (PDF, CSV, etc.).
    - [ ] Customizable date ranges and filters.
- ### Minor:
    - [ ] Data export and import functionality.
    - [ ] Export data in multiple formats (JSON, CSV, XML, etc.).
    - [ ] Import data with validation.
    - [ ] Bulk operations support.
- ### Minor:
    - [ ] GDPR compliance features.
    - [ ] Allow users to request their data.
    - [ ] Data deletion with confirmation.
    - [ ] Export user data in a readable format.
    - [ ] Confirmation emails for data operations.

IV.9 Blockchain
- ### Major: Store tournament scores on the Blockchain.
    - [ ] Use Avalanche and Solidity smart contracts on a test blockchain.
    - [ ] Implement smart contracts to record, manage, and retrieve tournament scores.
    - [ ] Ensure data integrity and immutability.
  - ### Minor:
      - [ ] Use ICP (Internet Computer Protocol) for a backend that runs on a
  blockchain (incompatible with SSR).
IV.10 Modules of choice
- ### Major: Implement a custom module that is not listed above.
    - [x] The module must be substantial and demonstrate technical complexity.
    - [x] You must provide proper justification in your README.md explaining:
  
            ∗ Why you chose this module.
            ∗ What technical challenges it addresses.
            ∗ How it adds value to your project.
            ∗ Why it deserves Major module status (2 points).

    - [x] Taking shortcuts or implementing trivial features will result in rejection.
    - [x] Be creative and think outside the box.
    - [x] The module should be relevant to your project context.
  - ### Minor:
    - [x] Same as the major module but smaller in scope and less complex.
    - [x] Must still demonstrate technical skill and creativity.
    - [x] Should add meaningful value to your project.
    - [x] Requires justification in README.md (similar to Major, but for 1 point).