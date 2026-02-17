// app/api/project-stages/[id]/checklist/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

/* ===================== Utils ===================== */

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است`);
  }
  return n;
}

type QCStatus = "PENDING" | "PASSED" | "FAILED";

function isValidStatus(s: any): s is QCStatus {
  return s === "PENDING" || s === "PASSED" || s === "FAILED";
}

/* ===================== GET ===================== */

export async function GET(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await getParams(ctx);
    const stageId = mustInt(id, "شناسه مرحله");

    const me = await getMeServer();
    if (!me) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const items = await prisma.projectStageChecklistItem.findMany({
      where: {
        stageId,
        stage: {
          project: {
            companyId: me.companyId,
            deletedAt: null,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "خطا در دریافت QC" },
      { status: 400 }
    );
  }
}

/* ===================== PATCH ===================== */

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await getParams(ctx);
    const stageId = mustInt(id, "شناسه مرحله");

    const me = await getMeServer();
    if (!me) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!["ADMIN", "MANAGER", "QC"].includes(me.role)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await req.json();
    const { itemId, status, note } = body;

    if (!itemId || !isValidStatus(status)) {
      return NextResponse.json(
        { error: "itemId یا status نامعتبر است" },
        { status: 400 }
      );
    }

    const item = await prisma.projectStageChecklistItem.findFirst({
      where: {
        id: Number(itemId),
        stageId,
        stage: {
          project: {
            companyId: me.companyId,
            deletedAt: null,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "آیتم QC یافت نشد" },
        { status: 404 }
      );
    }

    const updated = await prisma.projectStageChecklistItem.update({
      where: { id: item.id },
      data: {
        status,
        note: note?.trim() ? note.trim() : null,
        checkedAt: status === "PENDING" ? null : new Date(),
        checkedById: status === "PENDING" ? null : me.id,
      },
    });

    // ✅ فقط آیتم آپدیت‌شده رو برمی‌گردونیم
    // StageChecklistClient این حالت رو کامل هندل می‌کنه
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "خطا در ثبت وضعیت QC" },
      { status: 400 }
    );
  }
}
