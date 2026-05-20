import { randomUUID } from "crypto";
import { createWriteStream, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import path from "path";

// const AVATAR_DIR = "/app/data/avatars";  // Use this in production (inside Docker)
const AVATAR_DIR = process.env.AVATAR_DIR || "./data/avatars"; // Use this in development (local filesystem)
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

mkdirSync(AVATAR_DIR, { recursive: true });

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
            username: { type: "string", minLength: 1 },
            avatarUrl: { type: "string", minLength: 1 },
            bio: { type: "string" },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const payload = request.user as { sub?: string };
      if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

      const body = request.body as { username?: string; avatarUrl?: string; bio?: string };

      const profile = await app.prisma.profile.upsert({
        where: { userId: payload.sub },
        update: body,
        create: {
          userId: payload.sub,
          username: body.username || "User",
          avatarUrl: body.avatarUrl ?? "/avatars/default.png",
          bio: body.bio,
        },
        select: { username: true, avatarUrl: true, bio: true },
      });

      return reply.send({ profile });
    }
  );

  app.post(
    "/me/avatar",
    { preHandler: [app.auth] },
    async (request: any, reply: any) => {
      const payload = request.user as { sub?: string };
      if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

      const file = await request.file();
      if (!file) return reply.code(400).send({ error: "no file uploaded" });
      if (!ALLOWED_MIME.includes(file.mimetype))
        return reply.code(400).send({ error: "only jpeg, png, webp, gif allowed" });

      const filename = randomUUID() + EXT[file.mimetype];
      await pipeline(file.file, createWriteStream(path.join(AVATAR_DIR, filename)));

      const avatarUrl = `/avatars/${filename}`;
      await app.prisma.profile.upsert({
        where: { userId: payload.sub },
        update: { avatarUrl },
        create: { userId: payload.sub, username: "User", avatarUrl },
      });

      return reply.send({ avatarUrl });
    }
  );
}