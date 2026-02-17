"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      type: fd.get("type") || null,
      phone: fd.get("phone") || null,
      email: fd.get("email") || null,
      companyName: fd.get("companyName") || null,
      note: fd.get("note") || null,
    };

    try {
      const res = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "خطا در ثبت مشتری");
      } else {
        router.push("/dashboard/crm");
      }
    } catch {
      setError("خطای اتصال یا سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5" dir="rtl">
      <div>
        <p className="text-xs text-slate-400">CRM / مشتری جدید</p>
        <h1 className="text-lg font-semibold text-slate-800 mt-1">
          ثبت مشتری جدید
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4"
      >
        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            نام مشتری *
          </label>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">نوع مشتری</label>
            <select
              name="type"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">— انتخاب نشده —</option>
              <option value="حقیقی">حقیقی</option>
              <option value="حقوقی">حقوقی</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">نام شرکت</label>
            <input
              name="companyName"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">شماره تماس</label>
            <input
              name="phone"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">ایمیل</label>
            <input
              name="email"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">توضیحات</label>
          <textarea
            name="note"
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-600 text-white text-sm px-6 py-2 hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "ثبت مشتری"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-600 px-5 py-2"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
