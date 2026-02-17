const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const COMPANY_ID = 1;

// ✅ اینو مطابق فایل خودت انتخاب کن
const INPUT_FILE = path.resolve(__dirname, "../کل (version 1).xlsb"); 
// اگر xlsx داری همینجا مسیرش رو بده

// ✅ این مدل کانکس برای تمام شیت‌ها
const MODEL_TITLE = "کانکس کارگاهی";

// ابزار
const num = (v) => {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/,/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// --- پارس سایز از نام شیت ---
// مثال شیت‌ها: 6.240.2  | 12.2.4 | 4.240 | 3.2 | 2.2 | 1.1 | 1.5..1.5 | service
function parseSizeFromSheetName(name) {
  if (!name) return null;

  let s = String(name).trim();

  // نویزها
  s = s.replace(/[-_ ]+/g, "");
  s = s.replace(/×/g, "x");
  s = s.replace(/\.\.+/g, "x"); // 1.5..1.5 => 1.5x1.5
  s = s.replace(/x+/g, "x");

  // حالت‌هایی مثل service / اصل
  if (!/[0-9]/.test(s)) return null;

  // اگر x دارد، خیلی راحت
  if (s.includes("x")) {
    const parts = s.split("x").filter(Boolean);
    if (parts.length < 2) return null;
    const length = Number(parts[0]);
    const width = Number(parts[1]);
    if (!Number.isFinite(length) || !Number.isFinite(width)) return null;
    return { title: String(name).trim(), length, width, height: 2.4 };
  }

  // حالت 12.2.4 => 12 × 2.4
  const m324 = s.match(/^(\d+)\.(\d)\.(\d)$/);
  if (m324) {
    const length = Number(m324[1]);
    const width = Number(`${m324[2]}.${m324[3]}`);
    return { title: String(name).trim(), length, width, height: 2.4 };
  }

  // حالت 6.240 => 6 × 2.40
  // حالت 6.3   => 6 × 3
  const m = s.match(/^(\d+)\.(\d+)$/);
  if (m) {
    const length = Number(m[1]);
    const raw = m[2]; // "240" یا "3"
    let width = Number(raw);

    // اگر سه رقم یا بیشتر بود (240 => 2.40)
    if (raw.length >= 3) width = Number(raw) / 100;

    if (!Number.isFinite(length) || !Number.isFinite(width)) return null;
    return { title: String(name).trim(), length, width, height: 2.4 };
  }

  return null;
}

async function upsertContainerModel() {
  const exists = await prisma.containerModel.findFirst({
    where: { companyId: COMPANY_ID, title: MODEL_TITLE },
    select: { id: true },
  });
  if (exists) return exists.id;

  const created = await prisma.containerModel.create({
    data: { companyId: COMPANY_ID, title: MODEL_TITLE },
    select: { id: true },
  });
  return created.id;
}

async function upsertSizePreset(containerModelId, size) {
  const exists = await prisma.containerSizePreset.findFirst({
    where: {
      companyId: COMPANY_ID,
      containerModelId,
      title: size.title,
    },
    select: { id: true },
  });
  if (exists) return exists.id;

  const created = await prisma.containerSizePreset.create({
    data: {
      companyId: COMPANY_ID,
      containerModelId,
      title: size.title,
      length: size.length,
      width: size.width,
      height: size.height,
      isActive: true,
      sort: 0,
    },
    select: { id: true },
  });

  return created.id;
}

async function upsertMaterialByName(name, unitPrice, qtyUnit) {
  const unit =
    qtyUnit === "KG" ? "kg" :
    qtyUnit === "BRANCH" ? "شاخه" :
    qtyUnit === "M2" ? "m2" :
    qtyUnit === "M" ? "m" :
    qtyUnit === "LUMP_SUM" ? "مبلغ" :
    "عدد";

  // priceBasis پیشنهادی (اگر اسکیما داری)
  const priceBasis =
    qtyUnit === "KG" ? "PER_KG" :
    qtyUnit === "BRANCH" ? "PER_BRANCH" :
    qtyUnit === "M2" ? "PER_M2" :
    qtyUnit === "M" ? "PER_M" :
    qtyUnit === "LUMP_SUM" ? "LUMP_SUM" :
    "PER_PIECE";

  const prev = await prisma.material.findFirst({
    where: { companyId: COMPANY_ID, name },
    select: { id: true, unitPrice: true },
  });

  if (!prev) {
    const created = await prisma.material.create({
      data: {
        companyId: COMPANY_ID,
        name,
        unit,
        unitPrice: unitPrice,
        category: "Imported",
        // اگر فیلد priceBasis داری:
        priceBasis,
      },
      select: { id: true },
    });
    return created.id;
  }

  // آپدیت قیمت روز
  await prisma.material.update({
    where: { id: prev.id },
    data: { unitPrice: unitPrice, unit },
  });

  return prev.id;
}

async function upsertBomItem({ containerModelId, sizePresetId, materialId, fixedQty, qtyUnit }) {
  // اگر unique داری:
  const existing = await prisma.containerBomItem.findFirst({
    where: {
      companyId: COMPANY_ID,
      containerModelId,
      sizePresetId,
      materialId,
    },
    select: { id: true },
  });

  if (!existing) {
    await prisma.containerBomItem.create({
      data: {
        companyId: COMPANY_ID,
        containerModelId,
        sizePresetId,
        materialId,
        calcType: "MANUAL",
        fixedQty,
        qtyUnit,
      },
    });
    return;
  }

  await prisma.containerBomItem.update({
    where: { id: existing.id },
    data: {
      calcType: "MANUAL",
      fixedQty,
      qtyUnit,
    },
  });
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`File not found: ${INPUT_FILE}`);
  }

  console.log("🔰 Import BOM از شیت‌های اکسل...");
  const containerModelId = await upsertContainerModel();

  const wb = XLSX.readFile(INPUT_FILE, { cellDates: true });
  const sheetNames = wb.SheetNames || [];
  console.log("📄 sheets:", sheetNames.join(" | "));

  let totalBom = 0;

  for (const sName of sheetNames) {
    const size = parseSizeFromSheetName(sName);
    if (!size) {
      console.log(`⏭ skip sheet (no size): ${sName}`);
      continue;
    }

    const ws = wb.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    if (!rows || rows.length === 0) {
      console.log(`⏭ empty sheet: ${sName}`);
      continue;
    }

    const sizePresetId = await upsertSizePreset(containerModelId, size);

    for (const r of rows) {
      // ستون‌های شما:
      // قیمت کل | قیمت | وزن | تعداد | نوع جنس | ردیف
      const materialName = String(r["نوع جنس"] || "").trim();
      if (!materialName) continue;

      const count = num(r["تعداد"]);
      const weight = num(r["وزن"]);
      const unitPrice = num(r["قیمت"]);

      // تشخیص اینکه qty از وزن باشد یا تعداد
      const qtyUnit = weight > 0 ? "KG" : "PIECE";
      const fixedQty = weight > 0 ? weight : count;

      if (fixedQty <= 0) continue;

      const materialId = await upsertMaterialByName(materialName, unitPrice, qtyUnit);

      await upsertBomItem({
        containerModelId,
        sizePresetId,
        materialId,
        fixedQty,
        qtyUnit,
      });

      totalBom++;
    }

    console.log(`✅ imported sheet: ${sName}`);
  }

  console.log(`🎉 Done. BOM items upserted = ${totalBom}`);
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
