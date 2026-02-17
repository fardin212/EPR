// app/api/reports/expenses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // 1️⃣ هزینه‌های عمومی (Voucher EXPENSE)
  const expenseVouchers = await prisma.accountingVoucher.findMany({
    where: {
      type: "EXPENSE",
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      party: { select: { name: true } },
      treasuryPayments: {
        where: { direction: "OUT" },
        select: { amount: true, date: true, description: true },
      },
    },
  });

  const generalExpenses = expenseVouchers.flatMap((v) =>
    v.treasuryPayments.map((p) => ({
      type: "GENERAL",
      date: p.date,
      amount: Number(p.amount),
      party: v.party?.name ?? "-",
      description: p.description ?? "هزینه عمومی",
    }))
  );

  // 2️⃣ هزینه‌های شخصی
  const personalPayments = await prisma.treasuryPayment.findMany({
    where: {
      direction: "OUT",
      projectId: null,
      party: {
        kind: "PERSON",
      },
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      party: { select: { name: true } },
    },
  });

  const personalExpenses = personalPayments.map((p) => ({
    type: "PERSONAL",
    date: p.date,
    amount: Number(p.amount),
    party: p.party?.name ?? "-",
    description: p.description ?? "هزینه شخصی",
  }));

  const items = [...generalExpenses, ...personalExpenses].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const summary = {
    general: generalExpenses.reduce((s, i) => s + i.amount, 0),
    personal: personalExpenses.reduce((s, i) => s + i.amount, 0),
  };

  return NextResponse.json({
    summary,
    count: items.length,
    items,
  });
}
