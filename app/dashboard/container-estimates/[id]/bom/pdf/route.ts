// app/dashboard/container-estimates/[id]/bom/pdf/route.ts
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

const UNIT_LABEL_FA: Record<string, string> = {
  KG: "کیلوگرم",
  BRANCH: "شاخه",
  PIECE: "عدد",
  M: "متر",
  M2: "متر مربع",
  LUMP_SUM: "مقطوع",
};
function unitLabelFa(u?: string | null) {
  if (!u) return "—";
  return UNIT_LABEL_FA[u] ?? u;
}
function normalizeMaterialName(name?: string | null) {
  if (!name) return "—";
  return String(name).replace(/ورق بدنه\s*23/g, "ورق بدنه 25");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const estimateId = Number(idStr);

  if (!Number.isFinite(estimateId) || estimateId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const bom = await prisma.containerEstimateBom.findFirst({
    where: { estimateId },
    include: {
      estimate: { include: { containerModel: true, sizePreset: true } },
      lines: { include: { material: true }, orderBy: { id: "asc" } },
    },
  });

  if (!bom) {
    return NextResponse.json({ message: "BOM not found" }, { status: 404 });
  }

  const est: any = (bom as any).estimate;

  // فونت فارسی از public/fonts
  const fontPath = path.join(process.cwd(), "public/fonts/Vazirmatn-Regular.ttf");
  const fontBytes = await readFile(fontPath);
  const fontB64 = fontBytes.toString("base64");

  const modelTitle =
    est?.containerModel?.title ?? est?.containerModel?.name ?? "-";
  const sizeTitle = est?.sizePreset?.title ?? "-";
  const dims =
    est?.length && est?.width && est?.height
      ? `${est.length} × ${est.width} × ${est.height}`
      : "-";

  const total = (bom as any).lines?.reduce(
    (s: number, l: any) => s + Number(l.lineTotal ?? 0),
    0
  );

  const rowsHtml = (bom as any).lines
    .map((l: any, idx: number) => {
      const name = normalizeMaterialName(l.materialName ?? l.material?.name);
      const qty = l.qty ?? 0;
      const unit =
        (l.qtyUnitCustom && String(l.qtyUnitCustom).trim()) ||
        unitLabelFa(l.qtyUnit);
      const unitPrice = moneyFa(l.unitPrice ?? 0);
      const lineTotal = moneyFa(l.lineTotal ?? 0);

      return `
        <tr>
          <td class="idx">${idx + 1}</td>
          <td class="name">${esc(name)}</td>
          <td class="qty">${esc(qty)}</td>
          <td class="unit">${esc(unit)}</td>
          <td class="num">${esc(unitPrice)}</td>
          <td class="num bold">${esc(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<style>
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
    --soft:#F9FAFB;
  }

  *{ box-sizing:border-box; }
  body{
    margin:0;
    font-family: Vazirmatn, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
    color:var(--text);
    background:#fff;
  }

  .page{
    width:210mm;
    min-height:297mm;
    padding: 12mm;
  }

  .card{
    border:1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    overflow:hidden;
  }

  .top{
    display:flex;
    justify-content:space-between;
    gap: 12px;
    align-items:flex-start;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }

  .title{
    font-size:18px;
    font-weight:900;
    margin:0;
  }
  .sub{
    margin-top:4px;
    color:var(--muted);
    font-size:12px;
  }

  .meta{
    text-align:left;
    color:var(--muted);
    font-size:12px;
    line-height:1.9;
    white-space:nowrap;
  }
  .meta b{ color:var(--text); }

  .grid{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
  }

  .box{
    border:1px solid var(--border);
    border-radius:12px;
    padding:10px;
    background:#fff;
    min-width:0;
  }
  .box h3{
    margin:0 0 8px 0;
    font-size:13px;
    font-weight:900;
  }
  .row{
    display:flex;
    justify-content:space-between;
    gap:10px;
    padding:5px 0;
    border-bottom: 1px dashed #F0F2F5;
    font-size:12px;
  }
  .row:last-child{ border-bottom:none; }
  .k{ color:var(--muted); }
  .v{ font-weight:800; max-width:70%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  .tableWrap{
    margin-top:10px;
    border:1px solid var(--border);
    border-radius:12px;
    overflow:hidden;
  }
  table{
    width:100%;
    border-collapse:collapse;
    font-size:12px;
  }
  thead th{
    background:var(--soft);
    border-bottom:1px solid var(--border);
    padding:10px;
    text-align:right;
    font-weight:900;
  }
  tbody td{
    padding:9px 10px;
    border-bottom: 1px solid #F1F5F9;
    vertical-align:middle;
  }
  tbody tr:last-child td{ border-bottom:none; }

  .idx{ width:8%; white-space:nowrap; }
  .name{ width:42%; font-weight:700; }
  .qty{ width:12%; white-space:nowrap; }
  .unit{ width:14%; white-space:nowrap; }
  .num{ width:12%; text-align:left; font-variant-numeric: tabular-nums; white-space:nowrap; }
  .bold{ font-weight:900; }

  .bottom{
    margin-top:10px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
  }
  .sum{
    border:1px solid var(--border);
    border-radius:12px;
    padding:10px 12px;
    font-size:13px;
    font-weight:900;
    display:flex;
    gap:10px;
    align-items:center;
  }
  .foot{
    color:var(--muted);
    font-size:11px;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="top">
        <div>
          <div class="title">خروجی ریزمصرف (BOM) – کانکس نیکان</div>
          <div class="sub">این خروجی جهت مصرف داخلی/کارگاه است.</div>
        </div>
        <div class="meta">
          <div><b>شماره پیش‌فاکتور:</b> ${esc(est?.id ?? estimateId)}</div>
          <div><b>تاریخ:</b> ${esc(toFaDate(new Date()))}</div>
          <div><b>وضعیت BOM:</b> ${esc((bom as any).status ?? "—")}</div>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <h3>اطلاعات مشتری</h3>
          <div class="row"><div class="k">نام</div><div class="v">${esc(est?.customerName ?? "—")}</div></div>
          <div class="row"><div class="k">موبایل</div><div class="v">${esc(est?.customerPhone ?? "—")}</div></div>
          <div class="row"><div class="k">محل پروژه</div><div class="v">${esc(est?.projectLocation ?? "—")}</div></div>
          <div class="row"><div class="k">کاربری</div><div class="v">${esc(est?.usageType ?? "—")}</div></div>
        </div>

        <div class="box">
          <h3>مشخصات کانکس</h3>
          <div class="row"><div class="k">مدل</div><div class="v">${esc(modelTitle)}</div></div>
          <div class="row"><div class="k">سایز</div><div class="v">${esc(sizeTitle)}</div></div>
          <div class="row"><div class="k">ابعاد</div><div class="v">${esc(dims)}</div></div>
          <div class="row"><div class="k">تعداد اقلام</div><div class="v">${esc((bom as any).lines?.length ?? 0)}</div></div>
        </div>
      </div>

      <div class="tableWrap">
        <table>
          <thead>
            <tr>
              <th class="idx">ردیف</th>
              <th class="name">مصالح</th>
              <th class="qty">مقدار</th>
              <th class="unit">واحد</th>
              <th class="num">قیمت واحد</th>
              <th class="num">جمع</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || ""}
          </tbody>
        </table>
      </div>

      <div class="bottom">
        <div class="sum">
          <span>جمع BOM:</span>
          <span class="num">${esc(moneyFa(total ?? 0))}</span>
          <span>تومان</span>
        </div>
        <div class="foot">کانکس نیکان • نسخه چاپی</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle" });

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
      "Content-Disposition": `inline; filename="bom-estimate-${estimateId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
