// prisma/seed-project-types.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROJECT_TYPES = [
  { name: "کانکس ویلایی", code: "VILLA", description: "کانکس ویلایی مسکونی" },
  { name: "کانکس سوئیسی", code: "Swisi", description: "کانکس سوئیسی" },
  { name: "کانکس کارگاهی", code: "WORKSHOP", description: "کانکس کارگاهی صنعتی" },
  { name: "کانکس نگهبانی", code: "GUARD", description: "کانکس نگهبانی و حراست" },
  { name: "کانکس سرویس بهداشتی", code: "WC", description: "کانکس سرویس بهداشتی" },
  { name: "کانکس اداری", code: "OFFICE", description: "کانکس اداری و دفتری" },
  { name: "کانکس ساندویچی", code: "SANDWICH", description: "کانکس ساندویچی" },
  { name: "کانکس فروشگاهی", code: "SHOP", description: "کانکس فروشگاهی" },
  { name: "کانکس خوابگاهی", code: "DORM", description: "کانکس خوابگاهی" },
  { name: "کانکس سردخانه‌ای", code: "COLD", description: "کانکس سردخانه‌ای" },
  { name: "کانکس مخابراتی", code: "TEL", description: "کانکس مخابراتی" },
];

async function main() {
  console.log("🌱 Seeding Project Types...");

  for (const pt of PROJECT_TYPES) {
    const exists = await prisma.projectType.findFirst({
      where: { code: pt.code },
      select: { id: true },
    });

    if (exists) {
      console.log(`⏭️  ${pt.code} already exists`);
      continue;
    }

    await prisma.projectType.create({
      data: pt,
    });

    console.log(`✅ Created ${pt.name}`);
  }

  console.log("🎉 ProjectType seeding done");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
