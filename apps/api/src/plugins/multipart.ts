import fp from "fastify-plugin";
import multipart from "@fastify/multipart";

export const multipartPlugin = fp(async (app) => {
  app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });
});
