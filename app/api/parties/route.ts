// app/api/parties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/auth";
import { PartyKind, PartyType } from "@prisma/client";

function normStr(v: any, max = 200) {
  const s = (v ?? "").toString().trim();
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

function kindToType(kind: PartyKind): PartyType {
  if (kind === "CUSTOMER") return "CUSTOMER";
  if (kind === "SUPPLIER") return "SUPPLIER";
  if (kind === "CONTRACTOR") return "CONTRACTOR";
  return "OTHER";
}

// ✅ تلاش برای Sync مشتری‌های CRM به Party (فقط وقتی kind=CUSTOMER)
async function syncCrmCustomersToParties(companyId: number) {
  try {
    // توجه: اسم جدول را فرض کردیم CrmCustomer (طبق UI شما)
    // اگر اسم جدول فرق داشت، این قسمت صرفاً fail می‌شود و سیستم به کارش ادامه می‌دهد.
    const rows: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT id, name, mobile, phone, nationalId, companyName, address
      FROM \`CrmCustomer\`
      WHERE companyId = ?
      ORDER BY id DESC
      LIMIT 500
      `,
      companyId
    );

    if (!Array.isArray(rows) || rows.length === 0) return;

    for (const c of rows) {
      const name = normStr(c?.name, 200);
      if (!name) continue;

      const mobile = normStr(c?.mobile, 40) || null;
      const phone = normStr(c?.phone, 40) || null;
      const nationalId = normStr(c?.nationalId, 40) || null;
      const companyName = normStr(c?.companyName, 200) || null;
      const address = normStr(c?.address, 500) || null;

      // معیار پیدا کردن Party موجود:
      // اول nationalId، بعد mobile، بعد name
      const existing = await prisma.party.findFirst({
        where: {
          companyId,
          kind: "CUSTOMER",
          OR: [
            ...(nationalId ? [{ nationalId }] : []),
            ...(mobile ? [{ mobile }] : []),
            { name },
          ],
        },
        select: { id: true },
      });

      if (existing) continue;

      await prisma.party.create({
        data: {
          companyId,
          kind: "CUSTOMER",
          type: "CUSTOMER",
          name,
          mobile,
          phone,
          nationalId,
          companyName,
          address,
        },
      });
    }
  } catch (e) {
    // مهم: اگر جدول/ستون وجود نداشت، سیستم نباید بخوابد.
    console.warn("syncCrmCustomersToParties skipped:", (e as any)?.message || e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const me = await getMeServer();
    const companyId = Number(me?.companyId);
    if (!companyId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const kind = (searchParams.get("kind") as PartyKind | null) ?? null;
    const q = (searchParams.get("q") || "").trim();

    // ✅ اگر مشتری می‌خوای، اول Sync کن تا dropdown کامل شود
    if (kind === "CUSTOMER" && !q) {
      await syncCrmCustomersToParties(companyId);
    }

    const where: any = { companyId };
    if (kind) where.kind = kind;

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { mobile: { contains: q } },
        { phone: { contains: q } },
        { companyName: { contains: q, mode: "insensitive" } },
      ];
    }

    const parties = await prisma.party.findMany({
      where,
      orderBy: { id: "desc" },
      take: 300,
      include: {
        bankAccounts: {
          orderBy: [{ isDefault: "desc" }, { id: "desc" }],
          take: 1,
          select: {
            id: true,
            title: true,
            bankName: true,
            accountNumber: true,
            cardNumber: true,
            iban: true,
            isDefault: true,
            ownerName: true,
          },
        },
      },
    });

    return NextResponse.json(
      parties.map((p: any) => ({
        ...p,
        defaultBankAccount: p.bankAccounts?.[0] ?? null,
      }))
    );
  } catch (err) {
    console.error("GET /api/parties error:", err);
    return NextResponse.json({ error: "خطا در دریافت طرف‌حساب‌ها" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const me = await getMeServer();
    const companyId = Number(me?.companyId);
    if (!companyId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();

    const kind = (String(body.kind || "").toUpperCase().trim() as PartyKind) || "CUSTOMER";
    const type =
      (body.type ? (String(body.type).toUpperCase().trim() as PartyType) : null) || kindToType(kind);

    const name = normStr(body.name, 200);
    if (!name) return NextResponse.json({ error: "نام الزامی است" }, { status: 400 });

    const phone = normStr(body.phone, 40) || null;
    const mobile = normStr(body.mobile, 40) || null;
    const email = normStr(body.email, 120) || null;
    const nationalId = normStr(body.nationalId, 40) || null;
    const companyName = normStr(body.companyName, 200) || null;
    const address = normStr(body.address, 500) || null;
    const note = normStr(body.note, 500) || null;
    const description = normStr(body.description, 2000) || null;

    const bankAccount = body.bankAccount ?? null;
    const hasBank =
      bankAccount &&
      (normStr(bankAccount.title, 200) ||
        normStr(bankAccount.cardNumber, 30) ||
        normStr(bankAccount.accountNumber, 40) ||
        normStr(bankAccount.iban, 40));

    const created = await prisma.$transaction(async (tx) => {
      const party = await tx.party.create({
        data: {
          companyId,
          kind,
          type,
          name,
          phone,
          mobile,
          email,
          nationalId,
          companyName,
          address,
          note,
          description,
        },
      });

      if (hasBank) {
        await tx.partyBankAccount.create({
          data: {
            companyId,
            partyId: party.id,
            title: normStr(bankAccount.title, 200) || "حساب",
            bankName: normStr(bankAccount.bankName, 120) || null,
            accountNumber: normStr(bankAccount.accountNumber, 40) || null,
            cardNumber: normStr(bankAccount.cardNumber, 30) || null,
            iban: normStr(bankAccount.iban, 40) || null,
            ownerName: normStr(bankAccount.ownerName, 200) || null,
            isDefault: true,
          },
        });
      }

      return party;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/parties error:", err);
    return NextResponse.json({ error: "خطا در ایجاد طرف حساب" }, { status: 500 });
  }
}
