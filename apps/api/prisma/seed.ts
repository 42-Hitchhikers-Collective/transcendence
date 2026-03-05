// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seedAdminUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  // Upsert = idempotent: create if missing, update if exists
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,          // ✅ always enforce expected password
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

async function seedAdminRole() {
  const role = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
    select: { id: true, name: true },
  });

  console.log(`Seeded role: ${role.name}`);
  return role;
}

async function linkUserRole(userId: string, roleId: string, email: string) {
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId, roleId },
    },
    update: {},
    create: { userId, roleId },
  });

  console.log(`Seeded user role link: ${email} -> ADMIN`);
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Seed skipped: missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD");
    return;
  }

  const user = await seedAdminUser(email, password);
  const adminRole = await seedAdminRole();
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