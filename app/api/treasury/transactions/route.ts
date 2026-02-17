import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} نامعتبر است`);
  return Math.floor(n);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const companyId = mustInt(body.companyId ?? 1, "companyId");
    const date = body.date ? new Date(body.date) : new Date();
    const amount = mustInt(body.amount, "amount");
    const fromAccountId = mustInt(body.fromAccountId, "fromAccountId");
    const toAccountId = mustInt(body.toAccountId, "toAccountId");
    const note = (body.note || "").toString();

    if (fromAccountId === toAccountId) {
      return new NextResponse("حساب مبدا و مقصد نمی‌تواند یکسان باشد.", { status: 400 });
    }

    const txCreated = await prisma.treasuryTransaction.create({
      data: {
        companyId,
        date,
        direction: "XFER" as any,
        method: "TRANSFER" as any,
        amount,
        fromAccountId,
        toAccountId,
        note: note || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: txCreated.id }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در ثبت انتقال بین حساب‌ها", { status: 500 });
  }
}
