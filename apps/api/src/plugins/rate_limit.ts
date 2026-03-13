import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

export const rateLimitPlugin = fp(async (app) => {
  app.register(rateLimit, {
    global: false, // allow per-route config
  });
});