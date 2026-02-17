// app/dashboard/management/reports/expenses/page.tsx
"use client";

import { useEffect, useState } from "react";

type ExpenseRow = {
  type: "GENERAL" | "PERSONAL";
  date: string;
  amount: number;
  party: string;
  description: string;
};

export default function ExpensesReportPage() {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ general: 0, personal: 0 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/reports/expenses");
      const json = await res.json();
      setRows(json.items || []);
      setSummary(json.summary || { general: 0, personal: 0 });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">گزارش هزینه‌های عمومی و شخصی</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="جمع هزینه‌های عمومی"
          value={summary.general}
          color="blue"
        />
        <SummaryCard
          title="جمع هزینه‌های شخصی"
          value={summary.personal}
          color="red"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-right">تاریخ</th>
              <th className="p-3 text-right">نوع</th>
              <th className="p-3 text-right">طرف حساب</th>
              <th className="p-3 text-right">مبلغ</th>
              <th className="p-3 text-right">توضیح</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  هزینه‌ای ثبت نشده است
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">
                    {new Date(r.date).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        r.type === "GENERAL"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {r.type === "GENERAL" ? "عمومی" : "شخصی"}
                    </span>
                  </td>
                  <td className="p-3">{r.party}</td>
                  <td className="p-3 font-semibold">
                    {r.amount.toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-500">
                    {r.description || "-"}
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
  color,
}: {
  title: string;
  value: number;
  color: "blue" | "red";
}) {
  const colorMap = {
    blue: "text-blue-600",
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
