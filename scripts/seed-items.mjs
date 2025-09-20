// IMPORTANT: Set your connection string directly here before running.
const DATABASE_URL = process.env.DATABASE_URL || "#######"; // replace inline before running if desired

import { PrismaClient, Category } from "@prisma/client";

if (!DATABASE_URL) {
  console.error("Please set DATABASE_URL before running this script.");
  process.exit(1);
}

process.env.DATABASE_URL = DATABASE_URL;
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.findFirst({ where: { username: "demo" } });
  if (!store) throw new Error("Seed store first (seed-store.mjs)");

  const demoItems = [
    {
      name: "وجبة شاورما دبل",
      description: "وجبة مع بطاطا ومايتريكس",
      price: 3.0,
      currency: "JD",
      imageUrl: "https://images.unsplash.com/photo-1604908176997-4316520300d6?q=80&w=800&auto=format&fit=crop",
      available: true,
      category: Category.MEALS,
    },
    {
      name: "وجبة بروستد 4 قطع",
      description: "وجبة بروستد 4 قطع لشخص واحد",
      price: 2.5,
      currency: "JD",
      imageUrl: "https://whatsbeefjo.com/cdn/shop/products/IMG_0019_1.jpg?v=1674048959",
      available: true,
      category: Category.MEALS,
    },
    {
      name: "ساندويتش",
      description: "فلافل طازج مع صوص",
      price: 1.5,
      currency: "JD",
      imageUrl: "https://images.unsplash.com/photo-1606756790138-261d1b9f58f1?q=80&w=800&auto=format&fit=crop",
      available: true,
      category: Category.SNACKS,
    },
    {
      name: "سباغيتي بولونيز",
      description: "سباغيتي محضرة مع كرات اللحم المفروم",
      price: 4.0,
      currency: "JD",
      imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop",
      available: false,
      category: Category.SNACKS,
    },
    {
      name: "كنافة",
      description: "كنافة عربية طازجة",
      price: 2.0,
      currency: "JD",
      imageUrl: "https://images.unsplash.com/photo-1625944521666-3c2635ee11ad?q=80&w=800&auto=format&fit=crop",
      available: true,
      category: Category.DESSERTS,
    },
    {
      name: "آيس كوفي",
      description: "قهوة باردة منعشة",
      price: 1.25,
      currency: "JD",
      imageUrl: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop",
      available: true,
      category: Category.DRINKS,
    },
  ];

  for (const it of demoItems) {
    await prisma.item.create({ data: { ...it, storeId: store.id } });
  }

  console.log("Seeded", demoItems.length, "items for store", store.id);
}

main().then(() => prisma.$disconnect());
