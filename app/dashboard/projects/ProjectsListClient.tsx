"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toJalali } from "@/lib/date";

type ProjectStatus = "IN_PROGRESS" | "COMPLETED" | "STOPPED";

type ApiProject = {
  id: number;
  title: string;
  code?: string | null;

  customerName?: string | null;
  customer?: string | null;

  projectTypeName?: string | null;
  type?: string | null;

  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;

  progress?: number | null;
};

const statusLabel: Record<ProjectStatus, string> = {
  IN_PROGRESS: "در حال اجرا",
  COMPLETED: "تکمیل شده",
  STOPPED: "متوقف شده",
};

const statusClass: Record<ProjectStatus, string> = {
  IN_PROGRESS: "bg-amber-500/15 text-amber-200 border border-amber-400/40",
  COMPLETED: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40",
  STOPPED: "bg-rose-500/15 text-rose-200 border border-rose-400/40",
};

function safeNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function ProjectsListClient() {
  const [rows, setRows] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ProjectStatus | "all">("all");

  const abortRef = useRef<AbortController | null>(null);

  async function fetchProjects(opts?: { silent?: boolean }) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const silent = Boolean(opts?.silent);
    if (!silent) setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set("q", search.trim());
      if (statusFilter !== "all") qs.set("status", statusFilter);

      const res = await fetch(
        `/api/projects${qs.toString() ? `?${qs}` : ""}`,
        { cache: "no-store", signal: ac.signal }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "خطا در دریافت لیست پروژه‌ها");
        return;
      }

      const list: ApiProject[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.projects)
        ? data.projects
        : [];

      setRows(list);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError("خطا در ارتباط با سرور");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchProjects(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  async function handleDelete(id: number) {
    if (!confirm("پروژه حذف شود؟ (حذف نرم)")) return;

    setBusyId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "خطا در حذف پروژه");
        return;
      }

      fetchProjects({ silent: true });
    } finally {
      setBusyId(null);
    }
  }

  const viewRows = useMemo(() => rows, [rows]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <input
            className="flex-1 bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white"
            placeholder="جستجو..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="sm:w-40 bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value === "all"
                  ? "all"
                  : (e.target.value as ProjectStatus)
              )
            }
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="IN_PROGRESS">در حال اجرا</option>
            <option value="COMPLETED">تکمیل شده</option>
            <option value="STOPPED">متوقف شده</option>
          </select>

          <button
            onClick={() => fetchProjects()}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/15 text-xs text-white"
          >
            {loading ? "..." : "رفرش"}
          </button>
        </div>

        <Link
          href="/dashboard/projects/new"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-l from-fuchsia-500 to-purple-500 text-white text-sm"
        >
          + ثبت پروژه
        </Link>
      </div>

      {error && <div className="text-xs text-rose-300">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-900 text-slate-300 text-xs">
            <tr>
              <th className="p-3">عنوان</th>
              <th className="p-3">کد</th>
              <th className="p-3">مشتری</th>
              <th className="p-3">نوع</th>
              <th className="p-3">پیشرفت</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3">شروع</th>
              <th className="p-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {viewRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  پروژه‌ای وجود ندارد
                </td>
              </tr>
            ) : (
              viewRows.map((p) => {
                const progress = Math.min(
                  100,
                  Math.max(0, safeNum(p.progress))
                );
                return (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="p-3 text-white">{p.title}</td>
                    <td className="p-3 text-xs">{p.code || "—"}</td>
                    <td className="p-3">
                      {p.customerName || p.customer || "—"}
                    </td>
                    <td className="p-3">
                      {p.projectTypeName || p.type || "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded">
                          <div
                            className="h-full bg-emerald-400"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs">{progress}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] ${statusClass[p.status]}`}
                      >
                        {statusLabel[p.status]}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      {p.startDate ? toJalali(p.startDate) : "—"}
                    </td>
                    <td className="p-3 text-center space-x-3 space-x-reverse">
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className="text-sky-300 underline"
                      >
                        مشاهده
                      </Link>
                      <Link
                        href={`/dashboard/projects/${p.id}/edit`}
                        className="text-amber-300 underline"
                      >
                        ویرایش
                      </Link>
                      <button
                        disabled={busyId === p.id}
                        onClick={() => handleDelete(p.id)}
                        className="text-rose-300 underline"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
