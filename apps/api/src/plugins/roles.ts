import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type JwtUser = {
  sub: string;
  email?: string;
  roles?: string[];
};

export default fp(async function rolesPlugin(app: FastifyInstance) {
  app.decorate("requireRole", (role: string) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      await req.jwtVerify();

      const user = req.user as JwtUser;
      const roles = user.roles ?? [];

      if (!roles.includes(role)) {
        return reply.code(403).send({ message: "Forbidden" });
      }
    };
  });
});

declare module "fastify" {
  interface FastifyInstance {
    requireRole: (role: string) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}