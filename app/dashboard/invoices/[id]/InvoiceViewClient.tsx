"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toJalali } from "@/lib/date";

type Invoice = {
  id: number;
  docType: "PROFORMA" | "INVOICE";
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
  docNo: string;
  date: string;
  dueDate: string | null;

  customerName: string;
  customerMobile: string | null;
  customerPhone: string | null;
  customerAddress: string | null;

  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;

  deliveryTime: string | null;
  storagePenalty: string | null;
  transportTerms: string | null;
  notes: string | null;

  items: Array<{
    id: number;
    title: string;
    qty: number;
    unit: string | null;
    unitPrice: number;
    lineTotal: number;
    sortOrder: number;
    note: string | null;
  }>;

  spec: null | {
    dimensions: string | null;
    area: string | null;
    chassis: string | null;
    profile: string | null;
    bodySheet: string | null;
    roofSheet: string | null;
    interior: string | null;
    insulationType: string | null;

    floor: string | null;
    bodyColor: string | null;
    door: string | null;
    window: string | null;
    extras: string | null;
    strapSheet: string | null; // سیم‌کشی
    gutter: string | null;    // آبدارخانه
    service: string | null;
  };
};

// تومان دیتابیس → ریال نمایش
function tomanToRial(n: number) {
  return Math.round(Number(n || 0) * 10);
}
function moneyRial(nToman: number) {
  return tomanToRial(nToman).toLocaleString("fa-IR");
}

function statusFa(s: Invoice["status"]) {
  return s === "DRAFT" ? "پیش‌نویس" : s === "ISSUED" ? "صادر شده" : s === "PAID" ? "تسویه" : "باطل";
}
function docTypeFa(t: Invoice["docType"]) {
  return t === "INVOICE" ? "فاکتور" : "پیش‌فاکتور";
}

