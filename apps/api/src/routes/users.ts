type RankedUser = {
  userId: string;
  wins: number;
  losses: number;
  rank: number; // 0 = has losses but no wins; 1+ = ranked by win count
};

async function computeRankedUsers(prisma: any): Promise<RankedUser[]> {
  const rows: { userId: string; wins: number; totalGames: number }[] =
    await prisma.$queryRaw`
      SELECT
        gp."userId",
        CAST(COUNT(*) FILTER (WHERE gp.placement = 1) AS INT) AS wins,
        CAST(COUNT(*) AS INT) AS "totalGames"
      FROM "GamePlayer" gp
      JOIN "Game" g ON gp."gameId" = g.id
      WHERE g.status = 'FINISHED'
      GROUP BY gp."userId"
    `;

  const withWins = rows.filter((r) => r.wins > 0).sort((a, b) => b.wins - a.wins);
  const withoutWins = rows.filter((r) => r.wins === 0);

  const ranked: RankedUser[] = [];

  let rank = 1;
  for (let i = 0; i < withWins.length; i++) {
    if (i > 0 && withWins[i].wins < withWins[i - 1].wins) rank = i + 1;
    ranked.push({
      userId: withWins[i].userId,
      wins: withWins[i].wins,
      losses: withWins[i].totalGames - withWins[i].wins,
      rank,
    });
  }

  for (const r of withoutWins) {
    ranked.push({ userId: r.userId, wins: 0, losses: r.totalGames, rank: 0 });
  }

  return ranked;
}

export async function userRoutes(app: any) {
  app.get("/", async () => {
    const users = await app.prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
        profile: { select: { username: true, avatarUrl: true } },
      },
    });
    return { users };
  });

  // Public leaderboard — no auth required
  app.get("/leaderboard", async () => {
    const ranked = await computeRankedUsers(app.prisma);

    const profiles = await app.prisma.profile.findMany({
      where: { userId: { in: ranked.map((r) => r.userId) } },
      select: { userId: true, username: true, avatarUrl: true },
    });
    const profileMap = new Map(profiles.map((p: any) => [p.userId, p]));

    const data = ranked.map((r) => ({
      rank: r.rank,
      username: profileMap.get(r.userId)?.username ?? "Unknown",
      avatarUrl: profileMap.get(r.userId)?.avatarUrl ?? null,
    }));

    return { data };
  });

  app.get("/me", { preHandler: [app.auth] }, async (request: any, reply: any) => {
    const payload = request.user as { sub?: string };
    if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

    const me = await app.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: { select: { username: true, avatarUrl: true, bio: true } },
      },
    });

    const ranked = await computeRankedUsers(app.prisma);
    const entry = ranked.find((r) => r.userId === payload.sub);
    const stats = entry
      ? { rank: entry.rank, wins: entry.wins, losses: entry.losses }
      : { rank: null, wins: 0, losses: 0 };

    return { user: { ...me, stats } };
  });

  app.get("/me/history", { preHandler: [app.auth] }, async (request: any, reply: any) => {
    const payload = request.user as { sub?: string };
    if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

    const games = await app.prisma.game.findMany({
      where: { players: { some: { userId: payload.sub } } },
      orderBy: [{ endedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: {
        lobby: { select: { id: true } },
        players: {
          include: {
            user: {
              select: {
                id: true,
                profile: { select: { username: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    const history = games.map((game: any) => {
      const me = game.players.find((p: any) => p.userId === payload.sub);
      const result = me?.placement === 1 ? "win" : "loss";
      const opponents = game.players
        .filter((p: any) => p.userId !== payload.sub)
        .map((p: any) => ({
          id: p.userId,
          username: p.user.profile?.username ?? "Player",
          avatar: p.user.profile?.avatarUrl ?? "",
        }));

      return {
        id: game.id,
        result,
        roomName: game.roomName ?? (game.lobby ? `Lobby ${game.lobby.id.slice(0, 6)}` : "Match"), // JESS: We need the room name to show it in the game history as first priority, then we resort to id and fallback later
        opponents,
        date: (game.endedAt ?? game.createdAt).toISOString(),
      };
    });

    return { history };
  });

  app.get("/:id", { preHandler: [app.auth] }, async (request: any, reply: any) => {
    const { id } = request.params as { id: string };

    const user = await app.prisma.user.findFirst({
      where: { profile: { username: id } },
      select: {
        id: true,
        createdAt: true,
        profile: { select: { username: true, avatarUrl: true, bio: true } },
      },
    });

    if (!user) return reply.code(404).send({ error: "user not found" });
    return { user };
  });
}
