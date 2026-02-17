import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { getMeServer } from "@/lib/authMe";
import { TreasuryReportPdf } from "./TreasuryReportPdf";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const me = await getMeServer();
  const companyId = me.companyId;

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : now;

  const accounts = await prisma.treasuryAccount.findMany({
    where: { companyId, isActive: true },
    orderBy: { id: "asc" },
    select: { id: true, title: true, type: true, openingBalance: true },
  });

  const txs = await prisma.treasuryTransaction.findMany({
    where: { companyId, date: { gte: from, lte: to } },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      direction: true,
      method: true,
      amount: true,
      fromAccountId: true,
      toAccountId: true,
      note: true,
      refNo: true,
    },
  });

  // محاسبه مانده حساب‌ها: opening + IN(to) - OUT(from) + XFER(to) - XFER(from)
  const balMap = new Map<number, number>();
  for (const a of accounts) balMap.set(a.id, Number(a.openingBalance || 0));

  for (const t of txs as any[]) {
    const amt = Number(t.amount || 0);
    if (t.direction === "IN" && t.toAccountId) balMap.set(t.toAccountId, (balMap.get(t.toAccountId) || 0) + amt);
    if (t.direction === "OUT" && t.fromAccountId) balMap.set(t.fromAccountId, (balMap.get(t.fromAccountId) || 0) - amt);
    if (t.direction === "XFER") {
      if (t.fromAccountId) balMap.set(t.fromAccountId, (balMap.get(t.fromAccountId) || 0) - amt);
      if (t.toAccountId) balMap.set(t.toAccountId, (balMap.get(t.toAccountId) || 0) + amt);
    }
  }

  // Cash Flow (فقط IN/OUT، انتقال داخلی حساب نیست)
  let inflow = 0, outflow = 0;
  for (const t of txs as any[]) {
    const amt = Number(t.amount || 0);
    if (t.direction === "IN") inflow += amt;
    if (t.direction === "OUT") outflow += amt;
  }

  const accTitleById = new Map(accounts.map(a => [a.id, a.title] as const));

  const pdfBuffer = await renderToBuffer(
    TreasuryReportPdf({
      companyName: "کانکس نیکان",
      from,
      to,
      accounts: accounts.map(a => ({
        title: a.title,
        type: a.type,
        openingBalance: Number(a.openingBalance || 0),
        balance: balMap.get(a.id) || 0,
      })),
      cashflow: { inflow, outflow, net: inflow - outflow },
      txs: txs.map((t: any) => ({
        date: t.date,
        direction: t.direction,
        method: t.method,
        amount: Number(t.amount || 0),
        account:
          (t.direction === "IN" ? accTitleById.get(t.toAccountId) : accTitleById.get(t.fromAccountId)) || "—",
        refNo: t.refNo || "",
        note: t.note || "",
      })),
    })
  );

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="nikan-treasury-report.pdf"`,
    },
  });
}
