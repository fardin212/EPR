// app/api/invoices/[id]/finalize/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

/* ----------------- utils (هم‌سبک پروژه) ----------------- */
function mustInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    const err: any = new Error(`${name} نامعتبر است`);
    err.status = 400;
    throw err;
  }
  return n;
}

function num(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}
/* -------------------------------------------------------- */

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id: idStr } = await ctx.params;
    const invoiceId = mustInt(idStr, "invoiceId");

    const body = await req.json().catch(() => ({}));
    const warehouseId = body.warehouseId
      ? mustInt(body.warehouseId, "warehouseId")
      : null;

    const result = await prisma.$transaction(async (tx) => {
      /* ---------- Invoice ---------- */
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, companyId },
        include: { items: true },
      });
      if (!invoice) throw new Error("فاکتور یافت نشد");
      if (invoice.docType !== "INVOICE") throw new Error("این سند فاکتور فروش نیست");
      if (invoice.status !== "DRAFT") throw new Error("فقط فاکتور Draft قابل نهایی‌سازی است");

      // 🔒 قفل اصلی: فاکتور فروش بدون پروژه نباید نهایی شود
      if (!invoice.projectId) {
        const err: any = new Error(
          "برای نهایی‌سازی فاکتور فروش، ابتدا باید پروژه مشخص شود."
        );
        err.status = 400;
        throw err;
      }

      const items = invoice.items;
      if (!items.length) throw new Error("فاکتور آیتم ندارد");

      const hasProduct = items.some((i) => i.type === "PRODUCT");
      if (hasProduct && !warehouseId) {
        throw new Error("برای فاکتور کالایی، انبار الزامی است");
      }

      /* ---------- Accounting Accounts ---------- */
      const accAR = await tx.accountingAccount.findUnique({ where: { code: "9000" } });
      const accSales = await tx.accountingAccount.findUnique({ where: { code: "4100" } });
      const accVat =
        invoice.tax > 0
          ? await tx.accountingAccount.findUnique({ where: { code: "2100" } })
          : null;

      if (!accAR || !accSales) {
        throw new Error("حساب‌های حسابداری فروش کامل نیست (9000 / 4100)");
      }

      /* ---------- Voucher ---------- */
      const voucher = await tx.accountingVoucher.create({
        data: {
          companyId,
          date: invoice.date,
          refNo: `INV-${invoice.docNo}`,
          type: "SALE",
          description: `سند فروش فاکتور ${invoice.docNo}`,
          partyId: invoice.partyId,
          projectId: invoice.projectId, // 🔑 پروژه اینجا هم ست می‌شود
          totalDebit: invoice.total,
          totalCredit: invoice.total,
        },
      });

      await tx.accountingVoucherItem.createMany({
        data: [
          // بدهکار: مشتری
          {
            voucherId: voucher.id,
            accountId: accAR.id,
            debit: invoice.total,
            credit: 0,
            partyId: invoice.partyId,
            projectId: invoice.projectId,
          },
          // بستانکار: فروش
          {
            voucherId: voucher.id,
            accountId: accSales.id,
            debit: 0,
            credit: invoice.total - invoice.tax,
            partyId: invoice.partyId,
            projectId: invoice.projectId,
          },
          // بستانکار: مالیات
          ...(invoice.tax > 0 && accVat
            ? [
                {
                  voucherId: voucher.id,
                  accountId: accVat.id,
                  debit: 0,
                  credit: invoice.tax,
                  partyId: invoice.partyId,
                  projectId: invoice.projectId,
                },
              ]
            : []),
        ],
      });

      /* ---------- Stock OUT ---------- */
      if (hasProduct) {
        for (const it of items) {
          if (it.type !== "PRODUCT") continue;

          const qty = num(it.qty);
          const stock = await tx.stock.findUnique({
            where: {
              companyId_productId_warehouseId: {
                companyId,
                productId: it.productId!,
                warehouseId!,
              },
            },
          });
          if (!stock || stock.quantity < qty) {
            throw new Error(`موجودی کالا (${it.title}) کافی نیست`);
          }

          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity - qty },
          });

          const move = await tx.stockMove.create({
            data: {
              companyId,
              productId: it.productId!,
              warehouseId: warehouseId!,
              qty,
              direction: "OUT",
              reference: `INV:${invoice.docNo}`,
              invoiceId: invoice.id,
              projectId: invoice.projectId,
              date: invoice.date,
            },
          });

          await tx.stockMoveLine.create({
            data: {
              moveId: move.id,
              productId: it.productId!,
              qty,
              note: `خروج بابت فاکتور ${invoice.docNo}`,
            },
          });
        }
      }

      /* ---------- Finalize Invoice ---------- */
      const updated = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "FINAL",
          voucherId: voucher.id,
          warehouseId,
          finalizedAt: new Date(),
          finalizedById: me.id,
        },
      });

      return { invoiceId: updated.id, voucherId: voucher.id };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e.message || "خطا در نهایی‌سازی فاکتور", {
      status: e.status || 500,
    });
  }
}
