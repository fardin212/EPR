// app/api/purchases/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function num(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${name} نامعتبر است`);
  return n;
}
function mustInt(v: any, name: string) {
  const n = Math.trunc(Number(v));
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} نامعتبر است`);
  return n;
}
function mustPositive(v: any, name: string) {
  const n = num(v, name);
  if (n <= 0) throw new Error(`${name} باید بزرگتر از صفر باشد`);
  return n;
}
function mustNonNeg(v: any, name: string) {
  const n = num(v, name);
  if (n < 0) throw new Error(`${name} نباید منفی باشد`);
  return n;
}

function parseDate(v: any, name = "date") {
  const d = v ? new Date(v) : new Date();
  if (Number.isNaN(d.getTime())) throw new Error(`${name} نامعتبر است`);
  return d;
}

async function findAccountIdByCode(tx: Prisma.TransactionClient, companyId: number, code: string) {
  const acc = await tx.accountingAccount.findFirst({
    where: { companyId, code },
    select: { id: true },
  });
  if (!acc?.id) throw new Error(`کد حساب ${code} پیدا نشد (ابتدا ایجادش کن)`);
  return acc.id;
}

function cashOrBankCode(method: string) {
  const m = (method || "").toUpperCase();
  if (m === "BANK" || m === "TRANSFER" || m === "CARD") return "2000";
  return "1000"; // CASH
}

// refNo بعدی مثل 00001
async function nextRefNo(tx: Prisma.TransactionClient, companyId: number) {
  const last = await tx.accountingVoucher.findFirst({
    where: { companyId },
    orderBy: { id: "desc" },
    select: { refNo: true },
  });
  const lastNum = last?.refNo ? parseInt(last.refNo, 10) || 0 : 0;
  return String(lastNum + 1).padStart(5, "0");
}

/**
 * ✅ GET /api/purchases
 * لیست فاکتورهای خرید (سندهای PURCHASE)
 * query:
 * - take (default 50, max 200)
 * - skip (default 0)
 * - partyId
 * - projectId
 * - q (search in refNo/description/party.name)
 * - from (ISO date)
 * - to (ISO date)
 */
export async function GET(req: NextRequest) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { searchParams } = new URL(req.url);
    const take = Math.min(Math.max(parseInt(searchParams.get("take") || "50", 10) || 50, 1), 200);
    const skip = Math.max(parseInt(searchParams.get("skip") || "0", 10) || 0, 0);

    const partyId = searchParams.get("partyId") ? mustInt(searchParams.get("partyId"), "partyId") : null;
    const projectId = searchParams.get("projectId") ? mustInt(searchParams.get("projectId"), "projectId") : null;

    const q = (searchParams.get("q") || "").trim();
    const from = searchParams.get("from") ? parseDate(searchParams.get("from"), "from") : null;
    const to = searchParams.get("to") ? parseDate(searchParams.get("to"), "to") : null;

    const where: any = {
      companyId,
      type: "PURCHASE",
    };
    if (partyId) where.partyId = partyId;
    if (projectId) where.projectId = projectId;

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (q) {
      where.OR = [
        { refNo: { contains: q } },
        { description: { contains: q, mode: "insensitive" } },
        { party: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const vouchers = await prisma.accountingVoucher.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take,
      include: {
        party: { select: { id: true, name: true, kind: true, type: true } },
        project: { select: { id: true, title: true, name: true, code: true } },
        items: {
          orderBy: { id: "asc" },
          include: {
            product: { select: { id: true, sku: true, name: true } },
            account: { select: { id: true, code: true, name: true } },
          },
        },
        treasuryPayments: {
          orderBy: { id: "desc" },
          select: { id: true, amount: true, method: true, direction: true, createdAt: true },
        },
      },
    });

    const data = vouchers.map((v: any) => {
      const total = Number(v.totalDebit || 0);
      const paid = (v.treasuryPayments || [])
        .filter((t: any) => t.direction === "OUT")
        .reduce((s: number, t: any) => s + Number(t.amount || 0), 0);

      return {
        id: v.id,
        refNo: v.refNo,
        date: v.date,
        description: v.description,
        party: v.party,
        project: v.project,
        totalDebit: Number(v.totalDebit || 0),
        totalCredit: Number(v.totalCredit || 0),
        paidAmount: paid,
        remainder: Math.max(0, total - paid),
        items: (v.items || []).map((it: any) => ({
          id: it.id,
          accountId: it.accountId,
          account: it.account,
          description: it.description,
          debit: Number(it.debit || 0),
          credit: Number(it.credit || 0),
          productId: it.productId,
          product: it.product,
          extraCostShare: it.extraCostShare != null ? Number(it.extraCostShare) : null,
        })),
      };
    });

    return NextResponse.json({ items: data, take, skip });
  } catch (err: any) {
    console.error("GET /api/purchases error:", err);
    return NextResponse.json({ error: err?.message || "خطا در دریافت فاکتورهای خرید" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const body = await req.json();

    const date = parseDate(body.date, "date");
    const warehouseId = mustInt(body.warehouseId, "warehouseId"); // فعلاً نگه داشتیم
    const partyId = body.partyId ? mustInt(body.partyId, "partyId") : null; // تامین‌کننده

    // ✅ قفل نهایی خرید بدون پروژه
    const projectId = body.projectId ? mustInt(body.projectId, "projectId") : null;
    if (!projectId) {
      return new NextResponse("برای ثبت خرید، انتخاب پروژه الزامی است", { status: 400 });
    }

    const itemsRaw = Array.isArray(body.items) ? body.items : [];
    if (!itemsRaw.length) return new NextResponse("لیست اقلام خرید خالی است", { status: 400 });

    const payment = body.payment || {};
    const paidAmount = mustNonNeg(payment.paidAmount ?? 0, "payment.paidAmount");
    const payMethod = String(payment.method || "CASH").toUpperCase(); // CASH | CARD | TRANSFER | BANK
    const createTreasuryPayment = Boolean(payment.createTreasuryPayment ?? (paidAmount > 0));

    // حساب‌ها
    const INVENTORY_CODE = "1200"; // موجودی کالا
    const PARTY_CODE = "9000"; // طرف حساب‌ها

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

    const created = await prisma.$transaction(async (tx) => {
      const inventoryAccId = await findAccountIdByCode(tx, companyId, INVENTORY_CODE);
      const partyAccId = await findAccountIdByCode(tx, companyId, PARTY_CODE);
      const cashOrBankAccId =
        paidAmount > 0 ? await findAccountIdByCode(tx, companyId, cashOrBankCode(payMethod)) : null;

      const refNo = await nextRefNo(tx, companyId);
      const remainder = total - paidAmount;

      const voucher = await tx.accountingVoucher.create({
        data: {
          companyId,
          projectId, // ✅ اجباری
          date,
          refNo,
          type: "PURCHASE" as any,
          description: body.description ? String(body.description) : "خرید کالا و ورود به انبار",
          partyId: partyId ?? null,
        },
      });

      // بدهکار: موجودی کالا (1200) به تفکیک محصول (برای گزارش محصول/پروژه)
      const debitLines = items.map((it) => ({
        voucherId: voucher.id,
        accountId: inventoryAccId,
        description: it.note ? `خرید کالا - ${it.note}` : `خرید کالا`,
        debit: new Prisma.Decimal(it.lineTotal),
        credit: new Prisma.Decimal(0),
        projectId,
        partyId: partyId ?? null,
        productId: it.productId,

        // ✅ برای Edit/گزارش
        qty: new Prisma.Decimal(it.qty),
        unitPrice: new Prisma.Decimal(it.unitPrice),
      }));

      await tx.accountingVoucherItem.createMany({ data: debitLines });

      // بستانکار: اگر پرداخت انجام شده → صندوق/بانک
      if (paidAmount > 0 && cashOrBankAccId) {
        await tx.accountingVoucherItem.create({
          data: {
            voucherId: voucher.id,
            accountId: cashOrBankAccId,
            description: "پرداخت بابت خرید",
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(paidAmount),
            projectId,
            partyId: partyId ?? null,
          },
        });
      }

      // بستانکار: مانده پرداختنی تامین‌کننده → 9000
      if (remainder > 0) {
        await tx.accountingVoucherItem.create({
          data: {
            voucherId: voucher.id,
            accountId: partyAccId,
            description: "مانده پرداختنی تامین‌کننده",
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(remainder),
            projectId,
            partyId: partyId ?? null,
          },
        });
      }

      // جمع سند
      await tx.accountingVoucher.update({
        where: { id: voucher.id },
        data: {
          totalDebit: new Prisma.Decimal(total),
          totalCredit: new Prisma.Decimal(total),
        },
      });

      // (اختیاری) ساخت پرداخت خزانه (اگر در پروژه‌ات نیاز داری)
      if (createTreasuryPayment && paidAmount > 0) {
        await tx.treasuryPayment.create({
          data: {
            companyId,
            date,
            direction: "OUT" as any,
            method: (payMethod === "BANK" ? "TRANSFER" : payMethod) as any,
            amount: new Prisma.Decimal(paidAmount),
            partyId: partyId ?? null,
            projectId,
            description: "پرداخت بابت خرید",
            voucherId: voucher.id,
          },
        });
      }

      return voucher;
    });

    return NextResponse.json({ ok: true, voucherId: created.id });
  } catch (err: any) {
    console.error("POST /api/purchases error:", err);
    return NextResponse.json({ error: err?.message || "خطا در ثبت خرید" }, { status: 500 });
  }
}
