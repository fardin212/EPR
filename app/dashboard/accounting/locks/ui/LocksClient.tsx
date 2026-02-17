"use client";

import { useEffect, useState } from "react";

type PeriodLock = {
  id: number;
  title?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isLocked?: boolean | null;
  status?: string | null;
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text || !text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    // وقتی HTML/متن برگشته (مثلاً خطای سرور یا redirect)
    throw new Error(`پاسخ API JSON نبود: ${text.slice(0, 200)}`);
  }
}

export default function LocksClient() {
  const [items, setItems] = useState<PeriodLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/accounting/period-locks", { cache: "no-store" });

      // ✅ اگر API خطا داد، متنش رو بخون و نشون بده
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `خطا در دریافت لیست قفل‌ها (${res.status})`);
      }

      const data = await safeJson(res);

      // ✅ ساختارهای مختلف خروجی را ساپورت می‌کنیم
      const list: PeriodLock[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      setItems(list);
    } catch (e: any) {
      setError(e?.message || "خطا در بارگذاری قفل‌های حسابداری");
      setItems([]); // جلوگیری از کرش UI
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold">قفل‌های حسابداری</div>
        <button
          onClick={load}
          className="px-3 py-1.5 text-xs rounded-lg border bg-white hover:bg-zinc-50"
        >
          رفرش
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500">در حال بارگذاری…</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="text-xs text-slate-500">هیچ قفلی ثبت نشده است.</div>
      ) : (
        <div className="rounded-xl border bg-white overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="text-right">
                <th className="px-3 py-2">عنوان</th>
                <th className="px-3 py-2">از</th>
                <th className="px-3 py-2">تا</th>
                <th className="px-3 py-2">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => {
                const locked = x.isLocked ?? (x.status === "LOCKED");
                return (
                  <tr key={x.id} className="border-t">
                    <td className="px-3 py-2">{x.title || `#${x.id}`}</td>
                    <td className="px-3 py-2">{x.startDate?.slice(0, 10) || "—"}</td>
                    <td className="px-3 py-2">{x.endDate?.slice(0, 10) || "—"}</td>
                    <td className="px-3 py-2">
                      {locked ? (
                        <span className="inline-flex px-2 py-1 rounded-md bg-rose-500/15 text-rose-700 border border-rose-200">
                          قفل
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-700 border border-emerald-200">
                          باز
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
