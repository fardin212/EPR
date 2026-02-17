import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function mustInt(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error("id نامعتبر است");
  return n;
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await getMeServer();
    if (me.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

    const { id: idStr } = await ctx.params;
    const id = mustInt(idStr);
    const companyId = me.companyId;

    await prisma.invoice.updateMany({
      where: { id, companyId, deletedAt: { not: null } },
      data: { deletedAt: null, deletedBy: null },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message || "خطا در بازگردانی", { status: 500 });
  }
}
