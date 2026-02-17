// app/dashboard/management/ContractRemainAlert.tsx
"use client";

import { useEffect, useState } from "react";

type AlertRow = {
  contractId: number;
  project: { id: number; title: string } | null;
  contractor: { id: number; name: string; mobile: string | null } | null;
  total: number;
  paid: number;
  remaining: number;
  dueStatus: "OK" | "DUE_SOON" | "OVERDUE" | "NO_DUE";
  daysToDue: number | null;
};

function fmt(n: number) {
  try {
    return new Intl.NumberFormat("fa-IR").format(n);
  } catch {
    return String(n);
  }
}

function badge(status: AlertRow["dueStatus"]) {
  if (status === "OVERDUE") return "bg-rose-500/15 text-rose-200 border border-rose-400/50";
  if (status === "DUE_SOON") return "bg-amber-500/15 text-amber-200 border border-amber-400/50";
  return "bg-slate-700/40 text-slate-200 border border-slate-500/50";
}

function label(status: AlertRow["dueStatus"]) {
  if (status === "OVERDUE") return "سررسید گذشته";
  if (status === "DUE_SOON") return "نزدیک سررسید";
  return "—";
}

export default function ContractRemainAlert({ limit = 6 }: { limit?: number }) {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/reports/contractors?alerts=1&limit=${limit}`, {
        cache: "no-store",
      });
      const js = (await res.json()) as any;
      if (!res.ok) throw new Error(js?.error || "خطا در دریافت هشدارها");
      setAlerts(js?.alerts || []);
    } catch (e: any) {
      setErr(e?.message || "خطا");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-white">هشدار مانده قرارداد</div>
          <div className="text-[11px] text-slate-300 mt-1">
            مانده‌های نزدیک سررسید یا سررسید گذشته
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href="/dashboard/management/reports/contractors"
            className="px-3 py-1.5 rounded-xl text-xs bg-purple-600/30 border border-purple-400/40 text-purple-100 hover:bg-purple-600/40"
          >
            گزارش کامل
          </a>
          <button
            onClick={load}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-950/60 border border-white/10 text-slate-100 hover:bg-slate-950"
          >
            رفرش
          </button>
        </div>
      </div>

      {loading && <div className="text-xs text-slate-300">در حال دریافت…</div>}
      {err && <div className="text-xs text-rose-300">{err}</div>}

      {!loading && !err && alerts.length === 0 && (
        <div className="text-xs text-slate-400">
          فعلاً هشدار فعالی وجود ندارد ✅
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {alerts.map((a) => (
          <div
            key={a.contractId}
            className="rounded-2xl bg-slate-950/60 border border-white/10 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm text-white">
                  {a.contractor?.name || "—"}{" "}
                  <span className="text-xs text-slate-400">
                    ({a.project?.title || "بدون پروژه"})
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  مانده:{" "}
                  <span className="font-semibold text-rose-100">{fmt(a.remaining)}</span>{" "}
                  | کل: {fmt(a.total)} | پرداخت: {fmt(a.paid)}
                </div>
              </div>

              <span className={"inline-flex items-center px-2 py-1 rounded-full text-[11px] " + badge(a.dueStatus)}>
                {label(a.dueStatus)}
                {typeof a.daysToDue === "number" ? ` (${a.daysToDue} روز)` : ""}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              {a.project?.id && (
                <a
                  href={`/dashboard/projects/${a.project.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-900/70 border border-white/10 text-slate-100 hover:bg-slate-900"
                >
                  مشاهده پروژه
                </a>
              )}
              {a.project?.id && (
                <a
                  href={`/dashboard/projects/${a.project.id}/report`}
                  className="px-3 py-1.5 rounded-xl text-xs bg-purple-600/30 border border-purple-400/40 text-purple-100 hover:bg-purple-600/40"
                >
                  PDF پروژه
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
