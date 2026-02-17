"use client";

import { useEffect, useMemo, useState } from "react";

type SupplierRow = {
  id: number;
  supplier: string;
  project: string;
  totalAmount: number | null;
  paidAmount: number | null;
  remainingAmount: number | null;
  date: string | null;
};

function toNum(v: any) {
  if (v === null || v === undefined) return 0;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(v: any) {
  return toNum(v).toLocaleString("fa-IR");
}

function fmtDateFa(v: any) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default function SuppliersReportPage() {
  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, paid: 0, remaining: 0 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/reports/suppliers", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));

        const items = Array.isArray(json?.items) ? json.items : [];

        // نرمال‌سازی: هرچی اومد رو عددی کن تا null / string ترکوندن نکنه
        const normalized: SupplierRow[] = items.map((r: any, idx: number) => ({
          id: Number(r?.id ?? idx + 1),
          supplier: String(r?.supplier ?? "—"),
          project: String(r?.project ?? "—"),
          totalAmount: r?.totalAmount ?? null,
          paidAmount: r?.paidAmount ?? null,
          remainingAmount: r?.remainingAmount ?? null,
          date: r?.date ?? null,
        }));

        setRows(normalized);

        setSummary({
          total: toNum(json?.summary?.total),
          paid: toNum(json?.summary?.paid),
          remaining: toNum(json?.summary?.remaining),
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const computedSummary = useMemo(() => {
    // اگر summary از API نیومده/صفر بود، از روی ردیف‌ها محاسبه کن
    if (summary.total || summary.paid || summary.remaining) return summary;

    const total = rows.reduce((a, r) => a + toNum(r.totalAmount), 0);
    const paid = rows.reduce((a, r) => a + toNum(r.paidAmount), 0);
    const remaining = rows.reduce((a, r) => a + toNum(r.remainingAmount), 0);
    return { total, paid, remaining };
  }, [rows, summary]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">گزارش خرید و بدهی تأمین‌کنندگان</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="جمع کل خرید" value={computedSummary.total} />
        <SummaryCard title="پرداخت‌شده" value={computedSummary.paid} color="green" />
        <SummaryCard title="مانده بدهی" value={computedSummary.remaining} color="red" />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-right">تاریخ</th>
              <th className="p-3 text-right">تأمین‌کننده</th>
              <th className="p-3 text-right">پروژه</th>
              <th className="p-3 text-right">مبلغ خرید</th>
              <th className="p-3 text-right">پرداخت‌شده</th>
              <th className="p-3 text-right">بدهی</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  خریدی ثبت نشده است
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{fmtDateFa(r.date)}</td>
                  <td className="p-3 font-medium">{r.supplier}</td>
                  <td className="p-3">{r.project}</td>
                  <td className="p-3">{fmtMoney(r.totalAmount)}</td>
                  <td className="p-3 text-green-600">{fmtMoney(r.paidAmount)}</td>
                  <td className="p-3 text-red-600 font-semibold">{fmtMoney(r.remainingAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color = "gray",
}: {
  title: string;
  value: number;
  color?: "gray" | "green" | "red";
}) {
  const colorMap = {
    gray: "text-gray-800",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-bold ${colorMap[color]}`}>{toNum(value).toLocaleString("fa-IR")} تومان</div>
    </div>
  );
}
