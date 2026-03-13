import type { FastifyInstance } from "fastify";

export async function adminRoutes(app: FastifyInstance) {
  app.get(
    "/admin/users",
    { preHandler: [app.requireRole("admin")] },
    async () => {
      const users = await app.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          status: true,
          isEmailVerified: true,
          createdAt: true,
          userRoles: { select: { role: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });

      return users.map((u) => ({
        ...u,
        roles: u.userRoles.map((r) => r.role.name),
      }));
    }
  );
}