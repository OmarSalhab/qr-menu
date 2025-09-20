// IMPORTANT: Set your connection string directly here before running.
// Example: const DATABASE_URL = "postgresql://user:pass@host:5432/db";
const DATABASE_URL = process.env.DATABASE_URL || "#######"; // replace inline before running if you prefer

import { PrismaClient } from "@prisma/client";

if (!DATABASE_URL) {
  console.error("Please set DATABASE_URL before running this script.");
  process.exit(1);
}

process.env.DATABASE_URL = DATABASE_URL;
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.upsert({
    where: { username: "demo" },
    update: {},
    create: {
      username: "demo",
      password: "demo123", // NOTE: plain for demo seeding
      name: "مطعم تجريبي",
      description: "مطعم تجريبي قابل للتخصيص",
      brandColor: "oklch(60% 0.17 264)",
      bannerUrl: "https://images.unsplash.com/photo-1459478309853-2c33a60058e7?q=80&w=1400&auto=format&fit=crop",
      logoUrl: "https://avatars.githubusercontent.com/u/139895814?s=200&v=4",
    },
  });
  console.log("Seeded store:", store.id);
}

main().then(() => prisma.$disconnect());
