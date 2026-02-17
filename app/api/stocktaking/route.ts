// app/api/stocktaking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/stocktaking  → لیست جلسه‌ها
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const sessions = await prisma.stockTakingSession.findMany({
      where: { companyId: user.companyId },
      orderBy: { date: "desc" },
      include: {
        _count: { select: { items: true } },
      } as any,
    });

    return NextResponse.json(sessions);
  } catch (err) {
    console.error("GET /api/stocktaking error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت لیست جلسات انبارگردانی" },
      { status: 500 },
    );
  }
}

// POST /api/stocktaking  → شروع جلسه جدید + پر کردن آیتم‌ها از موجودی فعلی
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | {
          title?: string;
          note?: string;
          date?: string;
        }
      | null;

    if (!body || !body.title) {
      return NextResponse.json(
        { error: "عنوان جلسه الزامی است." },
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

    const result = await prisma.$transaction(async (tx) => {
      // 1) ساخت جلسه
      const session = await tx.stockTakingSession.create({
        data: {
          companyId: user.companyId,
          title: body.title,
          note: body.note ?? null,
          date,
          status: "OPEN",
        },
      });

      // 2) خواندن موجودی فعلی
      const stocks = await tx.stock.findMany({
        where: { companyId: user.companyId },
        include: {
          product: true,
          warehouse: true,
        },
      });

      if (stocks.length > 0) {
        const itemsData = stocks.map((s) => ({
          sessionId: session.id,
          productId: s.productId,
          warehouseId: s.warehouseId,
          systemQty: Number(s.quantity),
          countedQty: Number(s.quantity),
          diffQty: 0,
          note: null as string | null,
        }));

        await tx.stockTakingItem.createMany({ data: itemsData });
      }

      return session;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/stocktaking error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد جلسه انبارگردانی" },
      { status: 500 },
    );
  }
}
