// app/api/purchases/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================== Utils ===================== */

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است`);
  }
  return n;
}

function mustPositive(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} باید بزرگتر از صفر باشد`);
  return n;
}

function mustNonNeg(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} نامعتبر است`);
  return n;
}

function parseDate(v: any, name: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error(`${name} نامعتبر است`);
  return d;
}

function normalizePaymentMethod(method: string) {
  // در schema فقط این‌ها داریم: CASH/CARD/TRANSFER/CHEQUE
  const m = String(method || "CASH").toUpperCase();
  if (m === "POS" || m === "CARD_TO_CARD") return "CARD";
  if (m === "BANK" || m === "WIRE") return "TRANSFER";
  if (m === "CHECK") return "CHEQUE";
  if (m === "CASH" || m === "CARD" || m === "TRANSFER" || m === "CHEQUE") return m;
  return "CASH";
}

async function ensureVoucherExists(companyId: number, id: number) {
  const v = await prisma.accountingVoucher.findFirst({
    where: { id, companyId, type: "PURCHASE" as any },
    select: { id: true },
  });
  if (!v?.id) throw new Error("خرید پیدا نشد");
  return v.id;
}

/* ===================== GET ===================== */

export async function GET(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id: idStr } = await getParams(ctx);
    const id = mustInt(idStr);

    const v = await prisma.accountingVoucher.findFirst({
      where: { id, companyId, type: "PURCHASE" as any },
      include: {
        party: true,
        project: true,
        items: { include: { product: true, account: true } },
        treasuryPayments: true,
      },
    });

    if (!v) return NextResponse.json({ error: "خرید پیدا نشد" }, { status: 404 });

    const paid = (v.treasuryPayments || []).reduce((s, t) => s + Number(t.amount || 0), 0);
    const itemLines = (v.items || []).filter((x) => x.productId);
    const total = itemLines.reduce((s, it) => s + Number(it.debit || 0), 0);

    return NextResponse.json({
      id: v.id,
      refNo: v.refNo,
      date: v.date,
      description: v.description,
      partyId: v.partyId,
      party: v.party,
      projectId: v.projectId,
      project: v.project,
      total,
      paid,
      remainder: Math.max(0, total - paid),

      items: itemLines.map((it) => ({
        id: it.id,
        productId: it.productId,
        product: it.product,
        qty: it.qty ? Number(it.qty) : 0,
        unitPrice: it.unitPrice ? Number(it.unitPrice) : 0,
        unit: it.unit || null,
        note: it.description || "",
        lineTotal: Number(it.debit || 0),
      })),

      payments: (v.treasuryPayments || []).map((p) => ({
        id: p.id,
        amount: Number(p.amount || 0),
        method: p.method,
        direction: p.direction,
        date: p.date,
        fromAccountId: p.fromAccountId ?? null,
        toAccountText: p.toAccountText ?? null,
        trackingNo: p.trackingNo ?? null,
        bankName: p.bankName ?? null,
        cardFrom: p.cardFrom ?? null,
        cardTo: p.cardTo ?? null,
        ibanFrom: p.ibanFrom ?? null,
        ibanTo: p.ibanTo ?? null,
        createdAt: p.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("GET /api/purchases/[id] error:", err);
    return NextResponse.json({ error: err?.message || "خطا در دریافت خرید" }, { status: 500 });
  }
}

/* ===================== PATCH ===================== */

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id: idStr } = await getParams(ctx);
    const id = mustInt(idStr);

    await ensureVoucherExists(companyId, id);

    const body = await req.json();

    const date = parseDate(body.date, "date");
    const partyId = body.partyId ? mustInt(body.partyId, "partyId") : null;

    // ✅ قفل نهایی ویرایش بدون پروژه
    const projectId = body.projectId ? mustInt(body.projectId, "projectId") : null;
    if (!projectId) {
      return new NextResponse("برای ویرایش خرید، انتخاب پروژه الزامی است", { status: 400 });
    }

    const itemsRaw = Array.isArray(body.items) ? body.items : [];
    if (!itemsRaw.length) return new NextResponse("لیست اقلام خرید خالی است", { status: 400 });

    const payment = body.payment || {};
    const paidAmount = mustNonNeg(payment.paidAmount ?? 0, "payment.paidAmount");
    const payMethod = normalizePaymentMethod(payment.method || "CASH");
    const createTreasuryPayment = Boolean(payment.createTreasuryPayment ?? (paidAmount > 0));

    const cardTo = payment.cardTo ? String(payment.cardTo) : null;
    const ibanTo = payment.ibanTo ? String(payment.ibanTo) : null;
    const bankName = payment.bankName ? String(payment.bankName) : null;
    const trackingNo = payment.trackingNo ? String(payment.trackingNo) : null;
    const treasuryAccountId = payment.treasuryAccountId ? mustInt(payment.treasuryAccountId, "payment.treasuryAccountId") : null;

    const INVENTORY_CODE = "1200";
    const PARTY_CODE = "9000";
    const CASH_CODE = "1000";
    const BANK_CODE = "2000";

    const items = itemsRaw.map((it: any, idx: number) => {
      const productId = mustInt(it.productId, `items[${idx}].productId`);
      const qty = mustPositive(it.qty, `items[${idx}].qty`);
      const unitPrice = mustNonNeg(it.unitPrice ?? 0, `items[${idx}].unitPrice`);
      const note = (it.note || "").toString();
      const lineTotal = qty * unitPrice;
      return { productId, qty, unitPrice, note, lineTotal };
    });

    const total = items.reduce((s, x) => s + x.lineTotal, 0);
    if (total <= 0) return new NextResponse("جمع خرید باید بزرگتر از صفر باشد", { status: 400 });
    if (paidAmount > total) return new NextResponse("مبلغ پرداختی نمی‌تواند از جمع خرید بیشتر باشد", { status: 400 });

    await prisma.$transaction(async (tx) => {
      const findAcc = async (code: string) => {
        const a = await tx.accountingAccount.findFirst({
          where: { companyId, code },
          select: { id: true },
        });
        if (!a?.id) throw new Error(`حساب با کد ${code} پیدا نشد`);
        return a.id;
      };

      const inventoryAccId = await findAcc(INVENTORY_CODE);
      const partyAccId = await findAcc(PARTY_CODE);

      let cashOrBankAccId: number | null = null;
      if (paidAmount > 0) {
        if (treasuryAccountId) {
          const ta = await tx.treasuryAccount.findFirst({
            where: { companyId, id: treasuryAccountId, isActive: true },
            select: { accountingAccountId: true },
          });
          if (!ta?.accountingAccountId) throw new Error("حساب خزانه انتخاب‌شده معتبر نیست");
          cashOrBankAccId = ta.accountingAccountId;
        } else {
          const fallbackCode = payMethod === "CASH" ? CASH_CODE : BANK_CODE;
          cashOrBankAccId = await findAcc(fallbackCode);
        }
      }

      const remainder = total - paidAmount;

      const productIds = items.map((x) => x.productId);
      const prodUnits = await tx.product.findMany({
        where: { companyId, id: { in: productIds } },
        select: { id: true, stockUnit: true },
      });
      const unitMap = new Map<number, string | null>();
      for (const p of prodUnits) unitMap.set(p.id, p.stockUnit ? String(p.stockUnit) : null);

      // 1) آپدیت سند
      await tx.accountingVoucher.update({
        where: { id },
        data: {
          companyId,
          projectId, // ✅ اجباری
          date,
          type: "PURCHASE" as any,
          description: body.description ? String(body.description) : "خرید کالا و ورود به انبار",
          partyId: partyId ?? null,
        },
      });

      // 2) حذف آیتم‌های قبلی
      await tx.accountingVoucherItem.deleteMany({ where: { voucherId: id } });

      // 3) ایجاد آیتم‌های جدید
      const debitLines = items.map((it) => ({
        voucherId: id,
        accountId: inventoryAccId,
        description: it.note ? `خرید کالا - ${it.note}` : `خرید کالا`,
        debit: new Prisma.Decimal(it.lineTotal),
        credit: new Prisma.Decimal(0),
        projectId,
        partyId: partyId ?? null,
        productId: it.productId,

        qty: new Prisma.Decimal(it.qty),
        unitPrice: new Prisma.Decimal(it.unitPrice),
        unit: unitMap.get(it.productId) || null,
      }));

      await tx.accountingVoucherItem.createMany({ data: debitLines });

      // 4) پرداخت
      if (paidAmount > 0 && cashOrBankAccId) {
        await tx.accountingVoucherItem.create({
          data: {
            voucherId: id,
            accountId: cashOrBankAccId,
            description: "پرداخت بابت خرید",
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(paidAmount),
            projectId,
            partyId: partyId ?? null,
          },
        });
      }

      // 5) مانده
      if (remainder > 0) {
        await tx.accountingVoucherItem.create({
          data: {
            voucherId: id,
            accountId: partyAccId,
            description: "مانده پرداختنی تامین‌کننده",
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(remainder),
            projectId,
            partyId: partyId ?? null,
          },
        });
      }

      // totals
      await tx.accountingVoucher.update({
        where: { id },
        data: {
          totalDebit: new Prisma.Decimal(total),
          totalCredit: new Prisma.Decimal(total),
        },
      });

      // پرداخت خزانه: حذف قبلی‌ها + ساخت مجدد
      await tx.treasuryPayment.deleteMany({ where: { voucherId: id } });

      if (createTreasuryPayment && paidAmount > 0) {
        await tx.treasuryPayment.create({
          data: {
            companyId,
            date,
            direction: "OUT" as any,
            method: payMethod as any,
            amount: new Prisma.Decimal(paidAmount),
            partyId: partyId ?? null,
            projectId,
            description: "پرداخت بابت خرید",
            voucherId: id,
            fromAccountId: treasuryAccountId ?? null,
            toAccountText: null,
            cardTo,
            ibanTo,
            bankName,
            trackingNo,
          },
        });
      }
    });

    return NextResponse.json({ ok: true, voucherId: id });
  } catch (err: any) {
    console.error("PATCH /api/purchases/[id] error:", err);
    return NextResponse.json({ error: err?.message || "خطا در ویرایش خرید" }, { status: 500 });
  }
}

/* ===================== DELETE ===================== */

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id: idStr } = await getParams(ctx);
    const id = mustInt(idStr);

    await ensureVoucherExists(companyId, id);

    await prisma.$transaction(async (tx) => {
      await tx.treasuryPayment.deleteMany({ where: { companyId, voucherId: id } });
      await tx.purchaseExtraCost.deleteMany({ where: { companyId, voucherId: id } });
      await tx.projectCost.deleteMany({ where: { companyId, voucherId: id } });
      await tx.accountingVoucherItem.deleteMany({ where: { voucherId: id } });
      await tx.accountingVoucher.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/purchases/[id] error:", err);
    return NextResponse.json({ error: err?.message || "خطا در حذف خرید" }, { status: 500 });
  }
}
