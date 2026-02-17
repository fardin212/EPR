// app/api/stocktaking/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: { id: string };
};

// GET /api/stocktaking/:id → جلسه + آیتم‌ها
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه جلسه نامعتبر است." },
        { status: 400 },
      );
    }

    const session = await prisma.stockTakingSession.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        items: {
          include: {
            product: true,
            warehouse: true,
          },
          orderBy: [
            { warehouseId: "asc" },
            { productId: "asc" },
          ],
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "جلسه انبارگردانی پیدا نشد." },
        { status: 404 },
      );
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error("GET /api/stocktaking/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات جلسه انبارگردانی" },
      { status: 500 },
    );
  }
}

// PATCH /api/stocktaking/:id → ثبت شمارش، به‌روزرسانی diff و تغییر وضعیت
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه جلسه نامعتبر است." },
        { status: 400 },
      );
    }

    const body = (await req.json().catch(() => null)) as
      | {
          items?: { id: number; countedQty: number; note?: string }[];
          status?: string; // OPEN یا CLOSED
          title?: string;
          note?: string;
        }
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "بدنه درخواست نامعتبر است." },
        { status: 400 },
      );
    }

    // اول مطمئن شو جلسه متعلق به همین شرکت است
    const session = await prisma.stockTakingSession.findFirst({
      where: { id, companyId: user.companyId },
      include: { items: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: "جلسه انبارگردانی پیدا نشد." },
        { status: 404 },
      );
    }

    const updates: Promise<any>[] = [];

    // به‌روزرسانی آیتم‌ها
    if (Array.isArray(body.items) && body.items.length > 0) {
      for (const item of body.items) {
        const row = session.items.find((it) => it.id === item.id);
        if (!row) continue;

        const counted = Number(item.countedQty);
        if (Number.isNaN(counted)) continue;

        const diff = counted - Number(row.systemQty);

        updates.push(
          prisma.stockTakingItem.update({
            where: { id: row.id },
            data: {
              countedQty: counted,
              diffQty: diff,
              note: item.note ?? row.note,
            },
          }),
        );
      }
    }

    // به‌روزرسانی خود جلسه (title/note/status)
    const patchSession: any = {};
    if (typeof body.title === "string" && body.title.trim().length > 0) {
      patchSession.title = body.title.trim();
    }
    if (typeof body.note === "string") {
      patchSession.note = body.note;
    }
    if (body.status === "OPEN" || body.status === "CLOSED") {
      patchSession.status = body.status;
    }

    if (Object.keys(patchSession).length > 0) {
      updates.push(
        prisma.stockTakingSession.update({
          where: { id: session.id },
          data: patchSession,
        }),
      );
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/stocktaking/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در ثبت شمارش انبارگردانی" },
      { status: 500 },
    );
  }
}
