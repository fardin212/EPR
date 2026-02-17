// app/api/inventory/move/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StockDirection } from "@prisma/client";

type MoveDirection = "IN" | "OUT";

type MoveLineInput = {
  warehouseId: number;
  productId: number;
  qty: number;
  note?: string;
};

type MoveRequestBody = {
  direction: MoveDirection; // ورود به انبار یا خروج از انبار
  date?: string; // ISO date string (مثلاً 2025-12-10)
  reference?: string; // شماره فاکتور / حواله
  description?: string; // توضیح کلی سند
  projectId?: number | null;
  stageId?: number | null;
  lines: MoveLineInput[];
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as MoveRequestBody | null;

    if (!body) {
      return NextResponse.json(
        { error: "بدنه درخواست نامعتبر است." },
        { status: 400 },
      );
    }

    if (!body.direction || !["IN", "OUT"].includes(body.direction)) {
      return NextResponse.json(
        { error: "نوع عملیات (ورود/خروج) مشخص نشده است." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.lines) || body.lines.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک ردیف کالا باید وارد شود." },
        { status: 400 },
      );
    }

    const date = body.date ? new Date(body.date) : new Date();
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "تاریخ وارد شده نامعتبر است." },
        { status: 400 },
      );
    }

    // اعتبارسنجی ساده ردیف‌ها
    const validLines = body.lines
      .map((l, index) => ({
        index,
        warehouseId: Number(l.warehouseId),
        productId: Number(l.productId),
        qty: Number(l.qty),
        note: l.note?.toString().trim() || null,
      }))
      .filter((l) => !Number.isNaN(l.productId) && !Number.isNaN(l.warehouseId));

    if (validLines.length === 0) {
      return NextResponse.json(
        { error: "هیچ ردیف کالای معتبری وارد نشده است." },
        { status: 400 },
      );
    }

    // اجرای همه ردیف‌ها در یک تراکنش
    const result = await prisma.$transaction(async (tx) => {
      const createdMoves = [];

      for (const line of validLines) {
        if (line.qty <= 0) {
          continue;
        }

        // ۱) ثبت حرکت انبار
        const move = await tx.stockMove.create({
          data: {
            companyId: user.companyId,
            productId: line.productId,
            warehouseId: line.warehouseId,
            qty: line.qty,
            direction: body.direction as StockDirection,
            reference: body.reference ?? null,
            projectId: body.projectId ?? null,
            stageId: body.stageId ?? null,
            date,
            createdAt: new Date(),
          },
        });

        createdMoves.push(move);

        // ۲) به‌روزرسانی موجودی فعلی در جدول Stock
        const existingStock = await tx.stock.findFirst({
          where: {
            companyId: user.companyId,
            productId: line.productId,
            warehouseId: line.warehouseId,
          },
        });

        const delta =
          body.direction === "IN" ? Number(line.qty) : -Number(line.qty);

        if (existingStock) {
          await tx.stock.update({
            where: { id: existingStock.id },
            data: {
              quantity: existingStock.quantity + delta,
              updatedAt: new Date(),
            },
          });
        } else {
          // اگر برای این کالا/انبار تا حالا رکوردی نبوده
          await tx.stock.create({
            data: {
              companyId: user.companyId,
              productId: line.productId,
              warehouseId: line.warehouseId,
              quantity: delta,
            },
          });
        }
      }

      return createdMoves;
    });

    return NextResponse.json(
      {
        ok: true,
        count: result.length,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/inventory/move error:", err);
    return NextResponse.json(
      { error: "خطا در ثبت حرکت انبار." },
      { status: 500 },
    );
  }
}
