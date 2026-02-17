import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

type VoucherType =
  | "GENERAL"
  | "PURCHASE"
  | "SALE"
  | "EXPENSE"
  | "INCOME"
  | "TRANSFER"
  | "OPENING"
  | "ADJUSTMENT";

const ALLOWED_TYPES: VoucherType[] = [
  "GENERAL",
  "PURCHASE",
  "SALE",
  "EXPENSE",
  "INCOME",
  "TRANSFER",
  "OPENING",
  "ADJUSTMENT",
];

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

function parseId(raw: string) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseISODateOnly(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function parseAmount(v: any) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

/**
 * PATCH: ویرایش هدر سند حسابداری (تاریخ/نوع/شرح)
 * + اگر totalAmount داده شود و سند دقیقاً ۲ آیتمی باشد، debit/credit هم اصلاح می‌شود.
 */
export async function PATCH(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await getParams(ctx);
    const voucherId = parseId(id);
    if (!voucherId) return bad("شناسه سند نامعتبر است");

    const body = await req.json().catch(() => null);
    if (!body) return bad("بدنه درخواست نامعتبر است");

    const dateStr = String(body.date || "").trim();
    const typeStr = String(body.type || "").trim();
    const description =
      body.description === null || body.description === undefined
        ? null
        : String(body.description).trim();

    const date = parseISODateOnly(dateStr);
    if (!date) return bad("تاریخ نامعتبر است (فرمت صحیح: YYYY-MM-DD)");

    if (!ALLOWED_TYPES.includes(typeStr as VoucherType))
      return bad("نوع سند نامعتبر است");

    const totalAmount = parseAmount(body.totalAmount);
    if (
      body.totalAmount !== null &&
      body.totalAmount !== undefined &&
      body.totalAmount !== "" &&
      totalAmount === null
    ) {
      return bad("مبلغ نامعتبر است");
    }

    // وجود سند + آیتم‌ها
    const existing = await prisma.accountingVoucher.findUnique({
      where: { id: voucherId },
      include: { items: true },
    });

    if (!existing) return bad("سند یافت نشد", 404);

    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.accountingVoucher.update({
        where: { id: voucherId },
        data: {
          date,
          type: typeStr as any,
          description,
        } as any,
        include: { items: true },
      });

      // اگر مبلغ داده شده و سند ۲ آیتمی باشد
      if (totalAmount !== null) {
        const items = (v as any).items as Array<any> | undefined;

        if (items?.length === 2) {
          const [a, b] = items;

          const aDebit = Number(a.debit || 0);
          const aCredit = Number(a.credit || 0);

          const aIsDebit = aDebit >= aCredit;
          const debitItemId = aIsDebit ? a.id : b.id;
          const creditItemId = aIsDebit ? b.id : a.id;

          await tx.accountingVoucherItem.update({
            where: { id: debitItemId },
            data: { debit: totalAmount, credit: 0 },
          });

          await tx.accountingVoucherItem.update({
            where: { id: creditItemId },
            data: { debit: 0, credit: totalAmount },
          });
        }
      }

      return v;
    });

    return NextResponse.json({ ok: true, voucher: updated });
  } catch (e: any) {
    console.error("PATCH /api/accounting/vouchers/[id] failed:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "خطا در ویرایش سند", code: e?.code || "UNKNOWN" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: حذف سند حسابداری
 * ابتدا آیتم‌ها، سپس خود سند.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await getParams(ctx);
    const voucherId = parseId(id);
    if (!voucherId) return bad("شناسه سند نامعتبر است");

    await prisma.$transaction(async (tx) => {
      await tx.accountingVoucherItem.deleteMany({ where: { voucherId } });
      await tx.accountingVoucher.delete({ where: { id: voucherId } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/accounting/vouchers/[id] failed:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "خطا در حذف سند", code: e?.code || "UNKNOWN" },
      { status: 500 }
    );
  }
}
