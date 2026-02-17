// app/api/reports/payroll/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  const vouchers = await prisma.accountingVoucher.findMany({
    where: {
      type: "SALARY",
      ...(month
        ? {
            date: {
              gte: new Date(`${month}-01`),
              lt: new Date(
                new Date(`${month}-01`).setMonth(
                  new Date(`${month}-01`).getMonth() + 1
                )
              ),
            },
          }
        : {}),
    },
    include: {
      party: { select: { id: true, name: true } },
      treasuryPayments: {
        where: { direction: "OUT" },
        select: { amount: true },
      },
    },
    orderBy: { date: "desc" },
  });

  const rows = vouchers.map((v) => {
    const total = Number(v.totalAmount);
    const paid = v.treasuryPayments.reduce(
      (s, p) => s + Number(p.amount),
      0
    );
    const remaining = total - paid;

    let status: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID";
    if (paid >= total && total > 0) status = "PAID";
    else if (paid > 0 && paid < total) status = "PARTIAL";

    return {
      id: v.id,
      employee: v.party?.name ?? "-",
      month: monthKey(v.date),
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      status,
    };
  });

  const summary = rows.reduce(
    (acc, r) => {
      acc.total += r.totalAmount;
      acc.paid += r.paidAmount;
      acc.remaining += r.remainingAmount;
      return acc;
    },
    { total: 0, paid: 0, remaining: 0 }
  );

  return NextResponse.json({
    summary,
    count: rows.length,
    items: rows,
  });
}
