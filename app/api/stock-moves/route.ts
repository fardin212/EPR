// app/api/stock-moves/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StockDirection } from "@prisma/client";

// GET: برای mode=availability → برگرداندن موجودی فعلی
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    if (mode === "availability") {
      const productIdParam = searchParams.get("productId");
      if (!productIdParam) {
        return NextResponse.json(
          { error: "productId الزامی است." },
          { status: 400 },
        );
      }

      const productId = Number(productIdParam);
      if (Number.isNaN(productId)) {
        return NextResponse.json(
          { error: "productId نامعتبر است." },
          { status: 400 },
        );
      }

      const warehouseIdParam = searchParams.get("warehouseId");
      const warehouseId = warehouseIdParam
        ? Number(warehouseIdParam)
        : undefined;

      const totalRows = await prisma.stock.findMany({
        where: { companyId: user.companyId, productId },
      });

      const totalQuantity = totalRows.reduce(
        (sum, s) => sum + Number(s.quantity),
        0,
      );

      let inWarehouse: number | null = null;
      if (warehouseId && !Number.isNaN(warehouseId)) {
        const row = await prisma.stock.findFirst({
          where: {
            companyId: user.companyId,
            productId,
            warehouseId,
          },
        });
        inWarehouse = row ? Number(row.quantity) : 0;
      }

      return NextResponse.json({ totalQuantity, inWarehouse });
    }

    return NextResponse.json([]);
  } catch (err) {
    console.error("GET /api/stock-moves error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات موجودی" },
      { status: 500 },
    );
  }
}

// POST: ثبت حرکت انبار (ورود/خروج) برای یک یا چند کالا
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | {
          // حالت تک‌کالا (سازگاری با قبل)
          productId?: number;
          warehouseId?: number;
          projectId?: number;
          direction?: StockDirection | "IN" | "OUT";
          qty?: number;
          date?: string;
          reference?: string;
          note?: string;

          // حالت چندکالا
          items?: { productId: number; qty: number }[];
        }
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "بدنه درخواست نامعتبر است." },
        { status: 400 },
      );
    }

    const direction =
      body.direction === "OUT"
        ? "OUT"
        : body.direction === "IN"
          ? "IN"
          : null;

    const warehouseId = Number(body.warehouseId);
    const projectId = body.projectId ? Number(body.projectId) : undefined;

    if (!direction) {
      return NextResponse.json(
        { error: "جهت حرکت (ورود/خروج) نامشخص است." },
        { status: 400 },
      );
    }
    if (!warehouseId || Number.isNaN(warehouseId)) {
      return NextResponse.json(
        { error: "انتخاب انبار الزامی است." },
        { status: 400 },
      );
    }

    const moveDate = body.date ? new Date(body.date) : new Date();
    if (Number.isNaN(moveDate.getTime())) {
      return NextResponse.json(
        { error: "تاریخ وارد شده نامعتبر است." },
        { status: 400 },
      );
    }

    // ---- آماده‌سازی لیست کالاها ----
    let items: { productId: number; qty: number }[] = [];

    if (Array.isArray(body.items) && body.items.length > 0) {
      items = body.items
        .map((it) => ({
          productId: Number(it.productId),
          qty: Number(it.qty),
        }))
        .filter((it) => it.productId && it.qty && it.qty > 0);
    } else if (body.productId && body.qty) {
      // سازگاری با نسخه قبلی: یک کالا
      items = [
        {
          productId: Number(body.productId),
          qty: Number(body.qty),
        },
      ];
    }

    if (!items.length) {
      return NextResponse.json(
        { error: "حداقل یک ردیف کالا با مقدار معتبر لازم است." },
        { status: 400 },
      );
    }

    // بررسی کالاها و انبار
    const [warehouse, products] = await Promise.all([
      prisma.warehouse.findFirst({
        where: { id: warehouseId, companyId: user.companyId },
      }),
      prisma.product.findMany({
        where: {
          companyId: user.companyId,
          id: { in: items.map((i) => i.productId) },
        },
      }),
    ]);

    if (!warehouse) {
      return NextResponse.json(
        { error: "انبار یافت نشد یا متعلق به این شرکت نیست." },
        { status: 400 },
      );
    }

    const productIdsFound = new Set(products.map((p) => p.id));
    const missing = items
      .map((i) => i.productId)
      .filter((id) => !productIdsFound.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "برخی از کالاها یافت نشدند یا متعلق به این شرکت نیستند." },
        { status: 400 },
      );
    }

    // تراکنش: برای هر کالا، موجودی را چک و به‌روز کن و حرکت ثبت کن
    const result = await prisma.$transaction(async (tx) => {
      const moves: any[] = [];

      for (const item of items) {
        const { productId, qty } = item;

        let stockRow = await tx.stock.findFirst({
          where: {
            companyId: user.companyId,
            productId,
            warehouseId,
          },
        });

        let currentQty = stockRow ? Number(stockRow.quantity) : 0;

        if (direction === "OUT" && qty > currentQty) {
          throw new Error(
            `INSUFFICIENT_STOCK:${productId}:${currentQty}`,
          );
        }

        if (direction === "IN") {
          if (stockRow) {
            stockRow = await tx.stock.update({
              where: { id: stockRow.id },
              data: { quantity: currentQty + qty },
            });
          } else {
            stockRow = await tx.stock.create({
              data: {
                companyId: user.companyId,
                productId,
                warehouseId,
                quantity: qty,
              },
            });
          }
          currentQty = Number(stockRow.quantity);
        } else {
          // OUT
          if (!stockRow) {
            throw new Error(`INSUFFICIENT_STOCK:${productId}:0`);
          }
          stockRow = await tx.stock.update({
            where: { id: stockRow.id },
            data: { quantity: currentQty - qty },
          });
          currentQty = Number(stockRow.quantity);
        }

        const move = await tx.stockMove.create({
          data: {
            companyId: user.companyId,
            productId,
            warehouseId,
            projectId: projectId ?? null,
            qty,
            direction: direction as StockDirection,
            reference: body.reference ?? null,
            note: body.note ?? null,
            date: moveDate,
          },
        });

        moves.push({
          move,
          productId,
          newQty: currentQty,
        });
      }

      return moves;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/stock-moves error:", err);

    if (
      typeof err.message === "string" &&
      err.message.startsWith("INSUFFICIENT_STOCK:")
    ) {
      const parts = err.message.split(":"); // [code, productId, available]
      const available = Number(parts[2] || "0");
      return NextResponse.json(
        {
          error: `موجودی کافی در انبار برای یکی از کالاها وجود ندارد. موجودی فعلی: ${available}`,
          available,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "خطا در ثبت حرکت انبار" },
      { status: 500 },
    );
  }
}
