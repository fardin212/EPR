// app/dashboard/management/reports/payroll/page.tsx
"use client";

import { useEffect, useState } from "react";

type PayrollRow = {
  id: number;
  employee: string;
  month: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "PAID" | "PARTIAL" | "UNPAID";
};

export default function PayrollReportPage() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    remaining: 0,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/reports/payroll");
      const json = await res.json();
      setRows(json.items || []);
      setSummary(json.summary || { total: 0, paid: 0, remaining: 0 });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">گزارش حقوق و دستمزد کارمندان</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="جمع حقوق ثبت‌شده" value={summary.total} />
        <SummaryCard title="پرداخت‌شده" value={summary.paid} color="green" />
        <SummaryCard title="مانده حقوق" value={summary.remaining} color="red" />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-right">کارمند</th>
              <th className="p-3 text-right">ماه</th>
              <th className="p-3 text-right">حقوق</th>
              <th className="p-3 text-right">پرداخت‌شده</th>
              <th className="p-3 text-right">مانده</th>
              <th className="p-3 text-right">وضعیت</th>
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
                  حقوقی ثبت نشده است
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-medium">{r.employee}</td>
                  <td className="p-3">{r.month}</td>
                  <td className="p-3">
                    {r.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-green-600">
                    {r.paidAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-red-600 font-semibold">
                    {r.remainingAmount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={r.status} />
                  </td>
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
      <div className={`text-2xl font-bold ${colorMap[color]}`}>
        {value.toLocaleString()} تومان
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PayrollRow["status"] }) {
  const map = {
    PAID: { text: "پرداخت کامل", cls: "bg-green-100 text-green-700" },
    PARTIAL: { text: "پرداخت ناقص", cls: "bg-amber-100 text-amber-700" },
    UNPAID: { text: "پرداخت نشده", cls: "bg-red-100 text-red-700" },
  }[status];

  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] ${map.cls}`}>
      {map.text}
    </span>
  );
}
