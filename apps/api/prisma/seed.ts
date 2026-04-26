import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const USERS = [
  { email: "alice@example.com",   password: "alice1234",   username: "alice",   avatarUrl: "/avatars/alice.png" },
  { email: "bob@example.com",     password: "bob1234",     username: "bob",     avatarUrl: "/avatars/bob.jpg"   },
  { email: "charlie@example.com", password: "charlie1234", username: "charlie", avatarUrl: null                 },
  { email: "diana@example.com",   password: "diana1234",   username: "diana",   avatarUrl: null                 },
  { email: "eve@example.com",     password: "eve1234",     username: "eve",     avatarUrl: "/avatars/eve.jpg"   },
  { email: "frank@example.com",   password: "frank1234",   username: "frank",   avatarUrl: "/avatars/frank.jpg" },
  { email: "grace@example.com",   password: "grace1234",   username: "grace",   avatarUrl: null                 },
];

// Each game: host, date, and players with their final placement (1 = winner)
const GAMES = [
  {
    date: new Date("2026-03-11"),
    host: "alice",
    players: [
      { username: "alice",   placement: 1 },
      { username: "bob",     placement: 2 },
      { username: "charlie", placement: 3 },
    ],
  },
  {
    date: new Date("2026-03-10"),
    host: "grace",
    players: [
      { username: "grace", placement: 1 },
      { username: "alice", placement: 2 },
    ],
  },
  {
    date: new Date("2026-03-09"),
    host: "alice",
    players: [
      { username: "alice",   placement: 1 },
      { username: "bob",     placement: 2 },
      { username: "charlie", placement: 3 },
    ],
  },
  {
    date: new Date("2026-03-08"),
    host: "alice",
    players: [
      { username: "alice", placement: 1 },
      { username: "eve",   placement: 2 },
    ],
  },
  {
    date: new Date("2026-03-07"),
    host: "frank",
    players: [
      { username: "frank",   placement: 1 },
      { username: "alice",   placement: 2 },
      { username: "grace",   placement: 3 },
      { username: "diana",   placement: 4 },
    ],
  },
];

async function main() {
  const gameCount = await prisma.game.count();
  if (gameCount > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  // --- Users ---
  const userIds: Record<string, string> = {};

  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash },
      create: {
        email: u.email,
        passwordHash,
        profile: {
          create: { username: u.username, avatarUrl: u.avatarUrl },
        },
      },
      select: { id: true },
    });
    userIds[u.username] = user.id;
    console.log(`Seeded user: ${u.username}`);
  }

  // --- Games ---
  for (const g of GAMES) {
    const hostId = userIds[g.host];

    const lobby = await prisma.lobby.create({
      data: {
        hostUserId: hostId,
        status: "CLOSED",
        maxPlayers: g.players.length,
        members: {
          create: g.players.map((p) => ({
            userId: userIds[p.username],
            ready: true,
          })),
        },
      },
    });

    await prisma.game.create({
      data: {
        lobbyId: lobby.id,
        status: "FINISHED",
        createdAt: g.date,
        endedAt: g.date,
        players: {
          create: g.players.map((p) => ({
            userId: userIds[p.username],
            placement: p.placement,
          })),
        },
      },
    });

    console.log(`Seeded game: ${g.date.toISOString().slice(0, 10)} (${g.players.map((p) => p.username).join(", ")})`);
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
