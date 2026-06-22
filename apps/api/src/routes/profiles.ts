import { randomUUID } from "crypto";
import { writeFile, unlink } from "fs/promises";
import { mkdirSync } from "fs";
import path from "path";
import sharp from "sharp";

const AVATAR_DIR = process.env.AVATAR_DIR || "/app/data/avatars";
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

mkdirSync(AVATAR_DIR, { recursive: true });

// Deletes a locally stored avatar file. Skips default avatar and non-local URLs.
async function deleteLocalAvatar(avatarUrl: string | null) {
  if (!avatarUrl || !avatarUrl.startsWith("/avatars/")) return;
  const filename = path.basename(avatarUrl);
  if (filename === "default.png") return;
  await unlink(path.join(AVATAR_DIR, filename)).catch(() => {});
}

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
        return reply.code(400).send({ error: "only jpeg, png, webp allowed" });

      // Buffer the entire upload so we can inspect dimensions before writing
      const buffer = await file.toBuffer();

      // JESS: Remove this as too restrictive for users (frontend also makes the image squared, no matter what aspects ration the original image has).
      // const metadata = await sharp(buffer).metadata();
      // if (!metadata.width || !metadata.height || metadata.width !== metadata.height)
      //   return reply.code(400).send({ error: "image must have a 1:1 aspect ratio" });

      // Clean up old avatar before saving the new one
      const existing = await app.prisma.profile.findUnique({
        where: { userId: payload.sub },
        select: { avatarUrl: true },
      });
      await deleteLocalAvatar(existing?.avatarUrl ?? null);

      // const filename = randomUUID() + EXT[file.mimetype];
      const filename = `${payload.sub}${EXT[file.mimetype]}`; // Use userId as filename to avoid accumulating old avatars and hitting storage limits
      await writeFile(path.join(AVATAR_DIR, filename), buffer);

      const avatarUrl = `/avatars/${filename}`;
      await app.prisma.profile.upsert({
        where: { userId: payload.sub },
        update: { avatarUrl },
        create: { userId: payload.sub, username: "User", avatarUrl },
      });

      return reply.send({ avatarUrl });
    }
  );

  app.delete(
    "/me/avatar",
    { preHandler: [app.auth] },
    async (request: any, reply: any) => {
      const payload = request.user as { sub?: string };
      if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

      const profile = await app.prisma.profile.findUnique({
        where: { userId: payload.sub },
        select: { avatarUrl: true },
      });

      await deleteLocalAvatar(profile?.avatarUrl ?? null);

      await app.prisma.profile.update({
        where: { userId: payload.sub },
        data: { avatarUrl: null },
      });

      return reply.send({ avatarUrl: null });
    }
  );
}
