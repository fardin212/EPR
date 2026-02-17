import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q") || "";

  const where: any = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { number: { contains: q } },
            { bankName: { contains: q } },
            { issuerName: { contains: q } },
          ],
        }
      : {}),
  };

  const rows = await prisma.treasuryCheque.findMany({
    where,
    orderBy: { dueDate: "asc" },
    include: { party: true },
    take: 200,
  });

  return NextResponse.json(
    rows.map((c) => ({
      id: c.id,
      number: c.number,
      bankName: c.bankName ?? "",
      amount: Number(c.amount),
      dueDate: c.dueDate.toISOString(),
      issueDate: c.issueDate ? c.issueDate.toISOString() : null,
      status: c.status,
      party: c.party ? { id: c.party.id, name: c.party.name } : null,
      note: c.note ?? "",
    }))
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyId = 1;

    const created = await prisma.treasuryCheque.create({
      data: {
        companyId,
        number: String(body.number || "").trim(),
        bankName: body.bankName ?? null,
        branch: body.branch ?? null,
        accountNo: body.accountNo ?? null,
        iban: body.iban ?? null,
        issuerName: body.issuerName ?? null,
        payTo: body.payTo ?? null,
        amount: body.amount,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        dueDate: new Date(body.dueDate),
        partyId: body.partyId ? Number(body.partyId) : null,
        note: body.note ?? null,
      },
    });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در ثبت چک", { status: 500 });
  }
}
