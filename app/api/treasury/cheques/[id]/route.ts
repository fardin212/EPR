import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error(`${name} نامعتبر است`);
  return n;
}

function toTomanInt(decimalLike: any) {
  // Prisma Decimal => Number() قابل تبدیل است
  const n = Number(decimalLike);
  if (!Number.isFinite(n) || n < 0) throw new Error("amount نامعتبر است");
  return Math.round(n);
}

async function getNextRefNo(tx: any) {
  const last = await tx.accountingVoucher.findFirst({
    orderBy: { id: "desc" },
    select: { refNo: true },
  });
  const lastNum = last?.refNo ? parseInt(last.refNo, 10) || 0 : 0;
  return String(lastNum + 1).padStart(5, "0");
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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const id = mustInt(params.id, "id");
    const newStatus = String(body.status || "").toUpperCase();
    if (!newStatus) return new NextResponse("status الزامی است", { status: 400 });

    const out = await prisma.$transaction(async (tx) => {
      const cheque = await tx.treasuryCheque.findUnique({
        where: { id },
        include: {
          payments: { orderBy: { id: "desc" }, take: 1 },
        },
      });
      if (!cheque) throw new Error("چک یافت نشد");

      const updated = await tx.treasuryCheque.update({
        where: { id },
        data: { status: newStatus as any, note: body.note ?? undefined },
      });

      // فقط هنگام CLEARED سند/تراکنش ساخته شود
      if (newStatus !== "CLEARED") return { ok: true, chequeId: updated.id, created: false };

      const pay = cheque.payments?.[0];
      if (!pay) throw new Error("برای پاس/وصول شدن چک باید یک پرداخت/دریافت مرتبط ثبت شده باشد.");

      // اگر قبلاً سند خورده، دوباره نساز
      if (pay.voucherId) return { ok: true, chequeId: updated.id, created: false, voucherId: pay.voucherId };

      const companyId = pay.companyId;
      const clearedAt = new Date(); // تاریخ واقعی وصول/پاس
      await assertNotLocked(tx, companyId, clearedAt);

      // حساب خزانه: در Payment فقط fromAccountId داریم
      const treasuryAccountId = pay.fromAccountId ? Number(pay.fromAccountId) : null;
      if (!treasuryAccountId) throw new Error("روی پرداخت/دریافت چکی، fromAccountId (حساب خزانه) مشخص نیست.");

      const tAcc = await tx.treasuryAccount.findUnique({
        where: { id: treasuryAccountId },
        select: { id: true, title: true, accountingAccountId: true },
      });
      if (!tAcc) throw new Error("حساب خزانه یافت نشد.");

      const partyAcc = await tx.accountingAccount.findUnique({ where: { code: "9000" } });
      if (!partyAcc) throw new Error("حساب 9000 (طرف حساب‌ها) یافت نشد");

      const direction = String(pay.direction).toUpperCase(); // IN | OUT
      if (direction !== "IN" && direction !== "OUT") throw new Error("direction پرداخت نامعتبر است");

      const amountToman = toTomanInt(pay.amount);

      // 1) تراکنش خزانه واقعی
      const createdTx = await tx.treasuryTransaction.create({
        data: {
          companyId,
          date: clearedAt,
          direction: direction as any,
          method: "CHEQUE" as any,
          amount: amountToman,
          fromAccountId: direction === "OUT" ? tAcc.id : null,
          toAccountId: direction === "IN" ? tAcc.id : null,
          partyId: pay.partyId ?? cheque.partyId ?? null,
          refNo: cheque.number,
          note: `چک ${cheque.number} - ${direction === "IN" ? "وصول" : "پاس"} شد`,
        },
        select: { id: true },
      });

      // 2) سند حسابداری
      const refNo = await getNextRefNo(tx);

      // دریافت: بدهکار بانک/صندوق، بستانکار طرف حساب‌ها
      // پرداخت: بدهکار طرف حساب‌ها، بستانکار بانک/صندوق
      const debitCash = direction === "IN" ? amountToman : 0;
      const creditCash = direction === "OUT" ? amountToman : 0;
      const debitParty = direction === "OUT" ? amountToman : 0;
      const creditParty = direction === "IN" ? amountToman : 0;

      const voucher = await tx.accountingVoucher.create({
        data: {
          companyId,
          projectId: pay.projectId ?? null,
          date: clearedAt,
          refNo,
          type: "GENERAL" as any,
          description: `ثبت خودکار چک پاس/وصول شده (${cheque.number})`,
          partyId: pay.partyId ?? cheque.partyId ?? null,
          totalDebit: debitCash + debitParty,
          totalCredit: creditCash + creditParty,
          items: {
            create: [
              {
                accountId: tAcc.accountingAccountId,
                description: `بانک/صندوق (${tAcc.title})`,
                debit: debitCash,
                credit: creditCash,
                projectId: pay.projectId ?? null,
                partyId: pay.partyId ?? cheque.partyId ?? null,
              },
              {
                accountId: partyAcc.id,
                description: "طرف حساب‌ها",
                debit: debitParty,
                credit: creditParty,
                projectId: pay.projectId ?? null,
                partyId: pay.partyId ?? cheque.partyId ?? null,
              },
            ],
          },
        } as any,
        select: { id: true },
      });

      await tx.treasuryTransaction.update({
        where: { id: createdTx.id },
        data: { accountingVoucherId: voucher.id },
      });

      await tx.treasuryPayment.update({
        where: { id: pay.id },
        data: { voucherId: voucher.id },
      });

      return { ok: true, chequeId: updated.id, created: true, txId: createdTx.id, voucherId: voucher.id };
    });

    return NextResponse.json(out);
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در بروزرسانی چک", { status: e?.status || 500 });
  }
}
