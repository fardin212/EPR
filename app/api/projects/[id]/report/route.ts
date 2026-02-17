// app/api/projects/[id]/report/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

async function getParams(ctx: Ctx) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    const err: any = new Error(`${name} نامعتبر است`);
    err.status = 400;
    throw err;
  }
  return n;
}

function asFaDate(d?: Date | null) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium" }).format(d);
  } catch {
    return d.toISOString().split("T")[0];
  }
}

function money(n: number) {
  const x = Number(n || 0);
  return x.toLocaleString("fa-IR");
}

function boolTruthy(v: any) {
  return v === true || v === "true" || v === 1 || v === "1";
}

/**
 * GET /api/projects/[id]/report
 * query:
 * - format=json | pdf (default pdf)
 * - includeDraftInvoices=1  (default: false)
 */
export async function GET(req: Request, ctx: Ctx) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;

    const { id: idStr } = await getParams(ctx);
    const projectId = mustInt(idStr, "projectId");

    const url = new URL(req.url);
    const format = (url.searchParams.get("format") || "pdf").toLowerCase();
    const includeDraftInvoices = boolTruthy(url.searchParams.get("includeDraftInvoices"));

    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
      include: {
        stages: {
          include: {
            checklistItems: true,
            media: true,
          },
          orderBy: { order: "asc" },
        },
        stockMoves: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "پروژه یافت نشد" }, { status: 404 });
    }

    // ===================== مالی: فروش =====================
    const invoiceWhere: any = {
      companyId,
      projectId,
      deletedAt: null,
    };

    // اگر نخواهی draft بیاد، محدود کن
    if (!includeDraftInvoices) {
      // در سیستم شما status های زیادی هست؛ اینجا منطقی‌ترین فیلتر:
      // ISSUED / FINAL / PAID (DRAFT حذف)
      invoiceWhere.status = { in: ["ISSUED", "FINAL", "PAID"] as any };
    }

    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
      orderBy: { id: "desc" },
      select: {
        id: true,
        docType: true,
        status: true,
        docNo: true,
        date: true,
        total: true,
        partyId: true,
        customerName: true,
      },
    });

    const salesTotal = invoices.reduce((s, x) => s + Number(x.total || 0), 0);

    // ===================== مالی: دریافت/پرداخت خزانه (Transactions) =====================
    const txs = await prisma.treasuryTransaction.findMany({
      where: { companyId, projectId },
      orderBy: { date: "desc" },
      take: 200,
      select: {
        id: true,
        date: true,
        direction: true,
        method: true,
        amount: true,
        trackingNo: true,
        refNo: true,
        note: true,
      },
    });

    const txIn = txs.filter((t) => t.direction === ("IN" as any)).reduce((s, t) => s + Number(t.amount || 0), 0);
    const txOut = txs.filter((t) => t.direction === ("OUT" as any)).reduce((s, t) => s + Number(t.amount || 0), 0);

    // ===================== مالی: دریافت/پرداخت‌های وصل‌شده به اسناد (TreasuryPayment) =====================
    // (این‌ها مخصوصاً برای فاکتور خریدها/سندهای PURCHASE به کار میاد)
    const pays = await prisma.treasuryPayment.findMany({
      where: { companyId, projectId },
      orderBy: { date: "desc" },
      take: 200,
      select: {
        id: true,
        date: true,
        direction: true,
        method: true,
        amount: true,
        description: true,
        trackingNo: true,
        bankName: true,
      },
    });

    const payIn = pays.filter((p) => p.direction === ("IN" as any)).reduce((s, p) => s + Number(p.amount || 0), 0);
    const payOut = pays.filter((p) => p.direction === ("OUT" as any)).reduce((s, p) => s + Number(p.amount || 0), 0);

    // ===================== مالی: خرید (AccountingVoucher: PURCHASE) =====================
    const purchaseVouchers = await prisma.accountingVoucher.findMany({
      where: { companyId, projectId, type: "PURCHASE" as any },
      orderBy: { id: "desc" },
      take: 200,
      select: { id: true, refNo: true, date: true, description: true },
    });

    // مجموع خرید = جمع debit خطوطی که productId دارند
    const purchaseTotalAgg = await prisma.accountingVoucherItem.aggregate({
      where: {
        voucher: { companyId, projectId, type: "PURCHASE" as any },
        productId: { not: null },
      },
      _sum: { debit: true },
    });

    const purchaseTotal = Number((purchaseTotalAgg as any)?._sum?.debit || 0);

    // هزینه‌های اضافی خرید (حمل/جرثقیل/...)
    const extraCostAgg = await prisma.purchaseExtraCost.aggregate({
      where: {
        companyId,
        OR: [{ projectId }, { voucher: { projectId } }],
      },
      _sum: { amount: true },
    });

    const extraCosts = Number((extraCostAgg as any)?._sum?.amount || 0);

    // ===================== جمع‌بندی =====================
    const receivedTotal = txIn + payIn;
    const paidTotal = txOut + payOut;
    const costTotal = purchaseTotal + extraCosts + paidTotal; // خرید + هزینه‌های اضافه + پرداخت‌های خزانه (هزینه‌های متفرقه)
    const grossProfitLike = receivedTotal - (purchaseTotal + extraCosts); // دریافتی منهای خریدها (بدون هزینه‌های دیگر)
    const netProfitLike = receivedTotal - costTotal;

    const report = {
      project: {
        id: project.id,
        name: project.name,
        title: (project as any).title ?? null,
        code: project.code ?? null,
        customerName: (project as any).customerName ?? null,
        createdAt: (project as any).createdAt ?? null,
        startDate: (project as any).startDate ?? null,
        endDate: (project as any).endDate ?? null,
        status: (project as any).status ?? null,
      },
      sales: {
        invoicesCount: invoices.length,
        invoicesTotal: salesTotal,
        invoices: invoices.map((x) => ({
          id: x.id,
          docNo: x.docNo,
          docType: x.docType,
          status: x.status,
          date: x.date,
          total: Number(x.total || 0),
          customerName: x.customerName,
        })),
      },
      treasury: {
        transactions: {
          count: txs.length,
          in: txIn,
          out: txOut,
          last: txs.slice(0, 30),
        },
        payments: {
          count: pays.length,
          in: payIn,
          out: payOut,
          last: pays.slice(0, 30),
        },
      },
      purchases: {
        vouchersCount: purchaseVouchers.length,
        purchasesTotal: purchaseTotal,
        extraCostsTotal: extraCosts,
        vouchers: purchaseVouchers,
      },
      summary: {
        receivedTotal, // جمع دریافتی (transaction IN + payment IN)
        paidTotal, // جمع پرداختی (transaction OUT + payment OUT)
        purchaseTotal,
        extraCosts,
        costTotal,
        grossProfitLike,
        netProfitLike,
      },
      stages: project.stages,
      stockMoves: project.stockMoves,
      generatedAt: new Date(),
    };

    // JSON برای UI / debug
    if (format === "json") {
      return NextResponse.json(report);
    }

    // ===================== PDF =====================
    const stream = new PassThrough();
    const doc = new PDFDocument({ margin: 40 });

    doc.pipe(stream);

    // هدر
    doc.fontSize(18).text("گزارش کامل پروژه کانکس نیکان", { align: "center" }).moveDown(0.6);

    doc.fontSize(12).text(`پروژه: ${project.name}`, { align: "right" });
    if (project.code) doc.text(`کد پروژه: ${project.code}`, { align: "right" });
    doc.text(`تاریخ گزارش: ${asFaDate(new Date())}`, { align: "right" });

    doc.moveDown();

    // بخش مالی
    doc.fontSize(15).text("خلاصه مالی پروژه", { align: "right", underline: true });
    doc.moveDown(0.4);

    doc.fontSize(11).text(`جمع فروش (فاکتور فروش): ${money(salesTotal)} تومان`, { align: "right" });
    doc.fontSize(11).text(`جمع دریافتی (خزانه): ${money(receivedTotal)} تومان`, { align: "right" });
    doc.fontSize(11).text(`جمع خرید (ورود به انبار): ${money(purchaseTotal)} تومان`, { align: "right" });
    doc.fontSize(11).text(`هزینه‌های اضافی خرید (حمل/...): ${money(extraCosts)} تومان`, { align: "right" });
    doc.fontSize(11).text(`سایر پرداختی‌ها (خزانه): ${money(paidTotal)} تومان`, { align: "right" });

    doc.moveDown(0.4);
    doc.fontSize(12).text(`مانده تقریبی (دریافتی - کل هزینه): ${money(netProfitLike)} تومان`, {
      align: "right",
    });

    doc.moveDown();

    // فاکتورهای فروش
    doc.fontSize(14).text("فاکتورهای فروش مرتبط", { align: "right", underline: true });
    doc.moveDown(0.3);

    if (invoices.length === 0) {
      doc.fontSize(10).text("— فاکتور فروشی برای این پروژه ثبت نشده است.", { align: "right" });
    } else {
      invoices.slice(0, 30).forEach((inv, idx) => {
        doc
          .fontSize(10)
          .text(
            `${idx + 1}) ${inv.docNo} | ${asFaDate(inv.date)} | ${inv.status} | مبلغ: ${money(
              Number(inv.total || 0)
            )} تومان`,
            { align: "right" }
          );
      });
      if (invoices.length > 30) {
        doc.fontSize(9).text(`(+ ${invoices.length - 30} مورد دیگر)`, { align: "right" });
      }
    }

    doc.addPage();

    // مراحل پروژه
    doc.fontSize(16).text("مراحل و کنترل کیفیت (QC)", { align: "right" });
    doc.moveDown();

    project.stages.forEach((stage: any, index: number) => {
      doc
        .fontSize(13)
        .text(`${index + 1}. مرحله: ${stage.name} (وضعیت: ${stage.status})`, {
          align: "right",
          underline: true,
        });

      doc.fontSize(10).text(`شروع: ${asFaDate(stage.startedAt)}`, { align: "right" });
      doc.fontSize(10).text(`پایان: ${asFaDate(stage.finishedAt)}`, { align: "right" });

      doc.moveDown(0.4);

      if (stage.checklistItems?.length > 0) {
        doc.fontSize(11).text("چک‌لیست QC:", { align: "right" });

        stage.checklistItems.forEach((item: any) => {
          const line =
            `- ${item.title} [${item.status}]` + (item.note ? ` | توضیح: ${item.note}` : "");
          doc.fontSize(9).text(line, { align: "right" });
        });

        doc.moveDown(0.5);
      } else {
        doc.fontSize(9).text("— چک‌لیستی ثبت نشده است.", { align: "right" });
        doc.moveDown(0.5);
      }

      doc.moveDown(0.4);
    });

    // حرکت‌های انبار
    if (project.stockMoves?.length > 0) {
      doc.addPage();
      doc.fontSize(16).text("خلاصه حرکت‌های انبار پروژه", { align: "right" });
      doc.moveDown();

      project.stockMoves.slice(0, 200).forEach((m: any) => {
        doc.fontSize(9).text(
          `${m.date?.toISOString?.().split("T")[0] ?? ""} | ${m.moveType} | ${m.direction} | ` +
            `آیتم: ${m.itemId} | انبار: ${m.warehouseId} | مقدار: ${m.qty}`,
          { align: "right" }
        );
      });

      if (project.stockMoves.length > 200) {
        doc.fontSize(9).text(`(+ ${project.stockMoves.length - 200} مورد دیگر)`, { align: "right" });
      }
    }

    doc.end();

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="project-${projectId}-report.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("GET /api/projects/[id]/report error:", err);
    return NextResponse.json(
      { error: err?.message || "خطا در ساخت گزارش پروژه" },
      { status: err?.status || 500 }
    );
  }
}
