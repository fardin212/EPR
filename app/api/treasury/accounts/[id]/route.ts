// app/api/treasury/accounts/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
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

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function safeStr(v: any, max = 200) {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function safeNum(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function PUT(req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = pickCompanyId(me);
    if (!companyId)
      return NextResponse.json({ error: "companyId نامعتبر است" }, { status: 400 });

    const { id: idStr } = await getParams(ctx);
    const id = mustInt(idStr, "شناسه حساب");

    const body = await req.json().catch(() => ({}));

    const title = safeStr(body?.title, 200);
    const typeRaw = String(body?.type ?? "CASH").toUpperCase();
    const type =
      typeRaw === "BANK" || typeRaw === "PETTY_CASH" ? typeRaw : "CASH";

    const bankName = type === "BANK" ? safeStr(body?.bankName, 120) || null : null;

    const accountNumber = safeStr(body?.accountNumber, 80) || null;
    const cardNumber = safeStr(body?.cardNumber, 80) || null;
    const iban = safeStr(body?.iban, 80) || null;

    const openingBalance =
      body?.openingBalance === undefined || body?.openingBalance === null
        ? undefined
        : safeNum(body.openingBalance);

    const isActive = body?.isActive !== false;

    if (!title)
      return NextResponse.json({ error: "عنوان حساب الزامی است" }, { status: 400 });

    const existing = await prisma.treasuryAccount.findFirst({
      where: { id, company: { id: companyId } },
      select: { id: true },
    });
    if (!existing)
      return NextResponse.json({ error: "حساب یافت نشد" }, { status: 404 });

    const updated = await prisma.treasuryAccount.update({
      where: { id },
      data: {
        title,
        type,
        bankName,
        accountNumber,
        cardNumber,
        iban,
        ...(openingBalance === undefined ? {} : { openingBalance }),
        isActive,

        accountingAccount: {
          update: {
            name: title,
            isActive,
          },
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        bankName: true,
        accountNumber: true,
        cardNumber: true,
        iban: true,
        openingBalance: true,
        isActive: true,
        accountingAccountId: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/treasury/accounts/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "خطا در ویرایش حساب خزانه" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = pickCompanyId(me);
    if (!companyId)
      return NextResponse.json({ error: "companyId نامعتبر است" }, { status: 400 });

    const { id: idStr } = await getParams(ctx);
    const id = mustInt(idStr, "شناسه حساب");

    const existing = await prisma.treasuryAccount.findFirst({
      where: { id, company: { id: companyId } },
      select: { id: true, accountingAccountId: true },
    });
    if (!existing)
      return NextResponse.json({ error: "حساب یافت نشد" }, { status: 404 });

    const used = await prisma.treasuryTransaction.count({
      where: { OR: [{ fromAccountId: id }, { toAccountId: id }] },
    });
    if (used > 0) {
      return NextResponse.json(
        { error: "این حساب در تراکنش‌ها استفاده شده و قابل حذف نیست" },
        { status: 409 }
      );
    }

    await prisma.treasuryAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/treasury/accounts/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "خطا در حذف حساب خزانه" },
      { status: 500 }
    );
  }
}
