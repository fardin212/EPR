import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const cats = [
    { name: "ویلایی - کلبه‌ای", slug: "vila-kolbeh" },
    { name: "ویلایی - رف‌گاردن", slug: "vila-roofgarden" },
    { name: "ویلایی - سوئیسی", slug: "vila-swiss" },
    { name: "ویلایی - فلت", slug: "vila-flat" },
    { name: "کارگاهی", slug: "workshop" },
    { name: "تجاری - فست‌فود", slug: "food" },
    { name: "تجاری - فروشگاهی", slug: "shop" },
  ];
  for (const c of cats) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log("Seeded categories.");
}

main().finally(() => prisma.$disconnect());