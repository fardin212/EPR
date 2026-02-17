// app/api/reports/suppliers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const supplierId = searchParams.get("supplierId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const vouchers = await prisma.accountingVoucher.findMany({
    where: {
      type: "PURCHASE",
      ...(projectId ? { projectId: Number(projectId) } : {}),
      ...(supplierId ? { partyId: Number(supplierId) } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      party: {
        kind: "SUPPLIER",
      },
    },
    include: {
      party: {
        select: { id: true, name: true },
      },
      project: {
        select: { id: true, title: true },
      },
      treasuryPayments: {
        where: { direction: "OUT" },
        select: { amount: true },
      },
    },
    orderBy: { date: "desc" },
  });

  const items = vouchers.map((v) => {
    const paid = v.treasuryPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const total = Number(v.totalAmount);
    const remaining = total - paid;

    return {
      id: v.id,
      supplier: v.party?.name ?? "-",
      project: v.project?.title ?? "-",
      totalAmount: total,
      paidAmount: paid,
      remainingAmount: remaining,
      date: v.date,
    };
  });

  const summary = items.reduce(
    (acc, i) => {
      acc.total += i.totalAmount;
      acc.paid += i.paidAmount;
      acc.remaining += i.remainingAmount;
      return acc;
    },
    { total: 0, paid: 0, remaining: 0 }
  );

  return NextResponse.json({
    summary,
    count: items.length,
    items,
  });
}
