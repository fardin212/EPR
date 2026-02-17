const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COMPANY_ID = 1;

// ارتفاع پیش‌فرض (اگر سایز 3بعدی نباشد)
const DEFAULT_H = 2.40;

function parseSize(title) {
  // مثال‌ها:
  // "6*2.40"
  // "6*2.40*2"  -> این را به‌عنوان 2 یونیت کنار هم نگه می‌داریم (طول 6، عرض 2.40، height = 2.40، note=×2)
  // "1.50*1.50"
  const parts = title.split("*").map((x) => x.trim());
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  const c = parts[2] ? Number(parts[2]) : null;
  return { a, b, c };
}

async function upsertPreset({ title, length, width, height, sort }) {
  const existing = await prisma.containerSizePreset.findFirst({
    where: { companyId: COMPANY_ID, containerModelId: null, title },
    select: { id: true },
  });

  if (existing) {
    return prisma.containerSizePreset.update({
      where: { id: existing.id },
      data: { length, width, height, sort, isActive: true },
    });
  }

  return prisma.containerSizePreset.create({
    data: {
      companyId: COMPANY_ID,
      containerModelId: null,
      title,
      length,
      width,
      height,
      sort,
      isActive: true,
    },
  });
}

async function main() {
  console.log("🔰 Seed سایزهای محبوب کانکس...");

  const titles = [
    "6*2.40",
    "6*2.40*2",
    "6*3",
    "4*3",
    "6*4",
    "12*3",
    "12*2.40",
    "4*2.40",
    "3*2",
    "2*2",
    "1*1",
    "1.50*1.50",
    "4*2",
    "3*3",
    "7*4",
  ];

  let i = 1;

  for (const t of titles) {
    const { a, b, c } = parseSize(t);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      console.log("⛔️ سایز نامعتبر:", t);
      continue;
    }

    // اگر *2 داشت، ما طول/عرض را همان نگه می‌داریم و height را پیش‌فرض می‌گیریم
    // بعداً در UI می‌تونیم یک فیلد "unitCount" هم اضافه کنیم اگر خواستی.
    const height = DEFAULT_H;

    await upsertPreset({
      title: t,
      length: a,
      width: b,
      height,
      sort: i++,
    });
  }

  const count = await prisma.containerSizePreset.count({
    where: { companyId: COMPANY_ID, containerModelId: null },
  });

  console.log(`✅ Done. presets=${count} (companyId=${COMPANY_ID})`);
}

main()
  .catch((e) => {
    console.error("❌ seed-sizes failed:", e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
