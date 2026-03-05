import bcrypt from "bcrypt";
import { hashToken, newOneTimeToken, oneTimeExpiryDate } from "../auth/tokens";

const VERIFY_TTL_MIN = Number(process.env.EMAIL_VERIFY_TTL_MIN || 60 * 24); // 24h default
const RESET_TTL_MIN = Number(process.env.PASSWORD_RESET_TTL_MIN || 30);     // 30 min default

export async function createEmailVerifyToken(app: any, userId: string) {
  const raw = newOneTimeToken();
  const tokenHash = hashToken(raw);

  await app.prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: oneTimeExpiryDate(VERIFY_TTL_MIN),
    },
  });

  return { raw };
}

export async function confirmEmailVerifyToken(app: any, raw: string) {
  const tokenHash = hashToken(raw);

  const row = await app.prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: { userId: true, usedAt: true, expiresAt: true },
  });

  if (!row || row.usedAt || row.expiresAt <= new Date()) {
    return { ok: false as const };
  }

  await app.prisma.$transaction([
    app.prisma.emailVerificationToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    }),
    app.prisma.user.update({
      where: { id: row.userId },
      data: { isEmailVerified: true },
    }),
  ]);

  return { ok: true as const };
}

// Always return ok:true to avoid user enumeration
export async function createPasswordResetToken(app: any, email: string) {
  const user = await app.prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return { ok: true as const, raw: null as string | null };
  }

  const raw = newOneTimeToken();
  const tokenHash = hashToken(raw);

  await app.prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: oneTimeExpiryDate(RESET_TTL_MIN),
    },
  });

  return { ok: true as const, raw };
}

export async function confirmPasswordReset(app: any, raw: string, newPassword: string) {
  const tokenHash = hashToken(raw);

  const row = await app.prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { userId: true, usedAt: true, expiresAt: true },
  });

  if (!row || row.usedAt || row.expiresAt <= new Date()) {
    return { ok: false as const };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await app.prisma.$transaction([
    app.prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    }),
    app.prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    // Security hardening: revoke all active refresh tokens
    app.prisma.refreshToken.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { ok: true as const };
}