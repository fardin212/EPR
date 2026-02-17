"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toJalali } from "@/lib/date";

type DocType = "ALL" | "PROFORMA" | "INVOICE";
type Status = "ALL" | "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";

type InvoiceRow = {
  id: number;
  docType: "PROFORMA" | "INVOICE";
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
  docNo: string;
  date: string;
  dueDate: string | null;
  customerName: string;
  customerMobile: string | null;
  total: number;
};

function badgeColor(status: InvoiceRow["status"]) {
  switch (status) {
    case "DRAFT":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    case "ISSUED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function statusFa(s: InvoiceRow["status"]) {
  return s === "DRAFT" ? "پیش‌نویس"
    : s === "ISSUED" ? "صادر شده"
    : s === "PAID" ? "تسویه"
    : "باطل";
}

function docTypeFa(t: InvoiceRow["docType"]) {
  return t === "INVOICE" ? "فاکتور" : "پیش‌فاکتور";
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export default function InvoicesListClient() {
  const [items, setItems] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [docType, setDocType] = useState<DocType>("ALL");
  const [status, setStatus] = useState<Status>("ALL");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(() => isoDate(addDays(new Date(), -30)));
  const [to, setTo] = useState(() => isoDate(new Date()));
  const [take, setTake] = useState("50");

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (docType !== "ALL") sp.set("docType", docType);
    if (status !== "ALL") sp.set("status", status);
    if (q.trim()) sp.set("q", q.trim());
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    sp.set("take", take);
    return sp.toString();
  }, [docType, status, q, from, to, take]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices?${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      alert(e?.message || "خطا در دریافت لیست");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset() {
    setDocType("ALL");
    setStatus("ALL");
    setQ("");
    setFrom(isoDate(addDays(new Date(), -30)));
    setTo(isoDate(new Date()));
    setTake("50");
    setTimeout(load, 0);
  }

  return (
    <div className="rounded-3xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">لیست فاکتورها</h2>
        <div className="flex gap-2">
          <button className="btn2" onClick={load} disabled={loading}>
            {loading ? "در حال بارگذاری..." : "اعمال فیلتر"}
          </button>
          <button className="btn3" onClick={reset}>ریست</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="md:col-span-1">
          <label className="text-xs text-zinc-500">نوع سند</label>
          <select className="input mt-1" value={docType} onChange={(e) => setDocType(e.target.value as any)}>
            <option value="ALL">همه</option>
            <option value="PROFORMA">پیش‌فاکتور</option>
            <option value="INVOICE">فاکتور</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-zinc-500">وضعیت</label>
          <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="ALL">همه</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="ISSUED">صادر شده</option>
            <option value="PAID">تسویه</option>
            <option value="CANCELLED">باطل</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-zinc-500">جستجو</label>
          <input
            className="input mt-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="شماره سند، نام، موبایل..."
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-zinc-500">از</label>
          <input className="input mt-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-zinc-500">تا</label>
          <input className="input mt-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-zinc-500">تعداد</label>
          <select className="input mt-1" value={take} onChange={(e) => setTake(e.target.value)}>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="p-2 text-right">شماره</th>
              <th className="p-2 text-right">نوع</th>
              <th className="p-2 text-right">تاریخ</th>
              <th className="p-2 text-right">مشتری</th>
              <th className="p-2 text-right">مبلغ</th>
              <th className="p-2 text-right">وضعیت</th>
              <th className="p-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 font-bold">{r.docNo}</td>
                <td className="p-2">{docTypeFa(r.docType)}</td>
                <td className="p-2">{toJalali(r.date)}</td>
                <td className="p-2">
                  <div className="font-semibold">{r.customerName}</div>
                  <div className="text-xs text-zinc-500">{r.customerMobile || "—"}</div>
                </td>
                <td className="p-2">{Number(r.total).toLocaleString("fa-IR")} تومان</td>
                <td className="p-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${badgeColor(r.status)}`}>
                    {statusFa(r.status)}
                  </span>
                </td>
                <td className="p-2">
                  <Link className="text-emerald-700 underline" href={`/dashboard/invoices/${r.id}`}>
                    مشاهده
                  </Link>
                </td>
              </tr>
            ))}

            {!items.length && (
              <tr>
                <td className="p-4 text-zinc-500" colSpan={7}>
                  موردی برای نمایش وجود ندارد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx global>{`
        .input{ width:100%; border:1px solid #e4e4e7; padding:10px 12px; border-radius:16px; }
        .btn2{ border-radius:16px; padding:8px 12px; background:#111827; color:white; font-weight:700; }
        .btn3{ border-radius:16px; padding:8px 12px; background:#f4f4f5; color:#111827; font-weight:700; border:1px solid #e4e4e7; }
      `}</style>
    </div>
  );
}
