// prisma/seed.cjs
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔰 اجرای Seed ERP نیکان ...");

  // 1) Company (upsert-like)
  let company = await prisma.company.findUnique({
    where: { code: "NIKAN" },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "کانکس نیکان",
        code: "NIKAN",
        description: "شرکت پیش‌فرض برای ERP نیکان",
      },
    });
    console.log("✔ شرکت کانکس نیکان ایجاد شد.");
  } else {
    console.log("ℹ شرکت کانکس نیکان قبلاً وجود داشت، از همان استفاده می‌کنیم.");
  }

  // 2) Admin User (admin12@local)
  let user = await prisma.user.findUnique({
    where: { email: "admin12@local" },
  });

  if (!user) {
    const passwordHash = bcrypt.hashSync("admin1234", 10); // رمز: admin1234

    user = await prisma.user.create({
      data: {
        email: "admin12@local",
        password: passwordHash,
        role: "ADMIN",
        name: "admin12",
        companyId: company.id,
        isActive: true,
      },
    });

    console.log("✔ کاربر admin12 ایجاد شد.");
  } else {
    console.log("ℹ کاربر admin12@local قبلاً وجود داشت، از همان استفاده می‌کنیم.");
  }

  // 3) حسابداری - سرفصل‌های پایه
  await prisma.accountingAccount.createMany({
    data: [
      {
        companyId: company.id,
        code: "1000",
        name: "صندوق",
        type: "ASSET",
      },
      {
        companyId: company.id,
        code: "2000",
        name: "بانک",
        type: "ASSET",
      },
      {
        companyId: company.id,
        code: "5000",
        name: "هزینه‌های پروژه",
        type: "EXPENSE",
      },
      {
        companyId: company.id,
        code: "7000",
        name: "درآمد فروش پروژه",
        type: "REVENUE",
      },
      {
        companyId: company.id,
        code: "9000",
        name: "طرف حساب‌ها",
        type: "LIABILITY",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✔ سرفصل‌های حسابداری پایه اضافه شد (یا از قبل وجود داشت).");

  // 4) Warehouse پیش‌فرض
  // اگر در اسکیمای شما روی Warehouse فقط code یونیک است:
  let warehouse = await prisma.warehouse.findUnique({
    where: { code: "MAIN" },
  });

  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        companyId: company.id,
        code: "MAIN",
        name: "انبار مرکزی",
      },
    });
    console.log("✔ انبار پیش‌فرض ایجاد شد.");
  } else {
    console.log("ℹ انبار MAIN قبلاً وجود داشت، از همان استفاده می‌کنیم.");
  }

  console.log("🎉 Seed با موفقیت (و بدون تکرار) انجام شد!");
}

main()
  .catch((e) => {
    console.error("❌ خطا در Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
