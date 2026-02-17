import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است`);
  }
  return n;
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const id = mustInt(params.id, "id");

    // فقط قفل‌های همان شرکت
    const lock = await prisma.accountingPeriodLock.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!lock) return new NextResponse("قفل یافت نشد", { status: 404 });

    await prisma.accountingPeriodLock.delete({ where: { id } });

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در حذف قفل", { status: 500 });
  }
}
