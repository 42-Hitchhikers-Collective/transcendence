import bcrypt from "bcrypt";
import { newRefreshToken, hashToken, refreshExpiryDate } from "../auth/tokens";

type RegisterInput = { email: string; password: string; displayName: string };
type LoginInput = { email: string; password: string };

export async function registerUser(app: any, input: RegisterInput) {
  const existing = await app.prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return { ok: false as const, error: "email_in_use" as const };

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await app.prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      profile: { create: { displayName: input.displayName } },
    },
    select: { id: true, email: true, createdAt: true },
  });

  return { ok: true as const, user };
}

export async function loginUser(app: any, input: LoginInput) {
  const user = await app.prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, passwordHash: true },
  });

  if (!user || !user.passwordHash) return { ok: false as const, error: "invalid_credentials" as const };

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return { ok: false as const, error: "invalid_credentials" as const };

  const refreshRaw = newRefreshToken();
  await app.prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshRaw),
      expiresAt: refreshExpiryDate(30),
    },
  });

  return { ok: true as const, userId: user.id, refreshRaw };
}

export async function rotateRefreshToken(app: any, raw: string) {
  const tokenHash = hashToken(raw);

  const existing = await app.prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!existing || existing.revokedAt || existing.expiresAt <= new Date()) {
    return { ok: false as const, error: "invalid_refresh_token" as const };
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

  return { ok: true as const, userId: existing.userId, refreshRaw: newRaw };
}

export async function logoutRefreshToken(app: any, raw: string | null) {
  if (!raw) return;

  await app.prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(raw), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function logoutAllRefreshTokens(app: any, userId: string) {
  await app.prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}