// app/api/treasury/accounts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickCompanyId(me: any) {
  return (
    Number(me?.companyId) ||
    Number(me?.company?.id) ||
    Number(me?.user?.companyId) ||
    Number(me?.user?.company?.id) ||
    0
  );
}

function safeStr(v: any, max = 200) {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function safeNum(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function genAccountCode(companyId: number) {
  // AccountingAccount.code @unique است → یک کد یکتا و پایدار بساز
  // مثال: TA-1-550e8400e29b41d4a716446655440000
  return `TA-${companyId}-${crypto.randomUUID().replace(/-/g, "")}`;
}

export async function GET() {
  try {
    const me = await getMeServer();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = pickCompanyId(me);
    if (!companyId)
      return NextResponse.json({ error: "companyId نامعتبر است" }, { status: 400 });

    const accounts = await prisma.treasuryAccount.findMany({
      where: { company: { id: companyId }, isActive: true },
      orderBy: [{ type: "asc" }, { title: "asc" }],
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

    return NextResponse.json(accounts);
  } catch (err) {
    console.error("GET /api/treasury/accounts error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت حساب‌های خزانه" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const me = await getMeServer();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = pickCompanyId(me);
    if (!companyId)
      return NextResponse.json({ error: "companyId نامعتبر است" }, { status: 400 });

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

    const created = await prisma.treasuryAccount.create({
      data: {
        // ✅ companyId در مدل TreasuryAccount هست، ولی با توجه به خطای Prisma کلاینت شما
        // فقط relation را وصل می‌کنیم تا ارور Unknown argument companyId نگیری.
        company: { connect: { id: companyId } },

        title,
        type,
        bankName,
        accountNumber,
        cardNumber,
        iban,
        ...(openingBalance === undefined ? {} : { openingBalance }),
        isActive,

        // ✅ AccountingAccount حتماً code + name می‌خواهد
        accountingAccount: {
          create: {
            company: { connect: { id: companyId } },
            code: genAccountCode(companyId),
            name: title,
            type: "ASSET",
            level: "DETAIL",
            isPosting: true,
            isActive: true,
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

    return NextResponse.json(created);
  } catch (err: any) {
    console.error("POST /api/treasury/accounts error:", err);
    return NextResponse.json(
      { error: err?.message || "خطا در ثبت حساب خزانه" },
      { status: 500 }
    );
  }
}
