export async function profileRoutes(app: any) {
  app.patch(
    "/me",
    {
      preHandler: [app.auth],
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          properties: {
            userName: { type: "string", minLength: 1 },
            avatarUrl: { type: "string", minLength: 1 },
            bio: { type: "string" },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const payload = request.user as { sub?: string };
      if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

      const body = request.body as { userName?: string; avatarUrl?: string; bio?: string };

      const profile = await app.prisma.profile.upsert({
        where: { userId: payload.sub },
        update: body,
        create: {
          userId: payload.sub,
          userName: body.userName || "User",
          avatarUrl: body.avatarUrl,
          bio: body.bio,
        },
        select: { userName: true, avatarUrl: true, bio: true },
      });

      return reply.send({ profile });
    }
  );
}