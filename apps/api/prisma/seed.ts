// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seedRoles() {
  await prisma.role.createMany({
    data: [{ name: "user" }, { name: "admin" }, { name: "moderator" }],
    skipDuplicates: true,
  });

  const admin = await prisma.role.findUnique({
    where: { name: "admin" },
    select: { id: true, name: true },
  });

  if (!admin) {
    throw new Error("seedRoles: admin role missing after createMany");
  }

  console.log("Seeded roles: user, admin, moderator");
  return admin;
}

async function seedAdminUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      status: "ACTIVE",
      isEmailVerified: true,
    },
    create: {
      email,
      passwordHash,
      status: "ACTIVE",
      isEmailVerified: true,
    },
    select: { id: true, email: true },
  });

  console.log(`Seeded admin user (upserted): ${user.email}`);
  return user;
}

async function linkUserRole(userId: string, roleId: string, email: string) {
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId },
  });

  console.log(`Seeded user role link: ${email} -> admin`);
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Seed skipped: missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD");
    return;
  }

  const adminRole = await seedRoles();
  const user = await seedAdminUser(email, password);
  await linkUserRole(user.id, adminRole.id, email);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });