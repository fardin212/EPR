const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COMPANY_ID = 1;

async function upsertMaterial({ name, unit, unitPrice = 0, category = null }) {
  const existing = await prisma.material.findFirst({
    where: { companyId: COMPANY_ID, name },
  });

  if (existing) {
    return prisma.material.update({
      where: { id: existing.id },
      data: { unit, unitPrice, category, isActive: true },
    });
  }

  return prisma.material.create({
    data: { companyId: COMPANY_ID, name, unit, unitPrice, category, isActive: true },
  });
}

async function main() {
  console.log("🔰 Seed مصالح کانکس نیکان...");

  const items = [
    { name: "تیرآهن", unit: "kg", category: "اسکلت" },
    { name: "پروفیل", unit: "kg", category: "اسکلت" },
    { name: "ورق بدنه23", unit: "m2", category: "پوشش" },
    { name: "ورق سقف30", unit: "m2", category: "پوشش" },
    { name: "تخته کف", unit: "m2", category: "کف" },
    { name: "پلاستفوم", unit: "m2", category: "عایق" },
    { name: "کفپوش", unit: "m2", category: "کف" },
    { name: "پی وی سی", unit: "m2", category: "داخلی" },
    { name: "لبه", unit: "m", category: "پوشش" },
    { name: "آبروی پنجره", unit: "عدد", category: "بازشو" },
    { name: "آبروی در", unit: "عدد", category: "بازشو" },
    { name: "نبشی 2 ورق", unit: "m", category: "اسکلت" },
    { name: "تسمه", unit: "m", category: "اسکلت" },
    { name: "لچکی", unit: "عدد", category: "اسکلت" },
    { name: "درب", unit: "عدد", category: "بازشو" },
    { name: "پنجره", unit: "عدد", category: "بازشو" },
    { name: "قلاب", unit: "عدد", category: "متفرقه" },
    { name: "برق کشی", unit: "مبلغ", category: "تاسیسات" },
    { name: "رنگ و الکترود", unit: "مبلغ", category: "متغیر" },
    { name: "پیچ و چسب", unit: "مبلغ", category: "متغیر" },
    { name: "اجرت", unit: "مبلغ", category: "متغیر" },
  ];

  for (const it of items) await upsertMaterial(it);

  const count = await prisma.material.count({ where: { companyId: COMPANY_ID } });
  console.log(`✅ Done. companyId=${COMPANY_ID} materials=${count}`);
}

main()
  .catch((e) => {
    console.error("❌ seed-materials failed:", e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