// عدد به حروف فارسی (برای ریال)
const FA_ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const FA_TENS = ["", "ده", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const FA_TEENS = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const FA_HUNDREDS = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const FA_SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

function threeDigitsToFaWords(n: number) {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;

  const parts: string[] = [];
  if (h) parts.push(FA_HUNDREDS[h]);

  const last2 = n % 100;
  if (last2) {
    if (last2 < 10) parts.push(FA_ONES[last2]);
    else if (last2 < 20) parts.push(FA_TEENS[last2 - 10]);
    else {
      if (t) parts.push(FA_TENS[t]);
      if (o) parts.push(FA_ONES[o]);
    }
  }

  return parts.filter(Boolean).join(" و ");
}

function numberToPersianWords(n: number) {
  n = Math.floor(Math.abs(Number(n || 0)));
  if (n === 0) return "صفر";

  const chunks: number[] = [];
  while (n > 0) {
    chunks.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const words: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (!chunk) continue;

    const chunkWords = threeDigitsToFaWords(chunk);
    const scale = FA_SCALES[i] || "";
    words.push(scale ? `${chunkWords} ${scale}` : chunkWords);
  }

  return words.join(" و ").trim();
}

function rialInWordsFromToman(amountToman: number) {
  const rial = tomanToRial(amountToman);
  return `${numberToPersianWords(rial)} ریال`;
}

export default function InvoiceViewClient({ id }: { id: number }) {
  const [inv, setInv] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setInv(data);
    } catch (e: any) {
      alert(e?.message || "خطا در دریافت فاکتور");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const specRows = useMemo(() => {
    const s = inv?.spec;
    return [
      { n: 1, label: "ابعاد", v: s?.dimensions },
      { n: 2, label: "متراژ", v: s?.area },
      { n: 3, label: "شاسی", v: s?.chassis },
      { n: 4, label: "پروفیل", v: s?.profile },
      { n: 5, label: "ورق بدنه", v: s?.bodySheet },
      { n: 6, label: "ورق سقف", v: s?.roofSheet },
      { n: 7, label: "داخل کار", v: s?.interior },
      { n: 8, label: "نوع عایق", v: s?.insulationType },
      { n: 9, label: "کف", v: s?.floor },
      { n: 10, label: "رنگ بدنه", v: s?.bodyColor },
      { n: 11, label: "درب", v: s?.door },
      { n: 12, label: "پنجره", v: s?.window },
      { n: 13, label: "لوازم اضافه", v: s?.extras },
      { n: 14, label: "سیم کشی", v: s?.strapSheet },
      { n: 15, label: "آبدارخانه", v: s?.gutter },
      { n: 16, label: "سرویس", v: s?.service },
    ];
  }, [inv]);

  async function setStatus(status: Invoice["status"]) {
    if (!inv) return;
    const res = await fetch(`/api/invoices/${inv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    await load();
  }

  async function deleteInvoice() {
    if (!inv) return;
    if (!confirm("فاکتور حذف شود؟ این عملیات قابل بازگشت است فقط توسط مدیر.")) return;

    const res = await fetch(`/api/invoices/${inv.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await res.text());
      return;
    }

    window.location.href = "/dashboard/invoices";
  }

  if (!inv) {
    return (
      <div className="rounded-3xl border bg-white p-4">
        <div className="font-bold">در حال بارگذاری…</div>
        <div className="text-sm text-zinc-500 mt-1">{loading ? "لطفاً صبر کنید" : ""}</div>
      </div>
    );
  }

  return (
    <div className="print-sheet space-y-4">
      {/* Header */}
      <div className="print-card rounded-3xl border bg-white p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold">
              {docTypeFa(inv.docType)} — {inv.docNo}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              تاریخ: {toJalali(inv.date)} {inv.dueDate ? ` | سررسید: ${toJalali(inv.dueDate)}` : ""}
            </p>
          </div>

          {/* این بخش در چاپ مخفی می‌شود */}
          <div className="print-hide flex gap-2 flex-wrap">
            <a
              href={`/dashboard/invoices/${inv.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-zinc-900 px-4 py-2 font-extrabold text-white hover:opacity-95"
            >
              چاپ A4 (PDF)
            </a>

            {/* ✅ دکمه ویرایش */}
            <Link
              href={`/dashboard/invoices/${inv.id}/edit`}
              className="rounded-2xl bg-blue-600 px-4 py-2 font-extrabold text-white hover:opacity-95"
            >
              ویرایش فاکتور
            </Link>

            <Link href="/dashboard/invoices" className="rounded-2xl border px-4 py-2 font-extrabold hover:bg-zinc-50">
              برگشت به لیست
            </Link>
          </div>
        </div>

        {/* وضعیت و دکمه‌ها (در چاپ مخفی) */}
        <div className="print-hide mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-zinc-500">وضعیت:</span>

          <span className="rounded-full border px-3 py-1 text-sm font-extrabold">{statusFa(inv.status)}</span>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={deleteInvoice}
              className="rounded-2xl bg-rose-600 text-white px-4 py-2 font-extrabold hover:opacity-95"
            >
              حذف فاکتور
            </button>
            <button className="btn2" onClick={() => setStatus("DRAFT")}>پیش‌نویس</button>
            <button className="btn2" onClick={() => setStatus("ISSUED")}>صادر شده</button>
            <button className="btn2" onClick={() => setStatus("PAID")}>تسویه</button>
            <button className="btnDanger" onClick={() => setStatus("CANCELLED")}>باطل</button>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="print-card rounded-3xl border bg-white p-4">
        <h2 className="font-extrabold mb-3">اطلاعات خریدار</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Info label="نام/شرکت" value={inv.customerName} />
          <Info label="همراه" value={inv.customerMobile || "—"} />
          <Info label="تلفن" value={inv.customerPhone || "—"} />
          <Info label="آدرس" value={inv.customerAddress || "—"} />
        </div>
      </div>

      {/* Spec */}
      <div className="print-card rounded-3xl border bg-white p-4">
        <h2 className="font-extrabold mb-3">مشخصات فنی</h2>

        <div className="spec-grid">
          {specRows.map((r) => (
            <div key={r.n} className="rounded-2xl border p-3 spec-item">
              <div className="flex items-center justify-between gap-2">
                <div className="font-extrabold min-w-0">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs ml-2 shrink-0">
                    {r.n}
                  </span>
                  {r.label}
                </div>
                <div className="text-sm text-zinc-700 text-right">{r.v || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="print-card rounded-3xl border bg-white p-4">
        <h2 className="font-extrabold mb-3">آیتم‌های قیمت</h2>

        <div className="overflow-auto rounded-2xl border">
          <table className="w-full text-sm invoice-table">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="p-2">مبلغ (ریال)</th>
                <th className="p-2">قیمت واحد (ریال)</th>
                <th className="p-2">واحد</th>
                <th className="p-2">تعداد</th>
                <th className="p-2">شرح</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2 font-extrabold ltr-num">{moneyRial(it.lineTotal)}</td>
                  <td className="p-2 ltr-num">{moneyRial(it.unitPrice)}</td>
                  <td className="p-2">{it.unit || "—"}</td>
                  <td className="p-2 ltr-num">{Number(it.qty || 0).toLocaleString("fa-IR")}</td>
                  <td className="p-2">
                    <div className="font-semibold">{it.title}</div>
                    {it.note ? <div className="text-xs text-zinc-500 mt-0.5">{it.note}</div> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-zinc-50 p-3">
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">جمع جزء</span>
              <span className="font-extrabold ltr-num">{moneyRial(inv.subtotal)} ریال</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">تخفیف</span>
              <span className="font-extrabold ltr-num">{moneyRial(inv.discount)} ریال</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">حمل</span>
              <span className="font-extrabold ltr-num">{moneyRial(inv.shipping)} ریال</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">مالیات</span>
              <span className="font-extrabold ltr-num">{moneyRial(inv.tax)} ریال</span>
            </div>

            <div className="flex justify-between py-2 border-t mt-2">
              <span className="text-zinc-700 font-extrabold">جمع کل</span>
              <span className="text-emerald-700 font-extrabold ltr-num">{moneyRial(inv.total)} ریال</span>
            </div>

            <div className="mt-2 rounded-xl border bg-white p-2">
              <div className="text-xs text-zinc-500">مبلغ به حروف (ریال)</div>
              <div className="mt-1 text-sm font-extrabold">{rialInWordsFromToman(inv.total)}</div>
            </div>
          </div>

          <div className="rounded-2xl border p-3 print-terms">
            <div className="text-xs text-zinc-500">شرایط</div>
            <div className="mt-2 space-y-2 text-sm">
              <div><span className="font-extrabold">زمان تحویل:</span> {inv.deliveryTime || "—"}</div>
              <div><span className="font-extrabold">حمل:</span> {inv.transportTerms || "—"}</div>
              <div><span className="font-extrabold">انبارداری/تاخیر:</span> {inv.storagePenalty || "—"}</div>
            </div>

            <div className="mt-3">
              <div className="text-xs text-zinc-500">توضیحات</div>
              <div className="mt-1 text-sm whitespace-pre-wrap">{inv.notes || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .btn2 {
          border-radius: 16px;
          padding: 8px 12px;
          background: #111827;
          color: white;
          font-weight: 900;
        }
        .btnDanger {
          border-radius: 16px;
          padding: 8px 12px;
          background: #ef4444;
          color: white;
          font-weight: 900;
        }

        .invoice-table { direction: rtl; }
        .invoice-table th, .invoice-table td { text-align: right; white-space: nowrap; }
        .invoice-table td:last-child { white-space: normal; }

        .ltr-num {
          direction: ltr;
          unicode-bidi: plaintext;
          text-align: left;
        }

        @media print {
          .print-hide { display: none !important; }
          .print-sheet { background: white !important; }
          .print-card { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="font-extrabold mt-1">{value}</div>
    </div>
  );
}
