"use client";

import { useEffect, useState } from "react";

type ContractorRow = {
  id: number;
  name: string;
  partyId: number;
  projectsCount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  level: "OK" | "WARNING" | "CRITICAL";
};

export default function ContractorsReportPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ContractorRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/management/contractors", {
          cache: "no-store",
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "خطا در دریافت گزارش پیمانکاران");
        }

        const data = await res.json();
        if (mounted) setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e.message || "خطای نامشخص");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-bold">گزارش پیمانکاران</h1>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">در حال بارگذاری…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-right">
                <th className="px-4 py-3">نام پیمانکار</th>
                <th className="px-4 py-3">تعداد پروژه</th>
                <th className="px-4 py-3">مبلغ قرارداد</th>
                <th className="px-4 py-3">پرداختی</th>
                <th className="px-4 py-3">مانده</th>
                <th className="px-4 py-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    موردی یافت نشد
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">{r.projectsCount}</td>
                    <td className="px-4 py-3">{r.totalAmount.toLocaleString("fa-IR")}</td>
                    <td className="px-4 py-3 text-emerald-600">{r.paidAmount.toLocaleString("fa-IR")}</td>
                    <td className="px-4 py-3 text-rose-600">{r.remainingAmount.toLocaleString("fa-IR")}</td>
                    <td className="px-4 py-3">
                      {r.level === "OK" && "عادی"}
                      {r.level === "WARNING" && "هشدار"}
                      {r.level === "CRITICAL" && "بحرانی"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
