// app/api/treasury/balances/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const COMPANY_ID = 1;

function isTruthy(v: any) {
  return v === true || v === "true" || v === 1 || v === "1";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get("scope") || "accounts").toLowerCase();
  const includeCheques = isTruthy(searchParams.get("includeCheques"));

  // 1) مانده حساب‌های خزانه
  if (scope === "accounts") {
    // همه حساب‌های خزانه
    const accounts = await prisma.treasuryAccount.findMany({
      where: { companyId: COMPANY_ID, isActive: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        title: true,
        type: true,
        openingBalance: true,
      },
    });

    // همه تراکنش‌های خزانه (اختیاری: حذف چک‌ها)
    const whereTx: any = { companyId: COMPANY_ID };
    if (!includeCheques) whereTx.method = { not: "CHEQUE" };

    const txs = await prisma.treasuryTransaction.findMany({
      where: whereTx,
      select: {
        id: true,
        direction: true,
        amount: true,
        fromAccountId: true,
        toAccountId: true,
      },
    });

    // محاسبه مانده: opening + IN(to) - OUT(from) + XFER(to) - XFER(from)
    const map = new Map<number, number>();
    for (const a of accounts) map.set(a.id, Number(a.openingBalance || 0));

    for (const t of txs as any[]) {
      const amt = Number(t.amount || 0);
      if (t.direction === "IN") {
        if (t.toAccountId) map.set(t.toAccountId, (map.get(t.toAccountId) || 0) + amt);
      } else if (t.direction === "OUT") {
        if (t.fromAccountId) map.set(t.fromAccountId, (map.get(t.fromAccountId) || 0) - amt);
      } else if (t.direction === "XFER") {
        if (t.fromAccountId) map.set(t.fromAccountId, (map.get(t.fromAccountId) || 0) - amt);
        if (t.toAccountId) map.set(t.toAccountId, (map.get(t.toAccountId) || 0) + amt);
      }
    }

    const items = accounts.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      openingBalance: Number(a.openingBalance || 0),
      balance: map.get(a.id) || 0,
    }));

    const total = items.reduce((s, x) => s + x.balance, 0);

    return NextResponse.json({
      scope: "accounts",
      includeCheques,
      total,
      items,
    });
  }

  // 2) مانده طرف حساب‌ها (همان خروجی قبلی شما)
  if (scope === "parties") {
    const partyAcc = await prisma.accountingAccount.findUnique({ where: { code: "9000" } });
    if (!partyAcc) return new NextResponse("حساب 9000 (طرف حساب‌ها) یافت نشد", { status: 400 });

    const rows = await prisma.accountingVoucherItem.findMany({
      where: { accountId: partyAcc.id, partyId: { not: null } },
      include: { party: true },
    });

    const map = new Map<number, { partyId: number; name: string; debit: number; credit: number }>();

    for (const r of rows as any[]) {
      const pid = r.partyId as number;
      const cur = map.get(pid) || { partyId: pid, name: r.party?.name || "—", debit: 0, credit: 0 };
      cur.debit += Number(r.debit || 0);
      cur.credit += Number(r.credit || 0);
      map.set(pid, cur);
    }

    const items = [...map.values()].map((x) => ({
      ...x,
      balance: x.debit - x.credit, // مثبت = بدهکار
    }));

    items.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

    return NextResponse.json({ scope: "parties", items });
  }

  return new NextResponse("scope نامعتبر است (accounts | parties)", { status: 400 });
}
