import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days") || "3");
  const now = new Date();
  const to = new Date(now);
  to.setDate(to.getDate() + days);

  const rows = await prisma.treasuryCheque.findMany({
    where: {
      dueDate: { gte: now, lte: to },
      status: { in: ["REGISTERED", "DELIVERED", "RECEIVED"] as any },
    },
    orderBy: { dueDate: "asc" },
    include: { party: true },
  });

  return NextResponse.json({
    count: rows.length,
    items: rows.slice(0, 10).map((c) => ({
      id: c.id,
      number: c.number,
      dueDate: c.dueDate.toISOString(),
      amount: Number(c.amount),
      partyName: c.party?.name ?? null,
      status: c.status,
    })),
  });
}
