// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Seed skipped: missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD");
    return;
  }

  // 1) Ensure user exists (create if missing)
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        status: "ACTIVE",
        isEmailVerified: true,
      },
      select: { id: true, email: true },
    });

    console.log(`Seeded admin user (created): ${user.email}`);
  } else if (!existing.passwordHash) {
    // 2) Repair user if it exists but has no password
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    console.log(`Seeded admin user (repaired password): ${email}`);
  } else {
    console.log(`Seeded admin user (already exists): ${email}`);
  }

  // 3) Ensure ADMIN role + link (based on your schema)
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
  if (!user) return;

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: user.id, roleId: adminRole.id },
    },
    update: {},
    create: { userId: user.id, roleId: adminRole.id },
  });

  console.log(`Seeded admin role link: ${email} -> ADMIN`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });