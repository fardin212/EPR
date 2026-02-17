import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ================= Utils ================= */

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function safeStr(v: any, max = 100) {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function pickCompanyId(me: any) {
  return (
    Number(me?.companyId) ||
    Number(me?.company?.id) ||
    Number(me?.user?.companyId) ||
    Number(me?.user?.company?.id) ||
    0
  );
}

/* ================= PATCH ================= */

export async function PATCH(req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = pickCompanyId(me);
    if (!companyId)
      return NextResponse.json({ error: "companyId نامعتبر است" }, { status: 400 });

    const { id: idStr } = await getParams(ctx);
    const id = mustInt(idStr, "شناسه دسته‌بندی");

    const body = await req.json().catch(() => ({}));
    const title = safeStr(body?.title, 200);
    const code = safeStr(body?.code, 20).toUpperCase();

    if (!title)
      return NextResponse.json({ error: "عنوان الزامی است." }, { status: 400 });
    if (!code)
      return NextResponse.json({ error: "کد الزامی است." }, { status: 400 });

    // وجود دسته برای همین شرکت
    const existing = await prisma.productCategory.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!existing)
      return NextResponse.json({ error: "دسته‌بندی یافت نشد." }, { status: 404 });

    // جلوگیری از تکرار کد در همان شرکت
    const dup = await prisma.productCategory.findFirst({
      where: { companyId, code, NOT: { id } },
      select: { id: true },
    });
    if (dup)
      return NextResponse.json({ error: "کد دسته‌بندی تکراری است." }, { status: 409 });

    const updated = await prisma.productCategory.update({
      where: { id },
      data: { title, code },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PATCH productCategory error:", e);
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 400 });
  }
}

/* ================= DELETE ================= */

export async function DELETE(_req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = pickCompanyId(me);
    if (!companyId)
      return NextResponse.json({ error: "companyId نامعتبر است" }, { status: 400 });

    const { id: idStr } = await getParams(ctx);
    const id = mustInt(idStr, "شناسه دسته‌بندی");

    const existing = await prisma.productCategory.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!existing)
      return NextResponse.json({ error: "دسته‌بندی یافت نشد." }, { status: 404 });

    // اگر کالا به این دسته وصل است، حذف نشود
    const usedCount = await prisma.product.count({
      where: { companyId, categoryId: id },
    });

    if (usedCount > 0) {
      return NextResponse.json(
        {
          error:
            "این دسته‌بندی به کالاها وصل است و قابل حذف نیست. ابتدا کالاها را تغییر دسته دهید.",
        },
        { status: 409 }
      );
    }

    await prisma.productCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE productCategory error:", e);
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 400 });
  }
}
