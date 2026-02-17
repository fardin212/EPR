import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error(`${name} نامعتبر است`);
  return n;
}
function isTruthy(v: any) {
  return v === true || v === "true" || v === 1 || v === "1";
}

async function assertNotLocked(tx: any, companyId: number, date: Date) {
  const lock = await tx.accountingPeriodLock.findFirst({
    where: { companyId, periodFrom: { lte: date }, periodTo: { gte: date } },
    select: { id: true },
  });
  if (lock) {
    const err: any = new Error("این بازه حسابداری بسته شده و امکان ثبت/ویرایش وجود ندارد.");
    err.status = 423;
    throw err;
  }
}

async function createXferVoucher(tx: any, args: {
  companyId: number;
  date: Date;
  amount: number;
  fromTreasuryAccountId: number;
  toTreasuryAccountId: number;
  description: string | null;
}) {
  const last = await tx.accountingVoucher.findFirst({
    orderBy: { id: "desc" },
    select: { refNo: true },
  });
  const lastNum = last?.refNo ? parseInt(last.refNo, 10) || 0 : 0;
  const refNo = String(lastNum + 1).padStart(5, "0");

  const fromTA = await tx.treasuryAccount.findUnique({
    where: { id: args.fromTreasuryAccountId },
    select: { accountingAccountId: true, title: true },
  });
  const toTA = await tx.treasuryAccount.findUnique({
    where: { id: args.toTreasuryAccountId },
    select: { accountingAccountId: true, title: true },
  });
  if (!fromTA || !toTA) throw new Error("حساب خزانه مبدا/مقصد یافت نشد");

  const voucher = await tx.accountingVoucher.create({
    data: {
      companyId: args.companyId,
      date: args.date,
      refNo,
      type: "TRANSFER" as any,
      description: args.description ?? undefined,
      totalDebit: args.amount,
      totalCredit: args.amount,
    } as any,
    select: { id: true },
  });

  await tx.accountingVoucherItem.createMany({
    data: [
      {
        voucherId: voucher.id,
        accountId: toTA.accountingAccountId,
        description: `انتقال به (${toTA.title})`,
        debit: args.amount,
        credit: 0,
        projectId: null,
        partyId: null,
      },
      {
        voucherId: voucher.id,
        accountId: fromTA.accountingAccountId,
        description: `انتقال از (${fromTA.title})`,
        debit: 0,
        credit: args.amount,
        projectId: null,
        partyId: null,
      },
    ] as any,
  });

  return voucher.id as number;
}

export async function POST(req: Request) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const body = await req.json();
    const date = body.date ? new Date(body.date) : new Date();
    if (Number.isNaN(date.getTime())) return new NextResponse("date نامعتبر است", { status: 400 });

    const amount = mustInt(body.amount, "amount");
    const fromAccountId = mustInt(body.fromAccountId, "fromAccountId");
    const toAccountId = mustInt(body.toAccountId, "toAccountId");
    const note = String(body.note || "").trim() || null;

    const createVoucher = body.createVoucher !== undefined ? isTruthy(body.createVoucher) : true;

    if (fromAccountId === toAccountId) {
      return new NextResponse("حساب مبدا و مقصد نمی‌تواند یکسان باشد.", { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      await assertNotLocked(tx, companyId, date);

      const t = await tx.treasuryTransaction.create({
        data: {
          companyId,
          date,
          direction: "XFER" as any,
          method: "TRANSFER" as any,
          amount,
          fromAccountId,
          toAccountId,
          note,
        },
        select: { id: true },
      });

      let voucherId: number | null = null;
      if (createVoucher) {
        voucherId = await createXferVoucher(tx, {
          companyId,
          date,
          amount,
          fromTreasuryAccountId: fromAccountId,
          toTreasuryAccountId: toAccountId,
          description: note ? `انتقال بین حساب‌ها — ${note}` : "انتقال بین حساب‌ها",
        });

        await tx.treasuryTransaction.update({
          where: { id: t.id },
          data: { accountingVoucherId: voucherId },
        });
      }

      return { id: t.id, accountingVoucherId: voucherId };
    });

    return NextResponse.json({ ok: true, ...created }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در ثبت انتقال", { status: e?.status || 500 });
  }
}
