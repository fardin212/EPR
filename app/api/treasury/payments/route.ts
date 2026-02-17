// app/api/treasury/payments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error(`${name} نامعتبر است`);
  return n;
}

function mustPositiveInt(v: any, name: string) {
  const n = mustInt(v, name);
  if (n <= 0) throw new Error(`${name} باید بزرگتر از صفر باشد`);
  return n;
}

function parseDate(v: any) {
  const d = v ? new Date(v) : new Date();
  if (Number.isNaN(d.getTime())) throw new Error("date نامعتبر است");
  return d;
}

function normEnum(v: any) {
  return String(v ?? "").trim().toUpperCase();
}

function safeStr(v: any, max = 500) {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function isTruthy(v: any) {
  return v === true || v === "true" || v === 1 || v === "1";
}

type TxDirection = "IN" | "OUT" | "XFER";
type TxMethod = "CASH" | "CARD" | "TRANSFER" | "CHEQUE";

function httpError(message: string, status = 400) {
  const err: any = new Error(message);
  err.status = status;
  return err;
}

// قفل حسابداری: اگر تاریخ داخل بازه قفل باشد، اجازه ثبت/ویرایش نداریم
async function assertNotLocked(tx: any, companyId: number, date: Date) {
  const lock = await tx.accountingPeriodLock.findFirst({
    where: {
      companyId,
      periodFrom: { lte: date },
      periodTo: { gte: date },
    },
    select: { id: true },
  });

  if (lock) throw httpError("این بازه حسابداری بسته شده و امکان ثبت/ویرایش وجود ندارد.", 423);
}

// ساخت سند حسابداری برای تراکنش خزانه
async function createVoucherForTreasuryTx(
  tx: any,
  args: {
    companyId: number;
    date: Date;
    direction: TxDirection;
    amount: number; // تومان
    description: string | null;
    partyId: number | null;
    projectId: number | null;
    fromTreasuryAccountId: number | null;
    toTreasuryAccountId: number | null;
    legacy?: boolean; // ✅ اضافه شد
  }
): Promise<number> {
  const {
    companyId,
    date,
    direction,
    amount,
    description,
    partyId,
    projectId,
    fromTreasuryAccountId,
    toTreasuryAccountId,
    legacy = false, // ✅ از args میاد
  } = args;

  // ✅ قوانین کسب‌وکار باید THROW شوند، نه NextResponse
  if (direction === "IN" && !projectId) {
    throw httpError("برای ثبت دریافت از کارفرما، انتخاب پروژه الزامی است", 400);
  }

  // ✅ پرداخت پیمانکار بدون پروژه فقط در حالت legacy مجاز است
  if (direction === "OUT" && partyId && !projectId && !legacy) {
    throw httpError(
      "برای پرداخت پیمانکار، پروژه الزامی است. اگر مربوط به پروژه‌های قبل است، گزینه «قدیمی/بدون پروژه» را فعال کن.",
      400
    );
  }

  // refNo بعدی (ساده)
  const last = await tx.accountingVoucher.findFirst({
    orderBy: { id: "desc" },
    select: { refNo: true },
  });
  const lastNum = last?.refNo ? parseInt(last.refNo, 10) || 0 : 0;
  const refNo = String(lastNum + 1).padStart(5, "0");

  // حساب طرف حساب‌ها (AR/AP) - طبق ساختار فعلی شما
  const partyAcc = await tx.accountingAccount.findUnique({ where: { code: "9000" } });
  if (!partyAcc) throw httpError("حساب 9000 (طرف حساب‌ها) یافت نشد", 500);

  // گرفتن حسابداری حساب خزانه از روی TreasuryAccount
  async function treasuryToAccountingAccountId(treasuryAccountId: number) {
    const tAcc = await tx.treasuryAccount.findUnique({
      where: { id: treasuryAccountId },
      select: { accountingAccountId: true },
    });
    if (!tAcc) throw httpError(`TreasuryAccount با id=${treasuryAccountId} یافت نشد`, 500);
    if (!tAcc.accountingAccountId) throw httpError(`برای خزانه ${treasuryAccountId} حساب حسابداری تعریف نشده`, 500);
    return tAcc.accountingAccountId;
  }

  const amountDec = amount;

  // الگو:
  // IN : بدهکار خزانه مقصد، بستانکار طرف حساب‌ها
  // OUT: بدهکار طرف حساب‌ها، بستانکار خزانه مبدا
  // XFER: بدهکار خزانه مقصد، بستانکار خزانه مبدا
  let voucherType: any = "GENERAL";
  let items: Array<{
    accountId: number;
    debit: any;
    credit: any;
    description?: string;
    projectId?: number | null;
    partyId?: number | null;
  }> = [];

  if (direction === "IN") {
    if (!toTreasuryAccountId) throw httpError("برای دریافت (IN) باید toAccountId مشخص شود", 400);
    const toAccId = await treasuryToAccountingAccountId(toTreasuryAccountId);

    items = [
      { accountId: toAccId, debit: amountDec, credit: 0, description: "دریافت به خزانه", projectId, partyId },
      { accountId: partyAcc.id, debit: 0, credit: amountDec, description: "طرف حساب‌ها", projectId, partyId },
    ];
  } else if (direction === "OUT") {
    if (!fromTreasuryAccountId) throw httpError("برای پرداخت (OUT) باید fromAccountId مشخص شود", 400);
    const fromAccId = await treasuryToAccountingAccountId(fromTreasuryAccountId);

    items = [
      { accountId: partyAcc.id, debit: amountDec, credit: 0, description: "طرف حساب‌ها", projectId, partyId },
      { accountId: fromAccId, debit: 0, credit: amountDec, description: "پرداخت از خزانه", projectId, partyId },
    ];
  } else {
    voucherType = "TRANSFER";
    if (!fromTreasuryAccountId || !toTreasuryAccountId) {
      throw httpError("برای انتقال (XFER) باید fromAccountId و toAccountId مشخص شود", 400);
    }
    const fromAccId = await treasuryToAccountingAccountId(fromTreasuryAccountId);
    const toAccId = await treasuryToAccountingAccountId(toTreasuryAccountId);

    items = [
      { accountId: toAccId, debit: amountDec, credit: 0, description: "انتقال به حساب", projectId, partyId: null },
      { accountId: fromAccId, debit: 0, credit: amountDec, description: "انتقال از حساب", projectId, partyId: null },
    ];
  }

  const totalDebit = items.reduce((s, it) => s + Number(it.debit || 0), 0);
  const totalCredit = items.reduce((s, it) => s + Number(it.credit || 0), 0);

  const voucher = await tx.accountingVoucher.create({
    data: {
      companyId,
      projectId,
      date,
      refNo,
      type: voucherType,
      description: description ?? undefined,
      partyId: partyId ?? undefined,
      totalDebit,
      totalCredit,
    } as any,
    select: { id: true },
  });

  await tx.accountingVoucherItem.createMany({
    data: items.map((it) => ({
      voucherId: voucher.id,
      accountId: it.accountId,
      description: it.description ?? null,
      debit: it.debit,
      credit: it.credit,
      projectId: it.projectId ?? null,
      partyId: it.partyId ?? null,
    })) as any,
  });

  // ✅ حتماً عدد
  const voucherId = Number(voucher.id);
  if (!Number.isFinite(voucherId) || voucherId <= 0) throw httpError("voucherId نامعتبر است", 500);
  return voucherId;
}

export async function GET(req: Request) {
  try {
    const me = await getMeServer();
    if (!me) return new NextResponse("Unauthorized", { status: 401 });

    const companyId = Number(me.companyId);
    const { searchParams } = new URL(req.url);

    const take = Math.min(Math.max(Number(searchParams.get("take") || 100), 1), 500);

    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const accountIdStr = searchParams.get("accountId");
    const direction = searchParams.get("direction");
    const method = searchParams.get("method");

    const where: any = { companyId };

    if (fromStr) {
      const from = new Date(fromStr);
      if (!Number.isNaN(from.getTime())) where.date = { ...(where.date || {}), gte: from };
    }
    if (toStr) {
      const to = new Date(toStr);
      if (!Number.isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        where.date = { ...(where.date || {}), lte: to };
      }
    }

    if (direction) where.direction = String(direction).toUpperCase();
    if (method) where.method = String(method).toUpperCase();

    if (accountIdStr) {
      const accountId = Number(accountIdStr);
      if (Number.isFinite(accountId)) where.OR = [{ fromAccountId: accountId }, { toAccountId: accountId }];
    }

    const rows = await prisma.treasuryTransaction.findMany({
      where,
      orderBy: { date: "desc" },
      take,
      include: {
        party: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
        fromAccount: { select: { id: true, title: true, type: true } },
        toAccount: { select: { id: true, title: true, type: true } },
        partyBankAccount: { select: { id: true, title: true, bankName: true, cardNumber: true, iban: true } },
      },
    });

    return NextResponse.json(
      rows.map((t) => ({
        id: t.id,
        date: t.date.toISOString(),
        direction: t.direction,
        method: t.method,
        amount: Number(t.amount),
        fromAccount: t.fromAccount ? { id: t.fromAccount.id, title: t.fromAccount.title, type: t.fromAccount.type } : null,
        toAccount: t.toAccount ? { id: t.toAccount.id, title: t.toAccount.title, type: t.toAccount.type } : null,
        party: t.party ? { id: t.party.id, name: t.party.name } : null,
        project: t.project ? { id: t.project.id, title: t.project.title } : null,
        partyBankAccount: t.partyBankAccount
          ? {
              id: t.partyBankAccount.id,
              title: t.partyBankAccount.title,
              bankName: t.partyBankAccount.bankName,
              cardNumber: t.partyBankAccount.cardNumber,
              iban: t.partyBankAccount.iban,
            }
          : null,
        trackingNo: t.trackingNo ?? null,
        refNo: t.refNo ?? null,
        note: t.note ?? "",
        accountingVoucherId: t.accountingVoucherId ?? null,
      }))
    );
  } catch (e) {
    console.error(e);
    return new NextResponse("خطا در دریافت تراکنش‌های خزانه", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const me = await getMeServer();
    if (!me) return new NextResponse("Unauthorized", { status: 401 });

    const companyId = Number(me.companyId);
    const body = await req.json();
	const legacy = body.legacy === true || body.legacy === "true" || body.legacy === 1 || body.legacy === "1";

    const date = parseDate(body.date);

    const direction = normEnum(body.direction) as TxDirection;
    if (!["IN", "OUT", "XFER"].includes(direction)) {
      return new NextResponse("direction باید یکی از IN | OUT | XFER باشد", { status: 400 });
    }

    const method = normEnum(body.method || "TRANSFER") as TxMethod;
    if (!["CASH", "CARD", "TRANSFER", "CHEQUE"].includes(method)) {
      return new NextResponse("method نامعتبر است", { status: 400 });
    }

    const amount = mustPositiveInt(body.amount, "amount");

    const fromAccountId = body.fromAccountId != null ? mustInt(body.fromAccountId, "fromAccountId") : null;
    const toAccountId = body.toAccountId != null ? mustInt(body.toAccountId, "toAccountId") : null;

    const partyId = body.partyId != null ? mustInt(body.partyId, "partyId") : null;
    const projectId = body.projectId != null ? mustInt(body.projectId, "projectId") : null;

    const partyBankAccountId = body.partyBankAccountId != null ? mustInt(body.partyBankAccountId, "partyBankAccountId") : null;

    const trackingNo = safeStr(body.trackingNo, 100) || null;
    const refNo = safeStr(body.refNo, 100) || null;
    const note = safeStr(body.note ?? body.description, 1000) || null;

    const createVoucher =
      body.createVoucher !== undefined ? isTruthy(body.createVoucher) : method === "CHEQUE" ? false : true;

    // قوانین سخت
    if (direction === "IN") {
      if (!toAccountId) return new NextResponse("برای دریافت (IN) باید toAccountId مشخص شود", { status: 400 });
      if (fromAccountId) return new NextResponse("برای دریافت (IN)، fromAccountId نباید پر شود", { status: 400 });
    }
    if (direction === "OUT") {
      if (!fromAccountId) return new NextResponse("برای پرداخت (OUT) باید fromAccountId مشخص شود", { status: 400 });
      if (toAccountId) return new NextResponse("برای پرداخت (OUT)، toAccountId نباید پر شود", { status: 400 });
    }
    if (direction === "XFER") {
      if (!fromAccountId || !toAccountId) return new NextResponse("برای انتقال (XFER) باید fromAccountId و toAccountId مشخص شود", { status: 400 });
      if (fromAccountId === toAccountId) return new NextResponse("fromAccountId و toAccountId نباید برابر باشند", { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      await assertNotLocked(tx, companyId, date);

      const t = await tx.treasuryTransaction.create({
        data: {
          companyId,
          date,
          direction: direction as any,
          method: method as any,
          amount,
          fromAccountId,
          toAccountId,
          partyId,
          projectId,
          partyBankAccountId,
          trackingNo,
          refNo,
          note,
        },
      });

      let voucherId: number | null = null;
      if (createVoucher) {
        voucherId = await createVoucherForTreasuryTx(tx, {
          companyId,
          date,
          direction,
          amount,
          description: note,
          partyId,
          projectId,
          fromTreasuryAccountId: fromAccountId,
          toTreasuryAccountId: toAccountId,
        });
		
		if (direction === "OUT" && partyId && !projectId && !legacy) {
			throw httpError("پرداخت پیمانکار باید به پروژه وصل باشد (مگر قدیمی/بدون پروژه).", 400);
		}

        await tx.treasuryTransaction.update({
          where: { id: t.id },
          data: { accountingVoucherId: voucherId },
        });
      }

      return { transaction: t, accountingVoucherId: voucherId };
    });

    return NextResponse.json({ ok: true, ...created }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e?.message || "خطا در ثبت تراکنش خزانه", { status: e?.status || 500 });
  }
}
