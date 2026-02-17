/* prisma/seed.cjs */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ⚠️ این را با companyId واقعی‌ات تنظیم کن
const COMPANY_ID = 1;

async function getOrCreateMaterial({ name, unit, unitPrice, category }) {
  const existing = await prisma.material.findFirst({
    where: { companyId: COMPANY_ID, name },
  });

  if (existing) {
    return prisma.material.update({
      where: { id: existing.id },
      data: {
        unit,
        unitPrice,
        category: category ?? existing.category,
        isActive: true,
      },
    });
  }

  return prisma.material.create({
    data: {
      companyId: COMPANY_ID,
      name,
      unit,
      unitPrice,
      category,
      isActive: true,
    },
  });
}

async function getOrCreateContainerModel({ title, description }) {
  const existing = await prisma.containerModel.findFirst({
    where: { companyId: COMPANY_ID, title },
  });

  if (existing) {
    return prisma.containerModel.update({
      where: { id: existing.id },
      data: { description: description ?? existing.description },
    });
  }

  return prisma.containerModel.create({
    data: { companyId: COMPANY_ID, title, description },
  });
}

async function main() {
  console.log("🌱 Seeding started...");

  // 1) Materials
  const materialsSeed = [
    { name: "تیرآهن", unit: "kg", unitPrice: "0", category: "اسکلت" },
    { name: "پروفیل", unit: "kg", unitPrice: "0", category: "اسکلت" },

    { name: "ورق بدنه23", unit: "m2", unitPrice: "0", category: "پوشش" },
    { name: "ورق سقف30", unit: "m2", unitPrice: "0", category: "پوشش" },

    { name: "تخته کف", unit: "m2", unitPrice: "0", category: "کف" },
    { name: "پلاستفوم", unit: "m2", unitPrice: "0", category: "عایق" },
    { name: "کفپوش", unit: "m2", unitPrice: "0", category: "کف" },
    { name: "پی وی سی", unit: "m2", unitPrice: "0", category: "داخلی" },

    { name: "لبه", unit: "m", unitPrice: "0", category: "پوشش" },

    { name: "آبروی پنجره", unit: "عدد", unitPrice: "0", category: "بازشو" },
    { name: "آبروی در", unit: "عدد", unitPrice: "0", category: "بازشو" },

    { name: "نبشی 2 ورق", unit: "m", unitPrice: "0", category: "اسکلت" },
    { name: "تسمه", unit: "m", unitPrice: "0", category: "اسکلت" },
    { name: "لچکی", unit: "عدد", unitPrice: "0", category: "اسکلت" },

    { name: "درب", unit: "عدد", unitPrice: "0", category: "بازشو" },
    { name: "پنجره", unit: "عدد", unitPrice: "0", category: "بازشو" },

    { name: "قلاب", unit: "عدد", unitPrice: "0", category: "متفرقه" },

    // هزینه‌های دستی (MANUAL)
    { name: "برق کشی", unit: "مبلغ", unitPrice: "0", category: "تاسیسات" },
    { name: "رنگ و الکترود", unit: "مبلغ", unitPrice: "0", category: "متغیر" },
    { name: "پیچ و چسب", unit: "مبلغ", unitPrice: "0", category: "متغیر" },
    { name: "اجرت", unit: "مبلغ", unitPrice: "0", category: "متغیر" },
  ];

  const materialMap = new Map();
  for (const m of materialsSeed) {
    const row = await getOrCreateMaterial(m);
    materialMap.set(m.name, row.id);
  }
  console.log(`✅ Materials upserted: ${materialMap.size}`);

  // 2) ContainerModel
  const model = await getOrCreateContainerModel({
    title: "مدل پایه کانکس نیکان",
    description: "BOM اولیه برای تست محاسبه قیمت (قابل ویرایش در پنل).",
  });
  console.log(`✅ ContainerModel ready: ${model.id} - ${model.title}`);

  // 3) BOM (با string enumها — Prisma قبول می‌کند)
  const bomDefs = [
    { name: "تیرآهن", calcType: "AREA", factor: "6.00", wastePercent: "1.00", isEditable: true },
    { name: "پروفیل", calcType: "AREA", factor: "12.00", wastePercent: "1.00", isEditable: true },

    // ورق بدنه: perimeter * height (فعلاً factor=2.40 یعنی ارتفاع پیش‌فرض)
    { name: "ورق بدنه23", calcType: "PERIMETER", factor: "2.40", wastePercent: "3.00", isEditable: false },
    { name: "ورق سقف30", calcType: "AREA", factor: "1.00", wastePercent: "2.00", isEditable: false },

    { name: "تخته کف", calcType: "AREA", factor: "1.00", wastePercent: "2.00", isEditable: false },
    { name: "پلاستفوم", calcType: "AREA", factor: "1.00", wastePercent: "2.00", isEditable: false },
    { name: "کفپوش", calcType: "AREA", factor: "1.00", wastePercent: "2.00", isEditable: false },
    { name: "پی وی سی", calcType: "AREA", factor: "1.00", wastePercent: "2.00", isEditable: false },

    { name: "لبه", calcType: "PERIMETER", factor: "1.00", wastePercent: "1.00", isEditable: false },

    { name: "درب", calcType: "COUNT", factor: "1", wastePercent: null, isEditable: true },
    { name: "پنجره", calcType: "COUNT", factor: "2", wastePercent: null, isEditable: true },
    { name: "آبروی پنجره", calcType: "COUNT", factor: "2", wastePercent: null, isEditable: true },
    { name: "آبروی در", calcType: "COUNT", factor: "1", wastePercent: null, isEditable: true },

    { name: "نبشی 2 ورق", calcType: "LENGTH", factor: "10.00", wastePercent: "2.00", isEditable: true },
    { name: "تسمه", calcType: "LENGTH", factor: "8.00", wastePercent: "2.00", isEditable: true },
    { name: "لچکی", calcType: "COUNT", factor: "8", wastePercent: null, isEditable: true },
    { name: "قلاب", calcType: "COUNT", factor: "4", wastePercent: null, isEditable: true },

    { name: "برق کشی", calcType: "MANUAL", factor: "0", wastePercent: null, isEditable: true },
    { name: "رنگ و الکترود", calcType: "MANUAL", factor: "0", wastePercent: null, isEditable: true },
    { name: "پیچ و چسب", calcType: "MANUAL", factor: "0", wastePercent: null, isEditable: true },
    { name: "اجرت", calcType: "MANUAL", factor: "0", wastePercent: null, isEditable: true },
  ];

  for (const b of bomDefs) {
    const materialId = materialMap.get(b.name);
    if (!materialId) {
      console.warn(`⚠️ Material not found for BOM: ${b.name}`);
      continue;
    }

    await prisma.containerBomItem.upsert({
      where: {
        containerModelId_materialId: {
          containerModelId: model.id,
          materialId,
        },
      },
      update: {
        calcType: b.calcType,
        factor: b.factor,
        wastePercent: b.wastePercent,
        isEditable: !!b.isEditable,
      },
      create: {
        containerModelId: model.id,
        materialId,
        calcType: b.calcType,
        factor: b.factor,
        wastePercent: b.wastePercent,
        isEditable: !!b.isEditable,
      },
    });
  }

  console.log(`✅ BOM items upserted for modelId=${model.id}`);
  console.log("🎉 Seed done.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
