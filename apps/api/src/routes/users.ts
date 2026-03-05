export async function userRoutes(app: any) {
  app.get("/", async () => {
    const users = await app.prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
        profile: { select: { displayName: true, avatarUrl: true } },
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
        profile: { select: { displayName: true, avatarUrl: true, bio: true } },
      },
    });

    return { user: me };
  });
}