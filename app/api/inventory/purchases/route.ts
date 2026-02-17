// app/api/inventory/purchases/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  Prisma,
  AccountingVoucherType,
  PaymentDirection,
  PaymentMethod,
  UnitType,
  AccountingAccountType,
  TreasuryAccountType,
} from "@prisma/client";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================== Utils ===================== */

function isoToDate(iso?: string) {
  if (!iso) return new Date();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function dec(v: any) {
  if (v == null || v === "") return new Prisma.Decimal(0);
  return new Prisma.Decimal(String(v));
}

function safeStr(v: any, max = 500) {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function normalizePaymentMethod(m: any): PaymentMethod {
  const x = String(m || "CASH").toUpperCase().trim();

  // ✅ POS را به CARD_TO_CARD مپ می‌کنیم چون در enum شما POS ندارید
  if (x === "POS") return "CARD_TO_CARD" as any;
  if (x === "CARD_TO_CARD") return "CARD_TO_CARD" as any;
  if (x === "CARD") return "CARD" as any;
  if (x === "TRANSFER" || x === "BANK_TRANSFER") return "TRANSFER" as any;

  return "CASH" as any;
}

async function nextPurchaseRefNo(
  tx: Prisma.TransactionClient,
  companyId: number
) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");

  const prefix = `PUR-${y}${m}${d}`;

  const last = await tx.accountingVoucher.findFirst({
    where: {
      companyId,
      type: AccountingVoucherType.PURCHASE,
      refNo: { startsWith: prefix },
    },
    orderBy: { refNo: "desc" },
    select: { refNo: true },
  });

  let seq = 1;
  if (last?.refNo) {
    const n = Number(last.refNo.split("-").pop());
    if (!Number.isNaN(n)) seq = n + 1;
  }

  return `${prefix}-${String(seq).pad


async function ensureAccountId(
  tx: Prisma.TransactionClient,
  companyId: number,
  code: string,
  nameFa: string,
  type: AccountingAccountType
) {
  const existing = await tx.accountingAccount.findFirst({
    where: { companyId, code, isActive: true },
    select: { id: true },
  });
  if (existing) return existing.id;

  // ✅ در اسکیما: AccountingAccount فیلد "name" دارد (نه title)
  const created = await tx.accountingAccount.create({
    data: {
      companyId,
      code,
      name: nameFa,
      type,
      isPosting: true,
      isActive: true,
      // level اگر enum باشد، می‌گذاریم پیش‌فرضش اعمال شود (پس ارسال نمی‌کنیم)
    } as any,
    select: { id: true },
  });

  return created.id;
}

async function resolvePaymentAccounts(
  tx: Prisma.TransactionClient,
  companyId: number,
  payment: any
): Promise<{ treasuryAccountId: number; accountingAccountId: number; method: PaymentMethod }> {
  const method = normalizePaymentMethod(payment?.method);

  // 1) اگر کاربر حساب خزانه انتخاب کرده باشد
  const pickedTreasuryId = payment?.fromAccountId ? Number(payment.fromAccountId) : null;
  if (pickedTreasuryId) {
    const ta = await tx.treasuryAccount.findFirst({
      where: {
        id: pickedTreasuryId,
        companyId,
        isActive: true,
      },
      select: { id: true, accountingAccountId: true },
    });
    if (!ta) throw new Error("حساب خزانه انتخاب‌شده یافت نشد یا غیرفعال است.");
    if (!ta.accountingAccountId)
      throw new Error("برای این حساب خزانه، حساب معادل حسابداری تنظیم نشده است.");
    return { treasuryAccountId: ta.id, accountingAccountId: ta.accountingAccountId, method };
  }

  // 2) اگر انتخاب نشده بود: بر اساس روش پرداخت، یک پیش‌فرض انتخاب کنیم
  const preferCash =
    method === ("CASH" as any) ||
    method === ("PETTY_CASH" as any) ||
    method === ("CARD_TO_CARD" as any);

  const preferredTypes: TreasuryAccountType[] = preferCash
    ? (["CASH", "PETTY_CASH"] as any)
    : (["BANK"] as any);

  let ta = await tx.treasuryAccount.findFirst({
    where: { companyId, isActive: true, type: { in: preferredTypes as any } },
    orderBy: [{ type: "asc" }, { title: "asc" }],
    select: { id: true, accountingAccountId: true },
  });

  // fallback اگر از نوع دلخواه نبود، هر حساب فعالی را بردار
  if (!ta) {
    ta = await tx.treasuryAccount.findFirst({
      where: { companyId, isActive: true },
      orderBy: [{ type: "asc" }, { title: "asc" }],
      select: { id: true, accountingAccountId: true },
    });
  }

  if (!ta) throw new Error("هیچ حساب خزانه‌ای در سیستم تعریف نشده است.");
  if (!ta.accountingAccountId)
    throw new Error("برای حساب خزانه پیش‌فرض، حساب معادل حسابداری تنظیم نشده است.");

  return { treasuryAccountId: ta.id, accountingAccountId: ta.accountingAccountId, method };
}

/* ===================== Types ===================== */

type Body = {
  date?: string; // ISO
  warehouseId: number;
  partyId?: number;
  projectId?: number | null;
  description?: string;

  freightAmount?: string | number;
  freightToInventory?: boolean;
  freightAccountId?: number | null;

  payment?: {
    method?: any;
    amount?: string | number;

    // ✅ این در UI خزانه: TreasuryAccount.id است
    fromAccountId?: number | null;

    description?: string;
    bankName?: string | null;
    trackingNo?: string | null;
    ibanFrom?: string | null;
    ibanTo?: string | null;
    cardFrom?: string | null;
    cardTo?: string | null;
    toAccountText?: string | null;
  };

  items: Array<{
    productId: number;
    qty: string | number;
    unitPrice: string | number;
    note?: string;
  }>;
};

/* ===================== POST (create purchase voucher) ===================== */

export async function POST(req: NextRequest) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  try {
    const body = (await req.json().catch(() => ({}))) as Body;

    if (!body.items?.length) throw new Error("حداقل یک قلم خرید لازم است.");
    if (!body.warehouseId) throw new Error("انتخاب انبار الزامی است.");

    const projectId = body.projectId ? Number(body.projectId) : null;
    const partyId = body.partyId ? Number(body.partyId) : null;

    const date = isoToDate(body.date);

    const freight = dec(body.freightAmount || 0);
    const freightToInv = body.freightToInventory !== false;
    const freightAccountId = body.freightAccountId ? Number(body.freightAccountId) : null;

    if (freight.gt(0) && !freightToInv && !freightAccountId) {
      throw new Error("برای کرایه به‌عنوان هزینه، انتخاب «حساب هزینه کرایه» الزامی است.");
    }

    const paidNow = dec(body.payment?.amount || 0);
    if (paidNow.lt(0)) throw new Error("مبلغ پرداختی نامعتبر است.");

    const result = await prisma.$transaction(async (tx) => {
      // ✅ حساب‌های پایه (اگر نبودند ساخته می‌شوند)
      const invAccId = await ensureAccountId(
        tx,
        companyId,
        "INV",
        "موجودی کالا",
        "ASSET" as any
      );
      const apAccId = await ensureAccountId(
        tx,
        companyId,
        "AP",
        "بستانکاران / تامین‌کنندگان",
        "LIABILITY" as any
      );

      // ✅ پرداخت: TreasuryAccount + معادل حسابداری
      const pay = await resolvePaymentAccounts(tx, companyId, body.payment);

      // خطوط کالا
      const lines = await Promise.all(
        body.items.map(async (it) => {
          const productId = mustInt(it.productId, "کالا");
          const product = await tx.product.findFirst({
            where: { id: productId, companyId },
            select: { id: true, stockUnit: true },
          });
          if (!product) throw new Error("کالا یافت نشد.");

          const qty = dec(it.qty);
          const unitPrice = dec(it.unitPrice);
          if (qty.lte(0)) throw new Error("تعداد/مقدار باید بزرگ‌تر از صفر باشد.");
          if (unitPrice.lt(0)) throw new Error("قیمت واحد نامعتبر است.");

          const amount = qty.mul(unitPrice);
          const unit = (product.stockUnit as any) || (UnitType.PIECE as any);

          return {
            productId: product.id,
            qty,
            unit,
            unitPrice,
            amount,
            note: safeStr(it.note || "قلم خرید", 200),
          };
        })
      );

      const itemsTotal = lines.reduce((s, l) => s.add(l.amount), new Prisma.Decimal(0));
      const totalAmount = itemsTotal.add(freight);
      const remaining = Prisma.Decimal.max(totalAmount.sub(paidNow), new Prisma.Decimal(0));

      // ساخت voucher
      const voucher = await tx.accountingVoucher.create({
        data: {
          companyId,
          type: AccountingVoucherType.PURCHASE,
          date,
          warehouseId: Number(body.warehouseId),
          partyId: partyId || null,
          projectId: projectId || null,
          description: safeStr(body.description || "خرید انبار", 500),

          freightAmount: freight as any,
          freightToInventory: freightToInv,
          freightAccountId: freightToInv ? null : freightAccountId,

          totalDebit: totalAmount as any,
          totalCredit: totalAmount as any,
        } as any,
        select: { id: true },
      });

      const purchaseId = voucher.id;

      // بدهکار: موجودی (اقلام)
      for (const l of lines) {
        await tx.accountingVoucherItem.create({
          data: {
            voucherId: purchaseId,
            accountId: invAccId,
            debit: l.amount,
            credit: new Prisma.Decimal(0),
            description: l.note,
            productId: l.productId,
            qty: l.qty,
            unit: l.unit,
            unitPrice: l.unitPrice,
            partyId: partyId || undefined,
            projectId: projectId || undefined,
          } as any,
        });
      }

      // بدهکار: کرایه
      if (freight.gt(0)) {
        await tx.accountingVoucherItem.create({
          data: {
            voucherId: purchaseId,
            accountId: freightToInv ? invAccId : freightAccountId!,
            debit: freight,
            credit: new Prisma.Decimal(0),
            description: freightToInv
              ? "کرایه حمل (افزوده به موجودی)"
              : "هزینه کرایه حمل",
            partyId: partyId || undefined,
            projectId: projectId || undefined,
          } as any,
        });
      }

      // بستانکار: پرداخت آنی
      if (paidNow.gt(0)) {
        await tx.accountingVoucherItem.create({
          data: {
            voucherId: purchaseId,
            accountId: pay.accountingAccountId, // ✅ معادل حسابداریِ حساب خزانه
            debit: new Prisma.Decimal(0),
            credit: paidNow,
            description: safeStr(body.payment?.description || "پرداخت خرید", 500),
            partyId: partyId || undefined,
            projectId: projectId || undefined,
          } as any,
        });

        await tx.treasuryPayment.create({
          data: {
            companyId,
            direction: PaymentDirection.OUT,
            method: pay.method,
            amount: paidNow,
            description: safeStr(body.payment?.description || "پرداخت خرید", 500),
            voucherId: purchaseId,
            partyId: partyId || undefined,
            projectId: projectId || undefined,

            // ✅ اینجا خزانه: TreasuryAccount.id
            fromAccountId: pay.treasuryAccountId,

            bankName: body.payment?.bankName ?? null,
            trackingNo: body.payment?.trackingNo ?? null,
            ibanFrom: body.payment?.ibanFrom ?? null,
            ibanTo: body.payment?.ibanTo ?? null,
            cardFrom: body.payment?.cardFrom ?? null,
            cardTo: body.payment?.cardTo ?? null,
            toAccountText: body.payment?.toAccountText ?? null,
          } as any,
        });
      }

      // بستانکار: باقی‌مانده پرداختنی
      if (remaining.gt(0)) {
        if (!partyId) throw new Error("برای خرید دارای مانده، انتخاب تامین‌کننده الزامی است.");

        await tx.accountingVoucherItem.create({
          data: {
            voucherId: purchaseId,
            accountId: apAccId,
            debit: new Prisma.Decimal(0),
            credit: remaining,
            description: "باقی‌مانده پرداختنی",
            partyId,
            projectId: projectId || undefined,
          } as any,
        });
      }

      return { id: purchaseId };
    });

    return NextResponse.json({ ok: true, purchase: result });
  } catch (e: any) {
    console.error("POST /api/inventory/purchases error:", e);
    return NextResponse.json(
      { ok: false, message: e?.message || "خطا در ثبت خرید" },
      { status: 400 }
    );
  }
}
