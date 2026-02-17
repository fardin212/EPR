"use client";

import { toJalali } from "@/lib/date";
import { useEffect, useState } from "react";
import Link from "next/link";

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}

export default function CrmPage() {
  const [tab, setTab] = useState<"leads" | "customers" | "activities">("leads");

  const [leads, setLeads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [leadsRes, customersRes, activitiesRes] = await Promise.all([
          fetch("/api/crm/leads").then((r) => r.json()),
          fetch("/api/crm/customers").then((r) => r.json()),
          fetch("/api/crm/activities").then((r) => r.json()),
        ]);

        setLeads(toArray(leadsRes));
        setCustomers(toArray(customersRes));
        setActivities(toArray(activitiesRes));
      } catch (err) {
        console.error("CRM Load Error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500" dir="rtl">
        در حال بارگذاری اطلاعات CRM...
      </div>
    );
  }

  const leadsSafe = leads;
  const customersSafe = customers;
  const activitiesSafe = activities;

  return (
    <div className="p-4 sm:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-400">CRM / مدیریت مشتریان</p>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 mt-1">
            ماژول CRM و مشتریان
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 leading-5 max-w-2xl">
            مدیریت سرنخ‌ها، مشتریان، وضعیت فروش، پیگیری‌ها و تماس‌ها.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/crm/leads/new"
            className="rounded-xl bg-indigo-600 text-white text-xs px-4 py-2 shadow-sm hover:bg-indigo-700"
          >
            + سرنخ جدید
          </Link>
          <Link
            href="/dashboard/crm/customers/new"
            className="rounded-xl bg-emerald-600 text-white text-xs px-4 py-2 shadow-sm hover:bg-emerald-700"
          >
            + مشتری جدید
          </Link>
          <Link
            href="/dashboard/crm/pipeline"
            className="rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-700 px-4 py-2 hover:border-slate-400"
          >
            کانبان فروش
          </Link>
          <Link
            href="/dashboard/crm/analytics"
            className="rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-700 px-4 py-2 hover:border-slate-400"
          >
            گزارش تحلیلی فروش
          </Link>
        </div>
      </section>

      {/* Statistic Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="سرنخ‌های جدید" value={countNew(leadsSafe)} color="indigo" />
        <StatCard title="مشتریان ثبت‌شده" value={customersSafe.length} color="emerald" />
        <StatCard title="فروش‌های در انتظار" value={countPending(leadsSafe)} color="amber" />
        <StatCard title="سرنخ‌های از دست‌رفته" value={countLost(leadsSafe)} color="rose" />
      </section>

      {/* Tabs */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-4 sm:px-5 py-3 flex items-center gap-2 text-[11px]">
          <TabButton label="سرنخ‌ها" active={tab === "leads"} onClick={() => setTab("leads")} />
          <TabButton label="مشتریان" active={tab === "customers"} onClick={() => setTab("customers")} />
          <TabButton label="پیگیری‌ها" active={tab === "activities"} onClick={() => setTab("activities")} />
        </div>

        <div className="px-4 sm:px-5 py-4 sm:py-5">
          {tab === "leads" && <LeadsTable data={leadsSafe} />}
          {tab === "customers" && <CustomersTable data={customersSafe} />}
          {tab === "activities" && <ActivitiesTable data={activitiesSafe} />}
        </div>
      </section>
    </div>
  );
}

/* ---- helpers for stats ---- */

function countNew(leads: any[]) {
  return leads.filter((l) => (l.status || "").toUpperCase() === "NEW").length;
}

function countPending(leads: any[]) {
  return leads.filter((l) =>
    ["PROPOSAL", "NEGOTIATION"].includes((l.pipelineStage || "").toUpperCase())
  ).length;
}

function countLost(leads: any[]) {
  return leads.filter((l) => (l.status || "").toUpperCase() === "LOST").length;
}

/* ---- shared components ---- */

function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  const circle = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  }[color];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>{title}</span>
        <span className={`w-2 h-2 rounded-full ${circle}`}></span>
      </div>
      <div className="text-lg font-bold text-slate-800">{value}</div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full font-medium transition ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

/* ---- tables ---- */

function LeadsTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-[12px] text-right">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">نام</th>
            <th className="px-3 py-2 font-medium">تماس</th>
            <th className="px-3 py-2 font-medium">منبع</th>
            <th className="px-3 py-2 font-medium">وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {data.map((l, i) => (
            <tr
              key={l.id}
              className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}
            >
              <td className="px-3 py-2 text-slate-800">{l.name}</td>
              <td className="px-3 py-2 text-slate-700">
                {l.phone || "—"}
                {l.email && (
                  <span className="text-[10px] text-slate-400 block">
                    {l.email}
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-slate-700">{l.source || "—"}</td>
              <td className="px-3 py-2">
                <StatusBadge status={l.status} />
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-center text-[12px] text-slate-500">
                هیچ سرنخی ثبت نشده است.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CustomersTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-[12px] text-right">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">نام</th>
            <th className="px-3 py-2 font-medium">نوع</th>
            <th className="px-3 py-2 font-medium">آخرین معامله</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr
              key={c.id}
              className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}
            >
              <td className="px-3 py-2 text-slate-800">{c.name}</td>
              <td className="px-3 py-2 text-slate-700">{c.type || "—"}</td>
              <td className="px-3 py-2 text-slate-600">
                {c.lastDealAt
                  ? toJalali(c.lastDealAt)
                  : "—"}
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={3} className="px-3 py-4 text-center text-[12px] text-slate-500">
                هنوز مشتری ثبت نشده است.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ActivitiesTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-[12px] text-right">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">مشتری / سرنخ</th>
            <th className="px-3 py-2 font-medium">نوع فعالیت</th>
            <th className="px-3 py-2 font-medium">تاریخ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a, i) => (
            <tr
              key={a.id}
              className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/50" : ""}`}
            >
              <td className="px-3 py-2 text-slate-800">
                {a.lead?.name || a.customer?.name || "—"}
              </td>
              <td className="px-3 py-2 text-slate-700">{a.type}</td>
              <td className="px-3 py-2 text-slate-600">
                {toJalali(a.doneAt, true)}
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={3} className="px-3 py-4 text-center text-[12px] text-slate-500">
                هنوز هیچ پیگیری ثبت نشده است.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const key = (status || "").toUpperCase();
  const map: any = {
    NEW: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    IN_PROGRESS: "bg-amber-50 text-amber-700 border border-amber-200",
    WON: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    LOST: "bg-rose-50 text-rose-700 border border-rose-200",
  };
  const label =
    key === "NEW"
      ? "جدید"
      : key === "IN_PROGRESS"
      ? "در حال پیگیری"
      : key === "WON"
      ? "تبدیل به مشتری"
      : key === "LOST"
      ? "از دست رفته"
      : "نامشخص";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] ${
        map[key] || "bg-slate-100 text-slate-600 border border-slate-200"
      }`}
    >
      {label}
    </span>
  );
}
