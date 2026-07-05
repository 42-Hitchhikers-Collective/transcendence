import { writeFile, unlink } from "fs/promises";
import { mkdirSync } from "fs";
import path from "path";
import sharp from "sharp";

const AVATAR_DIR = process.env.AVATAR_DIR || "/app/data/avatars";
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

mkdirSync(AVATAR_DIR, { recursive: true });

// Deletes a locally stored avatar file. Skips default avatar and non-local URLs.
async function deleteLocalAvatar(avatarUrl: string | null) {
  if (!avatarUrl || !avatarUrl.startsWith("/avatars/")) return;
  const filename = path.basename(avatarUrl);
  if (filename === "default.png") return;
  await unlink(path.join(AVATAR_DIR, filename)).catch(() => {});
}

export async function profileRoutes(app: any) {
  app.post(
    "/me/avatar",
    {
      preHandler: [app.auth],
      config: {
        //Rate limit to prevent abuse of avatar uploads that can exhaust server responses
        rateLimit: {
          max: 5,
          timeWindow: "5 minutes",
          hook: "preHandler", // makes shure that the check runs after authentication, so request.user exists
          keyGenerator: (request: any) => {
            return (request.user as { sub?: string })?.sub ?? request.ip;
          },
          // Added custom error messages to provdie better feedback for the client when rate limit is exceeded
          errorResponseBuilder: (_req: any, ctx: any) => ({
            statusCode: 429,
            error: "Too Many Requests",
            message: `Too many uploads. \n Wait ${ctx.after} cooldown`,
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const payload = request.user as { sub?: string };
      if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

      const file = await request.file();
      if (!file) return reply.code(400).send({ error: "no file uploaded" });
      if (!ALLOWED_MIME.includes(file.mimetype))
        return reply.code(400).send({ error: "only jpeg, png, webp allowed" });

      // Buffer the entire upload so we can inspect dimensions before writing
      const buffer = await file.toBuffer();

      // Rejects files larger than 2 MB (multipart & nginx enforce 5 MB globally)
      if (buffer.length > 2 * 1024 * 1024)
        return reply
          .code(400)
          .send({ error: "avatar image must be under 2 MB" });

      // Validates that the file is actually a valid image and not just a renamed file with a valid extension
      try {
        const metadata = await sharp(buffer).metadata();
        if (!metadata.width || !metadata.height || !metadata.format)
          return reply.code(400).send({ error: "invalid image file" });
      } catch {
        return reply.code(400).send({ error: "invalid image file" });
      }

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
    },
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
    },
  );
}
