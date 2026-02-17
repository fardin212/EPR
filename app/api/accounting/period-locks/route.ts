import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function mustDate(v: any, name: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error(`${name} نامعتبر است`);
  return d;
}

export async function GET() {
  const me = await getMeServer();
  const companyId = me.companyId;

  const locks = await prisma.accountingPeriodLock.findMany({
    where: { companyId },
    orderBy: [{ periodFrom: "desc" }],
    select: {
      id: true,
      periodFrom: true,
      periodTo: true,
      note: true,
      lockedAt: true,
      lockedById: true,
    },
  });

  return NextResponse.json({ items: locks });
}

export async function POST(req: Request) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const body = await req.json();
    const periodFrom = mustDate(body.periodFrom, "periodFrom");
    const periodTo = mustDate(body.periodTo, "periodTo");
    const note = (body.note || "").toString().trim() || null;

    if (periodTo < periodFrom) {
      return new NextResponse("periodTo باید بعد از periodFrom باشد.", { status: 400 });
    }

    const created = await prisma.accountingPeriodLock.create({
      data: {
        companyId,
        periodFrom,
        periodTo,
        note,
        lockedById: me.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در ایجاد قفل", { status: 500 });
  }
}
