# Local Socket Testing Guide

This guide explains how to test the socket connection and game logic locally without running the full Docker setup (which is too heavy for development).

## Prerequisites

- Docker installed and running
- Node.js 18+ installed
- Terminal access to the project root

---

## Step 1: Start the Database Container

The full project setup is heavy, so we only spin up the database.

```bash
docker compose down -v db  # Wipe old data (one-time only)
docker compose up -d db    # Start fresh database
```

Wait a few seconds for the database to be healthy (you can check with `docker ps`).

---

## Step 2: Reset and Seed the Database

Navigate to the API folder and set up the database schema:

```bash
cd apps/api
npx prisma db push --force-reset  # Drop and recreate schema
npx prisma db seed                 # Seed test users (Alice, Bob, etc.)
```

This creates test users with the following credentials:
- **Alice**: `alice@example.com` / `alice1234`
- **Bob**: `bob@example.com` / `bob1234`
- **Charlie, Diana, Eve, Frank, Grace**: Similar pattern

---

## Step 3: Start the Backend API Server

Keep this terminal open while testing:

```bash
npm run dev
```

You should see:
```
Server listening at http://127.0.0.1:3000
Server listening at http://10.15.110.4:3000
```

The backend is now running on `http://localhost:3000` and Socket.io is listening on `/socket.io`.

---

## Step 4: Serve the HTML Test File

Open a **new terminal** and navigate to the public HTML folder:

```bash
cd apps/web/public
python3 -m http.server 8000
```

This serves your test HTML files on `http://localhost:8000`.

---

## Step 5: Get a JWT Token

Open a **third terminal** and get a token for testing:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"alice1234"}'
```

The response will be:
```json
{"token":"eyJhbGciOiJIUzI1NiIs..."}
```

**Copy the entire token string** (the long random value. copy it without the quotes).

To get a second user's token, repeat with:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"bob1234"}'
```

---

## Step 6: Test the Socket Connection

1. Open your browser and navigate to: `http://localhost:8000/socket-test0.html`
2. Press `F12` to open **Developer Tools** → **Console** tab
3. Paste Alice's token into the **"JWT Token"** input field
4. Click the **"Connect"** button

You should see:
- In the browser console: `Connected: <socket-id>`
- In the backend terminal: A log message showing Alice connected with her userId

---

## Step 7: Test with Two Users (Optional)

To test room creation, joining, and game logic with two users:

1. Open `socket-test0.html` in **Tab 1** with Alice's token
2. Open `socket-test0.html` in **Tab 2** in a new browser tab with Bob's token
3. Both tabs should show `Connected: <socket-id>` in their consoles
4. Now you can test socket events like creating rooms, joining, etc.

---

## Troubleshooting

### "WebSocket is closed before the connection is established"
- Ensure the backend API is running (`npm run dev`)
- Check the backend logs for errors related to JWT or database

### "Cannot reach database server at localhost:5434"
- Ensure Docker container is running: `docker ps`
- Check that `DATABASE_URL` in `apps/api/.env` uses port `5434` (not `5432`)

### "unauthorized" error
- Verify the token is correct and copied fully
- Ensure the token format in HTML is: `auth: { token: jwtToken }`

### Database schema errors
- If you get "column does not exist" errors, run: `npx prisma db push --force-reset`
- This completely wipes and rebuilds your local database

### Connections keep dropping
- Check that `setupSocket(app)` is called **before** `app.listen()` in `server.ts`
- Check the backend logs for any TypeScript or runtime errors

---

## Environment Considerations

- **Local testing only**: The `.env` file in `apps/api` is configured for local development
- **Docker setup**: When running the full Docker stack, environment variables are different (e.g., `DATABASE_URL=postgresql://app:app@db:5432/...`)
- **No impact on teammates**: These changes are local and won't affect the main Docker setup or your teammates' environments
