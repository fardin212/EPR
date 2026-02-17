import { PrismaClient, UsedConexStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // پاکسازی نمونه (اختیاری)
  await prisma.usedConexImage.deleteMany({});
  await prisma.usedConexRefurbItem.deleteMany({});
  await prisma.usedConex.deleteMany({});

  const a = await prisma.usedConex.create({
    data: {
      slug: "kanex-negahbani-2x3-tehran-1",
      title: "کانکس نگهبانی ۲×۳ دست دوم",
      type: "نگهبانی",
      size: "2×3",
      city: "تهران",
      price: 98000000,
      status: UsedConexStatus.ready,
      isReady: true,
      note: "مناسب نگهبانی، پروژه‌های عمرانی و ورودی کارگاه.",
      images: {
        create: [
          { url: "/uploads/used/demo-1.jpg", sort: 0, kind: "gallery" },
        ],
      },
    },
  });

  const b = await prisma.usedConex.create({
    data: {
      slug: "kanex-karghahi-3x6-karaj-2",
      title: "کانکس کارگاهی ۳×۶ دست دوم",
      type: "کارگاهی",
      size: "3×6",
      city: "کرج",
      price: 165000000,
      status: UsedConexStatus.minor_fix,
      isReady: false,
      note: "برای دفاتر پروژه و کارگاه‌ها مناسب است.",
    },
  });

  const c = await prisma.usedConex.create({
    data: {
      slug: "kanex-sandwich-3x6-qom-3",
      title: "کانکس ساندویچ‌پنل ۳×۶ بازسازی‌شده",
      type: "ساندویچ‌پنل",
      size: "3×6",
      city: "قم",
      price: 245000000,
      status: UsedConexStatus.refurbished,
      isReady: true,
      refurbished: true,
      note: "گزینه عالی برای استفاده فوری با ظاهر تمیز.",
      refurbItems: {
        create: [
          { title: "تعویض کف", desc: "کف نو + زیرسازی تقویت‌شده", sort: 0 },
          { title: "تقویت شاسی", desc: "جوشکاری مجدد نقاط حساس", sort: 1 },
          { title: "رنگ صنعتی", desc: "پوشش مقاوم در برابر رطوبت", sort: 2 },
          { title: "سرویس برق‌کشی", desc: "کلید و پریزها بررسی و تعویض شدند", sort: 3 },
        ],
      },
      images: {
        create: [
          { url: "/uploads/used/demo-2.jpg", sort: 0, kind: "gallery" },
          { url: "/uploads/used/before-1.jpg", sort: 0, kind: "before" },
          { url: "/uploads/used/after-1.jpg", sort: 0, kind: "after" },
        ],
      },
    },
  });

  console.log("Seeded:", { a: a.slug, b: b.slug, c: c.slug });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
