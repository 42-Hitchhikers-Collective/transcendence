import bcrypt from "bcrypt";

type RegisterInput = { email: string; password: string; username: string };
type LoginInput = { email: string; password: string };

export async function registerUser(app: any, input: RegisterInput) {
  const existingEmail = await app.prisma.user.findUnique({ where: { email: input.email } });
  if (existingEmail) return { ok: false as const, error: "email_in_use" as const };

  const existingUsername = await app.prisma.profile.findFirst({ where: { username: input.username } });
  if (existingUsername) return { ok: false as const, error: "username_in_use" as const };

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await app.prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      profile: { create: { username: input.username } },
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

  return { ok: true as const, userId: user.id };
}
