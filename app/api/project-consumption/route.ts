// app/api/project-consumption/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StockDirection } from "@prisma/client";

type ItemInput = {
  itemId: number;
  warehouseId: number;
  qty: number;
  note?: string | null;
};

type Body = {
  projectId: number;
  stageId?: number | null;
  items: ItemInput[];
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const body = (await req.json().catch(() => null)) as Body | null;

    if (!body) {
      return NextResponse.json(
        { error: "بدنه درخواست نامعتبر است." },
        { status: 400 },
      );
    }

    const { projectId, stageId, items } = body;

    if (!projectId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "پروژه و حداقل یک ردیف مصرف الزامی است." },
        { status: 400 },
      );
    }

    // فیلتر ردیف‌های معتبر
    const validItems = items.filter(
      (i) =>
        i.itemId &&
        i.warehouseId &&
        typeof i.qty === "number" &&
        i.qty > 0,
    );

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "هیچ ردیف معتبری (کالا، انبار، مقدار > 0) ارسال نشده است." },
        { status: 400 },
      );
    }

    const now = new Date();
    const companyId = user.companyId;

    const result = await prisma.$transaction(async (tx) => {
      // فقط چک می‌کنیم پروژه وجود دارد و برای همین شرکت است
      const project = await tx.project.findFirst({
        where: { id: projectId, companyId },
        select: { id: true },
      });

      if (!project) {
        throw new Error("PROJECT_NOT_FOUND");
      }

      const createdMoves = [];

      for (const row of validItems) {
        // 1) ثبت حرکت انبار (خروج / مصرف)
        const move = await tx.stockMove.create({
          data: {
            companyId,
            productId: row.itemId,
            warehouseId: row.warehouseId,
            qty: row.qty,
            direction: StockDirection.OUT,
            reference: `PROJECT-${projectId}`,
            projectId,
            stageId: stageId ?? null,
            date: now,
            createdAt: now,
          },
        });

        createdMoves.push(move);

        // 2) به‌روزرسانی موجودی
        const existing = await tx.stock.findFirst({
          where: {
            companyId,
            productId: row.itemId,
            warehouseId: row.warehouseId,
          },
        });

        if (!existing) {
          // اگر قبلاً موجودی نداشت، رکورد جدید با مقدار منفی می‌سازیم
          await tx.stock.create({
            data: {
              companyId,
              productId: row.itemId,
              warehouseId: row.warehouseId,
              quantity: 0 - row.qty,
            },
          });
        } else {
          await tx.stock.update({
            where: { id: existing.id },
            data: {
              quantity: {
                decrement: row.qty,
              },
            },
          });
        }
      }

      return createdMoves;
    });

    return NextResponse.json(
      {
        success: true,
        count: result.length,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Error in POST /api/project-consumption:", err);

    if (err instanceof Error && err.message === "PROJECT_NOT_FOUND") {
      return NextResponse.json(
        { error: "پروژه‌ای با این شناسه برای شرکت شما پیدا نشد." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "خطا در ثبت مصرف مواد" },
      { status: 500 },
    );
  }
}
