import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";
import * as XLSX from "xlsx";

const STOCK_UNITS = ["PIECE", "KG", "M", "M2"] as const;
const PURCHASE_UNITS = ["PACK", "ROLL", "PIECE", "KG", "M", "M2"] as const;

function n(v: any): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : NaN;
}

function pad(num: number, size = 4) {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

// برای اینکه گیر نیم‌فاصله/ک/ی عربی و فاصله اضافی نکنیم
function normFa(s: any) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\u200c/g, "") // نیم‌فاصله
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ");
}

function isOneOf<T extends readonly string[]>(arr: T, v: any): v is T[number] {
  return arr.includes(String(v) as any);
}

export async function POST(req: NextRequest) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "فایل ارسال نشده" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheet = workbook.Sheets["products"];
  if (!sheet) {
    return NextResponse.json(
      { error: "Sheet با نام products پیدا نشد" },
      { status: 400 }
    );
  }

  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  // دسته‌ها را بکش و با کلید نرمال شده map کن
  const categories = await prisma.productCategory.findMany({
    where: { companyId },
    select: { id: true, title: true, code: true, nextSeq: true },
  });

  const catByTitle = new Map(categories.map((c) => [normFa(c.title), c]));

  const results: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // header ردیف 1

    try {
      const name = String(row.name || "").trim();
      const categoryKey = normFa(row.category);
      const stockUnitRaw = String(row.stockUnit || "").trim();
      const purchaseUnitRaw = String(row.purchaseUnit || "").trim();
      const packSizeNum = row.packSize != null && row.packSize !== "" ? n(row.packSize) : null;
      const minStockNum = row.minStock != null && row.minStock !== "" ? n(row.minStock) : 0;
      const description = row.description ? String(row.description).trim() : null;

      if (!name) throw new Error("name خالی است");
      if (!categoryKey) throw new Error("category خالی است");

      if (!isOneOf(STOCK_UNITS, stockUnitRaw)) {
        throw new Error("stockUnit نامعتبر است (PIECE/KG/M/M2)");
      }
      const stockUnit = stockUnitRaw as (typeof STOCK_UNITS)[number];

      let purchaseUnit: (typeof PURCHASE_UNITS)[number] | "" = "";
      if (purchaseUnitRaw) {
        if (!isOneOf(PURCHASE_UNITS, purchaseUnitRaw)) {
          throw new Error("purchaseUnit نامعتبر است");
        }
        purchaseUnit = purchaseUnitRaw as any;
      }

      const cat = catByTitle.get(categoryKey);
      if (!cat) {
        throw new Error("دسته‌بندی پیدا نشد (عنوان دسته در اکسل با دیتابیس یکی نیست)");
      }

      if (purchaseUnit) {
        if (packSizeNum == null || !Number.isFinite(packSizeNum) || packSizeNum <= 0) {
          throw new Error("packSize نامعتبر است (وقتی purchaseUnit دارید الزامی است)");
        }
      }

      const safeMinStock = Number.isFinite(minStockNum) && minStockNum >= 0 ? Math.floor(minStockNum) : 0;

      // ✅ تراکنش اتمیک: اول seq را افزایش بده، بعد sku بساز و محصول را ثبت کن
      const createdSku = await prisma.$transaction(async (tx) => {
        const updated = await tx.productCategory.update({
          where: { id: cat.id },
          data: { nextSeq: { increment: 1 } },
          select: { code: true, nextSeq: true },
        });

        const seq = updated.nextSeq - 1;
        const sku = `${updated.code}-${pad(seq, 4)}`;

        await tx.product.create({
          data: {
            companyId,
            categoryId: cat.id,
            sku,
            name,
            description,

            stockUnit: stockUnit as any,
            purchaseUnit: purchaseUnit ? (purchaseUnit as any) : null,
            packSize: purchaseUnit ? (packSizeNum as any) : null,

            minStock: safeMinStock,
          },
          select: { id: true },
        });

        return sku;
      });

      results.push({ row: rowNum, status: "ok", sku: createdSku });
    } catch (err: any) {
      results.push({
        row: rowNum,
        status: "error",
        error: err?.message || "خطا",
      });
    }
  }

  return NextResponse.json({
    total: rows.length,
    success: results.filter((r) => r.status === "ok").length,
    errors: results.filter((r) => r.status === "error"),
  });
}
