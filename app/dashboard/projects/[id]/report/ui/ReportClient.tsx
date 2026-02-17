"use client";

import Link from "next/link";
import { useMemo } from "react";

function money(n: any) {
  const x = Number(n || 0);
  return x.toLocaleString("fa-IR");
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}

function Table({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: { key: string; label: string; className?: string }[];
  rows: any[];
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-400">نمایش تا ۳۰ ردیف</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`whitespace-nowrap px-4 py-3 text-right font-medium ${c.className || ""}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows?.length ? (
              rows.slice(0, 30).map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`whitespace-nowrap px-4 py-3 text-slate-800 ${c.className || ""}`}
                    >
                      {String(r?.[c.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  داده‌ای وجود ندارد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportClient({
  projectId,
  data,
}: {
  projectId: number;
  data: any;
}) {
  const summary = data?.summary || {};
  const sales = data?.sales || {};
  const purchases = data?.purchases || {};
  const tre = data?.treasury || {};
  const proj = data?.project || {};

  const net = Number(summary.netProfitLike || 0);
  const netLabel = net >= 0 ? "سود خالص تقریبی" : "زیان خالص تقریبی";

  const invoicesRows = useMemo(() => {
    const invs = sales?.invoices || [];
    return invs.map((x: any) => ({
      docNo: x.docNo,
      status: x.status,
      date: x.date ? new Date(x.date).toLocaleDateString("fa-IR") : "—",
      total: money(x.total),
      customerName: x.customerName || "—",
    }));
  }, [sales]);

  const txRows = useMemo(() => {
    const last = tre?.transactions?.last || [];
    return last.map((t: any) => ({
      date: t.date ? new Date(t.date).toLocaleDateString("fa-IR") : "—",
      direction: t.direction,
      method: t.method,
      amount: money(t.amount),
      refNo: t.refNo || "—",
      trackingNo: t.trackingNo || "—",
    }));
  }, [tre]);

  const payRows = useMemo(() => {
    const last = tre?.payments?.last || [];
    return last.map((p: any) => ({
      date: p.date ? new Date(p.date).toLocaleDateString("fa-IR") : "—",
      direction: p.direction,
      method: p.method,
      amount: money(p.amount),
      trackingNo: p.trackingNo || "—",
      bankName: p.bankName || "—",
    }));
  }, [tre]);

  const purchaseRows = useMemo(() => {
    const vs = purchases?.vouchers || [];
    return vs.map((v: any) => ({
      refNo: v.refNo,
      date: v.date ? new Date(v.date).toLocaleDateString("fa-IR") : "—",
      description: v.description || "—",
      id: v.id,
    }));
  }, [purchases]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-slate-500">گزارش پروژه</div>
          <div className="mt-1 text-xl font-bold text-slate-900">
            {proj?.name || proj?.title || `پروژه #${projectId}`}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            کد: {proj?.code || "—"} • کارفرما: {proj?.customerName || "—"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
            href={`/api/projects/${projectId}/report`}
            target="_blank"
            rel="noreferrer"
          >
            دانلود PDF
          </a>

          <Link
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            href={`/dashboard/projects/${projectId}`}
          >
            بازگشت به پروژه
          </Link>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Card
          title="فروش (فاکتورهای پروژه)"
          value={`${money(sales?.invoicesTotal)} تومان`}
          hint={`تعداد: ${sales?.invoicesCount || 0}`}
        />
        <Card
          title="دریافتی کل"
          value={`${money(summary.receivedTotal)} تومان`}
          hint="IN از خزانه + payments"
        />
        <Card
          title="خرید کالا"
          value={`${money(summary.purchaseTotal)} تومان`}
          hint={`سندهای خرید: ${purchases?.vouchersCount || 0}`}
        />
        <Card
          title="هزینه‌های جانبی خرید"
          value={`${money(summary.extraCosts)} تومان`}
          hint="حمل/جرثقیل/..."
        />
        <Card
          title={netLabel}
          value={`${money(net)} تومان`}
          hint="تقریبی بر اساس ثبت‌ها"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Table
          title="فاکتورهای فروش"
          columns={[
            { key: "docNo", label: "شماره" },
            { key: "status", label: "وضعیت" },
            { key: "date", label: "تاریخ" },
            { key: "total", label: "مبلغ", className: "font-semibold" },
            { key: "customerName", label: "مشتری" },
          ]}
          rows={invoicesRows}
        />

        <Table
          title="خزانه (Transactions)"
          columns={[
            { key: "date", label: "تاریخ" },
            { key: "direction", label: "جهت" },
            { key: "method", label: "روش" },
            { key: "amount", label: "مبلغ", className: "font-semibold" },
            { key: "refNo", label: "Ref" },
            { key: "trackingNo", label: "پیگیری" },
          ]}
          rows={txRows}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Table
          title="پرداخت‌ها (TreasuryPayment)"
          columns={[
            { key: "date", label: "تاریخ" },
            { key: "direction", label: "جهت" },
            { key: "method", label: "روش" },
            { key: "amount", label: "مبلغ", className: "font-semibold" },
            { key: "trackingNo", label: "پیگیری" },
            { key: "bankName", label: "بانک" },
          ]}
          rows={payRows}
        />

        <Table
          title="سندهای خرید پروژه (PURCHASE)"
          columns={[
            { key: "refNo", label: "RefNo" },
            { key: "date", label: "تاریخ" },
            { key: "description", label: "شرح" },
            { key: "id", label: "ID" },
          ]}
          rows={purchaseRows}
        />
      </div>
    </div>
  );
}
