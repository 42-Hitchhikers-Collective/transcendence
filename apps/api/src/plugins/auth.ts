import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";

declare module "fastify" {
  interface FastifyInstance {
    auth: (request: any, reply: any) => Promise<void>;
  }
}

export const authPlugin = fp(async (app) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing");
  }

  app.register(cookie);
  app.register(jwt, {
    secret: jwtSecret,
    // we store the token in a cookie
    cookie: { cookieName: "token", 
      signed: false // false as we are using JWT signature and verification mechanism by default to make it cryptographically secure
    },
  });

  app.decorate("auth", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({ error: "unauthorized" });
    }
  });
});