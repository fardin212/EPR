// app/api/inventory/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

// اگر UnitType در Prisma enum است، اینها باید دقیقاً مطابق enum باشند
const STOCK_UNITS = ["PIECE", "KG", "M", "M2"] as const;
const PURCHASE_UNITS = ["PACK", "ROLL", "PIECE", "KG", "M", "M2"] as const;

type StockUnit = (typeof STOCK_UNITS)[number];
type PurchaseUnit = (typeof PURCHASE_UNITS)[number];

function pad(num: number, size = 4) {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

function cleanSku(v: any) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
}

function isOneOf<T extends readonly string[]>(arr: T, v: any): v is T[number] {
  return arr.includes(String(v) as any);
}

function n(v: any): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : NaN;
}

// GET → لیست کالاها
export async function GET() {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const items = await prisma.product.findMany({
    where: { companyId },
    include: { category: true },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(items);
}

// POST → ایجاد کالای جدید (SKU اتومات بر اساس دسته)
export async function POST(req: NextRequest) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  try {
    const body = await req.json();

    const name = String(body?.name || "").trim();
    const description = body?.description ? String(body.description).trim() : null;

    const categoryId = Number(body?.categoryId);

    const stockUnitRaw = body?.stockUnit;
    const purchaseUnitRaw = body?.purchaseUnit;

    const minStockNum = n(body?.minStock);
    const packSizeNum = body?.packSize == null || body?.packSize === ""
      ? null
      : n(body?.packSize);

    const manualSkuRaw = body?.sku ? cleanSku(body.sku) : "";

    // ✅ validations
    if (!name) {
      return NextResponse.json({ error: "نام کالا الزامی است" }, { status: 400 });
    }
    if (!categoryId || !Number.isFinite(categoryId)) {
      return NextResponse.json({ error: "دسته‌بندی الزامی است" }, { status: 400 });
    }
    if (!isOneOf(STOCK_UNITS, stockUnitRaw)) {
      return NextResponse.json(
        { error: "واحد مصرف/انبار (stockUnit) نامعتبر است" },
        { status: 400 }
      );
    }

    const stockUnit = stockUnitRaw as StockUnit;

    let purchaseUnit: PurchaseUnit | null = null;
    if (purchaseUnitRaw != null && purchaseUnitRaw !== "") {
      if (!isOneOf(PURCHASE_UNITS, purchaseUnitRaw)) {
        return NextResponse.json(
          { error: "واحد خرید (purchaseUnit) نامعتبر است" },
          { status: 400 }
        );
      }
      purchaseUnit = purchaseUnitRaw as PurchaseUnit;
    }

    if (!Number.isFinite(minStockNum) || minStockNum < 0) {
      return NextResponse.json({ error: "حداقل موجودی (minStock) نامعتبر است" }, { status: 400 });
    }

    if (purchaseUnit && (packSizeNum == null || !Number.isFinite(packSizeNum) || packSizeNum <= 0)) {
      return NextResponse.json(
        { error: "وقتی واحد خرید دارید، ضریب تبدیل (packSize) باید بزرگ‌تر از صفر باشد" },
        { status: 400 }
      );
    }

    if (!purchaseUnit && packSizeNum != null) {
      return NextResponse.json(
        { error: "اگر ضریب تبدیل (packSize) وارد می‌کنید باید واحد خرید (purchaseUnit) هم مشخص باشد" },
        { status: 400 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const cat = await tx.productCategory.findFirst({
        where: { id: categoryId, companyId },
        select: { id: true, code: true, nextSeq: true },
      });

      if (!cat) throw new Error("دسته‌بندی معتبر نیست یا به شرکت شما تعلق ندارد");

      // اگر دستی SKU داده
      if (manualSkuRaw) {
        return tx.product.create({
          data: {
            companyId,
            categoryId: cat.id,
            sku: manualSkuRaw,
            name,
            description,
            stockUnit: stockUnit as any,
            purchaseUnit: purchaseUnit as any,
            packSize: packSizeNum as any,
            minStock: minStockNum as any,
          },
          include: { category: true },
        });
      }

      // SKU اتومات
      let seq = cat.nextSeq;
      for (let attempt = 0; attempt < 8; attempt++) {
        const sku = `${cat.code}-${pad(seq, 4)}`;

        try {
          const p = await tx.product.create({
            data: {
              companyId,
              categoryId: cat.id,
              sku,
              name,
              description,
              stockUnit: stockUnit as any,
              purchaseUnit: purchaseUnit as any,
              packSize: packSizeNum as any,
              minStock: minStockNum as any,
            },
            include: { category: true },
          });

          await tx.productCategory.update({
            where: { id: cat.id },
            data: { nextSeq: seq + 1 },
          });

          return p;
        } catch {
          seq++;
        }
      }

      throw new Error("خطا در تولید کد کالا؛ دوباره تلاش کنید.");
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    const msg = err?.message || "خطای سرور";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
