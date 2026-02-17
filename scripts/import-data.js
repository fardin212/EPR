// scripts/import-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ در حال خواندن export-data.json ...');

  const raw = fs.readFileSync('export-data.json', 'utf8');
  const data = JSON.parse(raw);

  const categories = data.categories || [];
  const projects = data.projects || [];
  const images = data.images || [];
  const banners = data.banners || [];

  console.log(`📂 دسته‌بندی‌ها: ${categories.length}`);
  console.log(`📂 پروژه‌ها: ${projects.length}`);
  console.log(`📂 تصاویر: ${images.length}`);
  console.log(`📂 بنرها: ${banners.length}`);

  // پاک‌سازی دیتای قبلی (برای این‌که دقیقاً مثل dev.db بشه)
  console.log('🧹 پاک کردن داده‌های قبلی مرتبط ...');
  await prisma.projectQuestion.deleteMany();
  await prisma.projectComment.deleteMany();
  await prisma.image.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();

  console.log('⬆️ وارد کردن دسته‌بندی‌ها ...');
  if (categories.length > 0) {
    await prisma.category.createMany({
      data: categories.map((c) => ({ ...c })),
      skipDuplicates: true,
    });
  }

  console.log('⬆️ وارد کردن پروژه‌ها ...');
  if (projects.length > 0) {
    await prisma.project.createMany({
      data: projects.map((p) => ({ ...p })),
      skipDuplicates: true,
    });
  }

  console.log('⬆️ وارد کردن تصاویر ...');
  if (images.length > 0) {
    await prisma.image.createMany({
      data: images.map((img) => ({ ...img })),
      skipDuplicates: true,
    });
  }

  console.log('⬆️ وارد کردن بنرها ...');
  if (banners.length > 0) {
    await prisma.banner.createMany({
      data: banners.map((b) => ({ ...b })),
      skipDuplicates: true,
    });
  }

  console.log('✅ انتقال دیتا به سرور تمام شد.');
}

main()
  .catch((e) => {
    console.error('❌ خطا در import-data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
