import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const USERS = [
  { email: "alice@example.com",   password: "alice1234",   userName: "alice",   avatarUrl: "/avatars/alice.png" },
  { email: "bob@example.com",     password: "bob1234",     userName: "bob",     avatarUrl: "/avatars/bob.jpg"   },
  { email: "charlie@example.com", password: "charlie1234", userName: "charlie", avatarUrl: null                 },
  { email: "diana@example.com",   password: "diana1234",   userName: "diana",   avatarUrl: null                 },
  { email: "eve@example.com",     password: "eve1234",     userName: "eve",     avatarUrl: "/avatars/eve.jpg"   },
  { email: "frank@example.com",   password: "frank1234",   userName: "frank",   avatarUrl: "/avatars/frank.jpg" },
  { email: "grace@example.com",   password: "grace1234",   userName: "grace",   avatarUrl: null                 },
];

// Each game: host, date, and players with their final placement (1 = winner)
const GAMES = [
  {
    date: new Date("2026-03-11"),
    host: "alice",
    players: [
      { userName: "alice",   placement: 1 },
      { userName: "bob",     placement: 2 },
      { userName: "charlie", placement: 3 },
    ],
  },
  {
    date: new Date("2026-03-10"),
    host: "grace",
    players: [
      { userName: "grace", placement: 1 },
      { userName: "alice", placement: 2 },
    ],
  },
  {
    date: new Date("2026-03-09"),
    host: "alice",
    players: [
      { userName: "alice",   placement: 1 },
      { userName: "bob",     placement: 2 },
      { userName: "charlie", placement: 3 },
    ],
  },
  {
    date: new Date("2026-03-08"),
    host: "alice",
    players: [
      { userName: "alice", placement: 1 },
      { userName: "eve",   placement: 2 },
    ],
  },
  {
    date: new Date("2026-03-07"),
    host: "frank",
    players: [
      { userName: "frank",   placement: 1 },
      { userName: "alice",   placement: 2 },
      { userName: "grace",   placement: 3 },
      { userName: "diana",   placement: 4 },
    ],
  },
];

async function main() {
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
          create: { userName: u.userName, avatarUrl: u.avatarUrl },
        },
      },
      select: { id: true },
    });
    userIds[u.userName] = user.id;
    console.log(`Seeded user: ${u.userName}`);
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
            userId: userIds[p.userName],
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
            userId: userIds[p.userName],
            placement: p.placement,
          })),
        },
      },
    });

    console.log(`Seeded game: ${g.date.toISOString().slice(0, 10)} (${g.players.map((p) => p.userName).join(", ")})`);
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
