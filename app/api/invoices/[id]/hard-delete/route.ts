import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function mustInt(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error("id نامعتبر است");
  return n;
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const me = await getMeServer();
    if (me.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

    const { id: idStr } = await ctx.params;
    const id = mustInt(idStr);
    const companyId = me.companyId;

    // فقط آیتم‌هایی که soft-delete شده‌اند اجازه حذف دائمی دارند
    const inv = await prisma.invoice.findFirst({
      where: { id, companyId, deletedAt: { not: null } },
      select: { id: true },
    });
    if (!inv) return new NextResponse("فاکتور در Trash نیست", { status: 404 });

    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
      prisma.invoiceSpec.deleteMany({ where: { invoiceId: id } }),
      prisma.invoice.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message || "خطا در حذف دائمی", { status: 500 });
  }
}
