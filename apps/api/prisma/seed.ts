import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const USERS = [
  { email: "alice@example.com",   password: "alice1234",   username: "alice",   avatarUrl: "/avatars/alice.png" },
  { email: "bob@example.com",     password: "bob1234",     username: "bob",     avatarUrl: "/avatars/bob.jpg"   },
  { email: "charlie@example.com", password: "charlie1234", username: "charlie", avatarUrl: "/avatars/default.png"                 },
  { email: "diana@example.com",   password: "diana1234",   username: "diana",   avatarUrl: "/avatars/default.png"                 },
  { email: "eve@example.com",     password: "eve1234",     username: "eve",     avatarUrl: "/avatars/eve.jpg"   },
  { email: "frank@example.com",   password: "frank1234",   username: "frank",   avatarUrl: "/avatars/frank.jpg" },
  { email: "grace@example.com",   password: "grace1234",   username: "grace",   avatarUrl: "/avatars/default.png"                 },
  // extra players for badge testing
  { email: "henry@example.com",   password: "henry1234",   username: "henry",   avatarUrl: "/avatars/default.png" },  // Intermediate → 18 games, 12 wins
  { email: "ivy@example.com",     password: "ivy1234",     username: "ivy",     avatarUrl: "/avatars/default.png" },  // Newbie → 0 games
  { email: "jack@example.com",    password: "jack1234",    username: "jack",    avatarUrl: "/avatars/default.png" },  // Beginner → 3 games, 1 win
  { email: "leo@example.com",     password: "leo1234",     username: "leo",     avatarUrl: "/avatars/default.png" },  // Master → 320 games, 240 wins
  { email: "mia@example.com",     password: "mia1234",     username: "mia",     avatarUrl: "/avatars/default.png" },  // Newbie → 0 games
  { email: "noah@example.com",    password: "noah1234",    username: "noah",    avatarUrl: "/avatars/default.png" },  // Newbie → 0 games
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
  // ── henry grinds Intermediate (18 games, 12 wins = 67%) ──
  ...Array.from({ length: 6 }, (_, i) => ({
    date: new Date(`2026-02-${String(10 + i).padStart(2, "0")}`),
    host: "henry",
    players: [
      { username: "henry", placement: 1 },
      { username: "bob",   placement: 2 },
    ],
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    date: new Date(`2026-02-${String(16 + i).padStart(2, "0")}`),
    host: "henry",
    players: [
      { username: "henry", placement: 1 },
      { username: "eve",   placement: 2 },
    ],
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    date: new Date(`2026-02-${String(22 + i).padStart(2, "0")}`),
    host: "henry",
    players: [
      { username: "henry",  placement: 2 },
      { username: "alice",  placement: 1 },
    ],
  })),
  // ── push henry to Expert (50+ games, 70%+ win rate) ──
  ...Array.from({ length: 16 }, (_, i) => ({
    date: new Date(`2026-01-${String(10 + i).padStart(2, "0")}`),
    host: "henry",
    players: [
      { username: "henry", placement: 1 },
      { username: "eve",   placement: 2 },
    ],
  })),
  ...Array.from({ length: 16 }, (_, i) => ({
    date: new Date(`2026-02-${String(1 + i).padStart(2, "0")}`),
    host: "henry",
    players: [
      { username: "henry", placement: 1 },
      { username: "bob",   placement: 2 },
    ],
  })),
  // ── alice gets a few more games ──
  {
    date: new Date("2026-03-06"),
    host: "alice",
    players: [
      { username: "alice",   placement: 1 },
      { username: "grace",   placement: 2 },
    ],
  },
  {
    date: new Date("2026-03-05"),
    host: "alice",
    players: [
      { username: "alice",   placement: 1 },
      { username: "charlie", placement: 2 },
    ],
  },
  {
    date: new Date("2026-03-04"),
    host: "bob",
    players: [
      { username: "bob",     placement: 1 },
      { username: "alice",   placement: 2 },
    ],
  },
  // ── leo grinds Master (320 games, 240 wins = 75%) ──
  ...Array.from({ length: 100 }, (_, i) => ({
    date: new Date(`2025-11-${String(1 + (i % 30)).padStart(2, "0")}`),
    host: "leo",
    players: [
      { username: "leo", placement: 1 },
      { username: "eve", placement: 2 },
    ],
  })),
  ...Array.from({ length: 100 }, (_, i) => ({
    date: new Date(`2025-12-${String(1 + (i % 30)).padStart(2, "0")}`),
    host: "leo",
    players: [
      { username: "leo", placement: 1 },
      { username: "bob", placement: 2 },
    ],
  })),
  ...Array.from({ length: 60 }, (_, i) => ({
    date: new Date(`2026-01-${String(1 + (i % 30)).padStart(2, "0")}`),
    host: "leo",
    players: [
      { username: "leo",    placement: 1 },
      { username: "diana",  placement: 2 },
    ],
  })),
  ...Array.from({ length: 60 }, (_, i) => ({
    date: new Date(`2026-01-${String(1 + (i % 30)).padStart(2, "0")}`),
    host: "leo",
    players: [
      { username: "leo",     placement: 1 },
      { username: "charlie", placement: 2 },
    ],
  })),
  // ── jack plays a few games ──
  {
    date: new Date("2026-03-03"),
    host: "jack",
    players: [
      { username: "jack",    placement: 1 },
      { username: "diana",   placement: 2 },
    ],
  },
  {
    date: new Date("2026-03-02"),
    host: "jack",
    players: [
      { username: "frank",   placement: 1 },
      { username: "jack",    placement: 2 },
    ],
  },
  {
    date: new Date("2026-03-01"),
    host: "jack",
    players: [
      { username: "alice",   placement: 1 },
      { username: "jack",    placement: 2 },
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
