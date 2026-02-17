// app/dashboard/container-estimates/[id]/pdf/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

function toFaDate(d: Date) {
  return d.toLocaleDateString("fa-IR");
}
function moneyFa(v: bigint | number | null | undefined) {
  const n = typeof v === "bigint" ? Number(v) : Number(v ?? 0);
  return Math.round(n).toLocaleString("fa-IR");
}
function esc(s: any) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const est = await prisma.containerEstimate.findUnique({
    where: { id },
    include: {
      containerModel: true,
      sizePreset: true,
      displayItems: { orderBy: { sortOrder: "asc" } },
      extras: { orderBy: { id: "asc" } },
    },
  });

  if (!est) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // فونت فارسی از public/fonts
  const fontPath = path.join(process.cwd(), "public/fonts/Vazirmatn-Regular.ttf");
  const fontBytes = await readFile(fontPath);
  const fontB64 = fontBytes.toString("base64");

  const modelTitle =
    (est.containerModel as any)?.title ??
    (est.containerModel as any)?.name ??
    "-";

  const sizeTitle = est.sizePreset?.title ?? "-";
  const dims = `${est.length} × ${est.width} × ${est.height}`;

  const items = est.displayItems?.length
    ? est.displayItems.map((x) => ({
        title: x.title,
        amount: x.amount,
      }))
    : [
        { title: "جمع مصالح", amount: est.materialsTotal },
        { title: "هزینه‌های دستی", amount: est.extrasTotal },
        { title: "سود", amount: est.profitAmount },
      ];

  // ✅ HTML فاکتور (RTL + طراحی) — چاپ دقیق A4 بدون کات
  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  /* ✅ صفحه را با CSS تعریف می‌کنیم؛ margin چاپ از اینجا کنترل می‌شود */
  @page { size: A4; margin: 0; }
  html, body { width: 210mm; height: 297mm; }

  @font-face{
    font-family: Vazirmatn;
    src: url(data:font/ttf;base64,${fontB64}) format("truetype");
    font-weight: 400;
    font-style: normal;
  }
  :root{
    --border:#E5E7EB;
    --muted:#6B7280;
    --text:#111827;
    --bg:#ffffff;
    --soft:#F9FAFB;
  }
  *{box-sizing:border-box}
  body{
    font-family: Vazirmatn, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
    background: var(--bg);
    color: var(--text);
    margin: 0;
  }

  /* ✅ کل layout داخل safe-area کنترل میشه */
  .page{
    width: 210mm;
    min-height: 297mm;
    padding: 12mm;  /* ✅ کمی کمتر از قبل برای اطمینان */
  }

  .card{
    border:1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    overflow: hidden; /* ✅ جلوگیری از بیرون‌زدگی */
  }

  .header{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .brand h1{
    margin:0;
    font-size: 20px;
    font-weight: 700;
  }
  .brand .sub{
    margin-top: 4px;
    color: var(--muted);
    font-size: 12px;
  }
  .meta{
    text-align:left;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.9;
    white-space: nowrap;
  }
  .meta b{ color: var(--text); font-weight:700 }

  .grid{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 12px;
  }

  .box{
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    background: #fff;
    min-width: 0;
  }
  .box h2{
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 800;
  }
  .row{
    display:flex;
    justify-content:space-between;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px dashed #F0F2F5;
    font-size: 12.5px;
  }
  .row:last-child{border-bottom:none}
  .k{color:var(--muted)}
  .v{font-weight:700; max-width: 70%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}

  .tableWrap{
    margin-top: 12px;
    border:1px solid var(--border);
    border-radius: 12px;
    overflow:hidden;
  }
  table{
    width:100%;
    border-collapse:collapse;
    font-size: 12.5px;
  }
  thead th{
    background: var(--soft);
    text-align:right;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    font-weight: 800;
  }
  tbody td{
    padding: 10px 12px;
    border-bottom: 1px solid #F1F5F9;
    vertical-align:top;
  }
  tbody tr:last-child td{border-bottom:none}
  .num{ text-align:left; white-space:nowrap; font-variant-numeric: tabular-nums; }

  .summary{
    margin-top: 12px;
    display:grid;
    grid-template-columns: 1.2fr .8fr;
    gap: 12px;
    align-items: start;
  }
  .terms{
    border:1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    background: #fff;
    color: #111827;
    font-size: 12px;
    line-height: 1.9;
    min-width: 0;
  }
  .totalCard{
    border:1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    background: #fff;
    min-width: 0;
  }
  .grand{
    display:flex;
    justify-content:space-between;
    gap: 10px;
    padding: 10px 0;
    font-size: 14px;
    font-weight: 900;
  }
  .grand .num{font-size: 16px}
  .footer{
    margin-top: 10px;
    color: var(--muted);
    font-size: 11px;
    display:flex;
    justify-content:space-between;
    gap: 10px;
  }

  /* ✅ اگر عرض کم شد (یا اطلاعات زیاد شد) به ۱ ستون تبدیل کن تا کات نشه */
  @media print {
    .grid { grid-template-columns: 1fr 1fr; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="header">
        <div class="brand">
          <h1>پیش‌فاکتور کانکس نیکان</h1>
          <div class="sub">این سند جهت اعلام قیمت است و پس از تایید، قرارداد تنظیم می‌گردد.</div>
        </div>
        <div class="meta">
          <div><b>شماره:</b> ${esc(est.id)}</div>
          <div><b>تاریخ:</b> ${esc(toFaDate(new Date(est.createdAt)))}</div>
          <div><b>اعتبار تا:</b> ${esc(est.validUntil ? toFaDate(new Date(est.validUntil)) : "-")}</div>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <h2>اطلاعات مشتری</h2>
          <div class="row"><div class="k">نام</div><div class="v">${esc(est.customerName)}</div></div>
          <div class="row"><div class="k">موبایل</div><div class="v">${esc(est.customerPhone)}</div></div>
          <div class="row"><div class="k">محل پروژه</div><div class="v">${esc(est.projectLocation ?? "-")}</div></div>
          <div class="row"><div class="k">کاربری</div><div class="v">${esc(est.usageType ?? "-")}</div></div>
        </div>

        <div class="box">
          <h2>مشخصات کانکس</h2>
          <div class="row"><div class="k">مدل</div><div class="v">${esc(modelTitle)}</div></div>
          <div class="row"><div class="k">سایز</div><div class="v">${esc(sizeTitle)}</div></div>
          <div class="row"><div class="k">ابعاد</div><div class="v">${esc(dims)}</div></div>
          <div class="row"><div class="k">نوع پیش‌فاکتور</div><div class="v">${esc(est.estimateType)}</div></div>
        </div>
      </div>

      <div class="tableWrap">
        <table>
          <thead>
            <tr>
              <th style="width:70%">شرح</th>
              <th class="num" style="width:30%">مبلغ (تومان)</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (it) => `
              <tr>
                <td>${esc(it.title)}</td>
                <td class="num">${esc(moneyFa(it.amount))}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="summary">
        <div class="terms">
          <b>شرایط و توضیحات:</b><br/>
          • زمان تحویل: ${esc(est.deliveryDays ?? "-")} روز<br/>
          • شرایط پرداخت: ${esc(est.paymentTerms ?? "-")}<br/>
          • گارانتی: ${esc(est.warrantyTerms ?? "-")}<br/>
          • حمل: ${esc(est.transportTerms ?? "-")}<br/>
          • توضیحات: ${esc(est.notesForCustomer ?? "-")}
        </div>

        <div class="totalCard">
          <div class="grand">
            <div>مبلغ نهایی</div>
            <div class="num">${esc(moneyFa(est.finalPrice))}</div>
          </div>
          <div class="footer">
            <div>کانکس نیکان</div>
            <div>تماس: 09121332960</div>
          </div>
        </div>
      </div>

      <div class="footer" style="margin-top:14px;">
        <div>واتساپ: 09389923000</div>
        <div>این سند بدون مهر و امضا نیز معتبر است (نسخه دیجیتال)</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  // --- Render PDF via Playwright ---
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // ✅ برای لینوکس/سرور
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle" });

  // ✅ margin چاپ صفر + استفاده از @page CSS
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    preferCSSPageSize: true,
  });

  await browser.close();

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="estimate-${est.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
