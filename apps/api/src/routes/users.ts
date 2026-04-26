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

    return { user: me };
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
        roomName: game.lobby ? `Lobby ${game.lobby.id.slice(0, 6)}` : "Match",
        opponents,
        date: (game.endedAt ?? game.createdAt).toISOString(),
      };
    });

    return { history };
  });
}