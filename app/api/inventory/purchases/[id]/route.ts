// app/api/inventory/purchases/[id]/route.ts
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
async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function isoToDate(iso?: string) {
  if (!iso) return new Date();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
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
  if (x === "POS") return "CARD_TO_CARD" as any;
  if (x === "CARD_TO_CARD") return "CARD_TO_CARD" as any;
  if (x === "CARD") return "CARD" as any;
  if (x === "TRANSFER" || x === "BANK_TRANSFER") return "TRANSFER" as any;
  return "CASH" as any;
}

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

  const created = await tx.accountingAccount.create({
    data: {
      companyId,
      code,
      name: nameFa,
      type,
      isPosting: true,
      isActive: true,
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

  const pickedTreasuryId = payment?.fromAccountId ? Number(payment.fromAccountId) : null;
  if (pickedTreasuryId) {
    const ta = await tx.treasuryAccount.findFirst({
      where: { id: pickedTreasuryId, companyId, isActive: true },
      select: { id: true, accountingAccountId: true },
    });
    if (!ta) throw new Error("حساب خزانه انتخاب‌شده یافت نشد یا غیرفعال است.");
    if (!ta.accountingAccountId)
      throw new Error("برای این حساب خزانه، حساب معادل حسابداری تنظیم نشده است.");
    return { treasuryAccountId: ta.id, accountingAccountId: ta.accountingAccountId, method };
  }

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

  payment: {
    method: any;
    amount?: string | number;

    // ✅ TreasuryAccount.id
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

/* ===================== GET (single purchase) ===================== */
export async function GET(
  req: NextRequest,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);
  const { id } = await getParams(ctx);
  const purchaseId = mustInt(id);

  const v = await prisma.accountingVoucher.findFirst({
    where: { id: purchaseId, companyId, type: AccountingVoucherType.PURCHASE },
    include: {
      party: { select: { id: true, name: true } },
      warehouse: { select: { id: true, name: true } },
      project: { select: { id: true, title: true, code: true } },
      items: {
        orderBy: { id: "asc" },
        include: {
          product: { select: { id: true, name: true, sku: true, stockUnit: true } },
        },
      },
      treasuryPayments: {
        orderBy: { id: "desc" },
        select: { id: true, amount: true, method: true, createdAt: true, fromAccountId: true },
      },
    },
  });

  if (!v) {
    return NextResponse.json(
      { ok: false, message: "خرید یافت نشد." },
      { status: 404 }
    );
  }

  const itemsTotal = v.items.reduce((sum: Prisma.Decimal, it: any) => {
    const line = new Prisma.Decimal(it.qty || 0).mul(new Prisma.Decimal(it.unitPrice || 0));
    return sum.add(line);
  }, new Prisma.Decimal(0));

  const freight = new Prisma.Decimal((v as any).freightAmount || 0);
  const totalAmount = itemsTotal.add(freight);

  const paidAmount = (v.treasuryPayments || []).reduce((s: Prisma.Decimal, p: any) => {
    return s.add(new Prisma.Decimal(p.amount || 0));
  }, new Prisma.Decimal(0));

  const remaining = totalAmount.sub(paidAmount);
  const paymentStatus = paidAmount.equals(0)
    ? "UNPAID"
    : remaining.lte(0)
    ? "PAID"
    : "PARTIAL";

  return NextResponse.json({
    ok: true,
    purchase: {
      id: v.id,
      refNo: v.refNo,
      date: v.date,
      description: v.description,
      warehouseId: v.warehouseId,
      partyId: v.partyId,
      projectId: v.projectId,

      freightAmount: freight.toString(),
      freightToInventory: Boolean((v as any).freightToInventory),
      freightAccountId: (v as any).freightAccountId ?? null,

      totalAmount: totalAmount.toString(),
      paidAmount: paidAmount.toString(),
      remainingAmount: remaining.toString(),
      paymentStatus,

      items: v.items.map((it: any) => ({
        id: it.id,
        productId: it.productId,
        productName: it.product?.name,
        qty: it.qty?.toString?.() ?? String(it.qty ?? 0),
        unit: it.unit,
        unitPrice: it.unitPrice?.toString?.() ?? String(it.unitPrice ?? 0),
        note: it.description || "",
      })),

      payments: v.treasuryPayments,
    },
  });
}

/* ===================== PUT (edit + rollback) ===================== */
export async function PUT(
  req: NextRequest,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);
  const { id } = await getParams(ctx);
  const purchaseId = mustInt(id);

  const body = (await req.json()) as Body;

  try {
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

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.accountingVoucher.findFirst({
        where: { id: purchaseId, companyId, type: AccountingVoucherType.PURCHASE },
        include: { treasuryPayments: true },
      });
      if (!current) throw new Error("خرید یافت نشد.");

      // rollback پرداخت‌های قبلی
      await tx.treasuryPayment.deleteMany({ where: { voucherId: purchaseId } });

      // حذف آیتم‌های سند و بازسازی
      await tx.accountingVoucherItem.deleteMany({ where: { voucherId: purchaseId } });

      // حساب‌ها (auto-create)
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

      const pay = await resolvePaymentAccounts(tx, companyId, body.payment);

      // خطوط کالا
      const lines = await Promise.all(
        body.items.map(async (it) => {
          const product = await tx.product.findFirst({
            where: { id: Number(it.productId), companyId },
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

      await tx.accountingVoucher.update({
        where: { id: purchaseId },
        data: {
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
      });

      // بدهکار: موجودی
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

      // بستانکار: پرداخت
      if (paidNow.gt(0)) {
        await tx.accountingVoucherItem.create({
          data: {
            voucherId: purchaseId,
            accountId: pay.accountingAccountId,
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

      // بستانکار: مانده
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

    return NextResponse.json({ ok: true, purchase: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "خطا در ویرایش خرید" },
      { status: 400 }
    );
  }
}

/* ===================== DELETE (rollback + remove) ===================== */
export async function DELETE(
  req: NextRequest,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);
  const { id } = await getParams(ctx);
  const purchaseId = mustInt(id);

  try {
    await prisma.$transaction(async (tx) => {
      const v = await tx.accountingVoucher.findFirst({
        where: { id: purchaseId, companyId, type: AccountingVoucherType.PURCHASE },
        select: { id: true },
      });
      if (!v) throw new Error("خرید یافت نشد.");

      await tx.treasuryPayment.deleteMany({ where: { voucherId: purchaseId } });

      if ((tx as any).purchaseExtraCost?.deleteMany) {
        await (tx as any).purchaseExtraCost.deleteMany({ where: { voucherId: purchaseId } });
      }

      await tx.accountingVoucherItem.deleteMany({ where: { voucherId: purchaseId } });
      await tx.accountingVoucher.delete({ where: { id: purchaseId } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "حذف انجام نشد." },
      { status: 400 }
    );
  }
}

