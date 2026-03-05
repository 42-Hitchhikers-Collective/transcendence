import bcrypt from "bcrypt";
import { newRefreshToken, hashToken, refreshExpiryDate } from "../auth/tokens";
import { setRefreshCookie, clearRefreshCookie, getRefreshCookie } from "../auth/cookies";

export async function authRoutes(app: any) {
  app.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "displayName"],
          additionalProperties: false,
          properties: {
            email: { type: "string", minLength: 3 },
            password: { type: "string", minLength: 6 },
            displayName: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { email: string; password: string; displayName: string };

      const existing = await app.prisma.user.findUnique({ where: { email: body.email } });
      if (existing) return reply.code(409).send({ error: "email already in use" });

      const passwordHash = await bcrypt.hash(body.password, 10);

      const user = await app.prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          profile: { create: { displayName: body.displayName } },
        },
        select: { id: true, email: true, createdAt: true },
      });

      return reply.code(201).send({ user });
    }
  );

  app.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          additionalProperties: false,
          properties: {
            email: { type: "string", minLength: 3 },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { email: string; password: string };

      const user = await app.prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, passwordHash: true },
      });

      if (!user || !user.passwordHash) return reply.code(401).send({ error: "invalid credentials" });

      const ok = await bcrypt.compare(body.password, user.passwordHash);
      if (!ok) return reply.code(401).send({ error: "invalid credentials" });

      const accessToken = await reply.jwtSign({ sub: user.id }, { expiresIn: "15m" });

      const refreshRaw = newRefreshToken();
      await app.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(refreshRaw),
          expiresAt: refreshExpiryDate(30),
        },
      });

      setRefreshCookie(reply, refreshRaw);
      return reply.send({ token: accessToken });
    }
  );

  app.post("/refresh", async (request: any, reply: any) => {
    const raw = getRefreshCookie(request);
    if (!raw) return reply.code(401).send({ error: "missing_refresh_token" });

    const tokenHash = hashToken(raw);

    const existing = await app.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!existing || existing.revokedAt || existing.expiresAt <= new Date()) {
      clearRefreshCookie(reply);
      return reply.code(401).send({ error: "invalid_refresh_token" });
    }

    await app.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });

    const newRaw = newRefreshToken();
    await app.prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: hashToken(newRaw),
        expiresAt: refreshExpiryDate(30),
      },
    });

    setRefreshCookie(reply, newRaw);

    const accessToken = await reply.jwtSign({ sub: existing.userId }, { expiresIn: "15m" });
    return reply.send({ token: accessToken });
  });

  app.post("/logout", async (request: any, reply: any) => {
    const raw = getRefreshCookie(request);
    if (raw) {
      await app.prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(raw), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    clearRefreshCookie(reply);
    return reply.send({ ok: true });
  });

  app.post("/logout-all", { preHandler: [app.auth] }, async (request: any, reply: any) => {
    const payload = request.user as { sub?: string };
    if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

    await app.prisma.refreshToken.updateMany({
      where: { userId: payload.sub, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    clearRefreshCookie(reply);
    return reply.send({ ok: true });
  });
}