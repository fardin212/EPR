// app/api/treasury/cashflow/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const COMPANY_ID = 1;

function isTruthy(v: any) {
  return v === true || v === "true" || v === 1 || v === "1";
}

function parseDate(v: string | null, fallback: Date) {
  if (!v) return fallback;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return fallback;
  return d;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeCheques = isTruthy(searchParams.get("includeCheques"));

    // بازه پیش‌فرض: 30 روز اخیر
    const now = new Date();
    const from = parseDate(searchParams.get("from"), new Date(now.getTime() - 30 * 24 * 3600 * 1000));
    const to = parseDate(searchParams.get("to"), now);

    const whereTx: any = {
      companyId: COMPANY_ID,
      date: { gte: from, lte: to },
    };
    if (!includeCheques) whereTx.method = { not: "CHEQUE" };

    const txs = await prisma.treasuryTransaction.findMany({
      where: whereTx,
      select: {
        id: true,
        date: true,
        direction: true,
        method: true,
        amount: true,
        fromAccountId: true,
        toAccountId: true,
      },
    });

    let inflow = 0;
    let outflow = 0;

    const byMethod = new Map<string, { inflow: number; outflow: number }>();

    for (const t of txs as any[]) {
      const amt = Number(t.amount || 0);
      if (t.direction === "IN") inflow += amt;
      if (t.direction === "OUT") outflow += amt;
      // XFER در کش‌فلو “ورودی/خروجی بیرونی” نیست (جابجایی داخلی). پس در inflow/outflow نمی‌آید.

      const key = String(t.method);
      const cur = byMethod.get(key) || { inflow: 0, outflow: 0 };
      if (t.direction === "IN") cur.inflow += amt;
      if (t.direction === "OUT") cur.outflow += amt;
      byMethod.set(key, cur);
    }

    const methods = [...byMethod.entries()].map(([method, v]) => ({
      method,
      inflow: v.inflow,
      outflow: v.outflow,
      net: v.inflow - v.outflow,
    }));

    return NextResponse.json({
      from: from.toISOString(),
      to: to.toISOString(),
      includeCheques,
      inflow,
      outflow,
      net: inflow - outflow,
      methods,
      txCount: txs.length,
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("خطا در گزارش جریان نقدی", { status: 500 });
  }
}
