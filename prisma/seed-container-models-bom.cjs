const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COMPANY_ID = 1;

// کمک: گرفتن materialId بر اساس نام فارسی (همون‌هایی که seed کردی)
async function getMaterialIdByName(name) {
  const m = await prisma.material.findFirst({
    where: { companyId: COMPANY_ID, name },
    select: { id: true, name: true },
  });
  if (!m) throw new Error(`Material not found: ${name}`);
  return m.id;
}

// upsert مدل کانکس (title یکتا در هر شرکت)
async function upsertContainerModel({ title, description }) {
  const existing = await prisma.containerModel.findFirst({
    where: { companyId: COMPANY_ID, title },
    select: { id: true },
  });

  if (existing) {
    await prisma.containerModel.update({
      where: { id: existing.id },
      data: { description: description || null },
    });
    return existing.id;
  }

  const created = await prisma.containerModel.create({
    data: { companyId: COMPANY_ID, title, description: description || null },
    select: { id: true },
  });

  return created.id;
}

// اگر BOM قبلاً ساخته شده باشد، دوباره نساز
async function ensureBomItems(containerModelId, items) {
  const count = await prisma.containerBomItem.count({
    where: { companyId: COMPANY_ID, containerModelId },
  });

  if (count > 0) {
    console.log(
      `ℹ BOM exists: containerModelId=${containerModelId} items=${count}`
    );
    return;
  }

  await prisma.containerBomItem.createMany({
    data: items.map((x) => ({
      ...x,
      companyId: COMPANY_ID,      // ✅ این اضافه شد
      containerModelId,
    })),
  });

  console.log(
    `✅ BOM created: containerModelId=${containerModelId} items=${items.length}`
  );
}

async function main() {
  console.log("🔰 Seed مدل‌های کانکس + BOM پایه...");

  // --- مواد مورد نیاز برای BOM پایه ---
  const MAT = {
    sheetWall: await getMaterialIdByName("ورق بدنه23"),
    sheetRoof: await getMaterialIdByName("ورق سقف30"),
    floorBoard: await getMaterialIdByName("تخته کف"),
    insulation: await getMaterialIdByName("پلاستفوم"),
    flooring: await getMaterialIdByName("کفپوش"),
    pvc: await getMaterialIdByName("پی وی سی"),
    door: await getMaterialIdByName("درب"),
    window: await getMaterialIdByName("پنجره"),
  };

  // ─────────────────────────────────────────
  // Model 1: کانکس کارگاهی
  // ─────────────────────────────────────────
  const workshopId = await upsertContainerModel({
    title: "کانکس کارگاهی",
    description: "مدل پایه کارگاهی (BOM اولیه برای محاسبه سریع)",
  });

  await ensureBomItems(workshopId, [
    // دیواره‌ها: محیط × ارتفاع  => PERIMETER (در کد محاسبه قدیمی شما factor=height می‌شد)
    { materialId: MAT.sheetWall, calcType: "PERIMETER", factor: 1, wastePercent: 5, minQty: 0 },
    // سقف: طول×عرض
    { materialId: MAT.sheetRoof, calcType: "AREA", factor: 1, wastePercent: 5, minQty: 0 },
    // کف: طول×عرض
    { materialId: MAT.floorBoard, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    // عایق: طول×عرض
    { materialId: MAT.insulation, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    // کفپوش
    { materialId: MAT.flooring, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    // PVC داخل
    { materialId: MAT.pvc, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    // درب/پنجره
    { materialId: MAT.door, calcType: "COUNT", factor: 1, wastePercent: 0, minQty: 1 },
    { materialId: MAT.window, calcType: "COUNT", factor: 1, wastePercent: 0, minQty: 0 },
  ]);

  // ─────────────────────────────────────────
  // Model 2: کانکس نگهبانی
  // ─────────────────────────────────────────
  const guardId = await upsertContainerModel({
    title: "کانکس نگهبانی",
    description: "مدل پایه نگهبانی (BOM اولیه)",
  });

  await ensureBomItems(guardId, [
    { materialId: MAT.sheetWall, calcType: "PERIMETER", factor: 1, wastePercent: 5, minQty: 0 },
    { materialId: MAT.sheetRoof, calcType: "AREA", factor: 1, wastePercent: 5, minQty: 0 },
    { materialId: MAT.floorBoard, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    { materialId: MAT.insulation, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    { materialId: MAT.flooring, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    { materialId: MAT.pvc, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    { materialId: MAT.door, calcType: "COUNT", factor: 1, wastePercent: 0, minQty: 1 },
    // نگهبانی معمولاً پنجره بیشتر می‌خواد
    { materialId: MAT.window, calcType: "COUNT", factor: 2, wastePercent: 0, minQty: 1 },
  ]);

  // ─────────────────────────────────────────
  // Model 3: کانکس ویلایی (پایه)
  // ─────────────────────────────────────────
  const villaId = await upsertContainerModel({
    title: "کانکس ویلایی",
    description: "مدل پایه ویلایی (BOM اولیه؛ پنجره بیشتر)",
  });

  await ensureBomItems(villaId, [
    { materialId: MAT.sheetWall, calcType: "PERIMETER", factor: 1, wastePercent: 6, minQty: 0 },
    { materialId: MAT.sheetRoof, calcType: "AREA", factor: 1, wastePercent: 6, minQty: 0 },
    { materialId: MAT.floorBoard, calcType: "AREA", factor: 1, wastePercent: 4, minQty: 0 },
    { materialId: MAT.insulation, calcType: "AREA", factor: 1, wastePercent: 4, minQty: 0 },
    { materialId: MAT.flooring, calcType: "AREA", factor: 1, wastePercent: 4, minQty: 0 },
    { materialId: MAT.pvc, calcType: "AREA", factor: 1, wastePercent: 4, minQty: 0 },
    { materialId: MAT.door, calcType: "COUNT", factor: 1, wastePercent: 0, minQty: 1 },
    { materialId: MAT.window, calcType: "COUNT", factor: 3, wastePercent: 0, minQty: 1 },
  ]);

  // ─────────────────────────────────────────
  // Model 4: سرویس بهداشتی
  // ─────────────────────────────────────────
  const wcId = await upsertContainerModel({
    title: "کانکس سرویس بهداشتی",
    description: "مدل پایه سرویس (BOM اولیه)",
  });

  await ensureBomItems(wcId, [
    { materialId: MAT.sheetWall, calcType: "PERIMETER", factor: 1, wastePercent: 5, minQty: 0 },
    { materialId: MAT.sheetRoof, calcType: "AREA", factor: 1, wastePercent: 5, minQty: 0 },
    { materialId: MAT.floorBoard, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    { materialId: MAT.insulation, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    { materialId: MAT.pvc, calcType: "AREA", factor: 1, wastePercent: 3, minQty: 0 },
    { materialId: MAT.door, calcType: "COUNT", factor: 1, wastePercent: 0, minQty: 1 },
    { materialId: MAT.window, calcType: "COUNT", factor: 1, wastePercent: 0, minQty: 0 },
  ]);

  const modelCount = await prisma.containerModel.count({ where: { companyId: COMPANY_ID } });
  const bomCount = await prisma.containerBomItem.count();
  console.log(`🎉 Done. models=${modelCount} bomItems(total)=${bomCount}`);
}

main()
  .catch((e) => {
    console.error("❌ seed failed:", e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
