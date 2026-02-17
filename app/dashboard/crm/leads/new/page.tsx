"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const source = String(fd.get("source") || "").trim();
    const note = String(fd.get("note") || "").trim();

    if (!name) {
      setError("نام سرنخ الزامی است.");
      setLoading(false);
      return;
    }

    if (!phone && !email) {
      setError("حداقل یکی از فیلدهای تلفن یا ایمیل باید پر شود.");
      setLoading(false);
      return;
    }

    const payload = {
      name,
      phone: phone || null,
      email: email || null,
      source: source || null,
      note: note || null,
    };

    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "خطا در ثبت سرنخ");
      } else {
        router.push("/dashboard/crm");
      }
    } catch {
      setError("خطای ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-5" dir="rtl">
      <div>
        <p className="text-xs text-slate-400">CRM / سرنخ جدید</p>
        <h1 className="text-lg font-semibold text-slate-800 mt-1">
          ثبت سرنخ جدید
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4"
      >
        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            نام سرنخ *
          </label>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">
              شماره تماس (حداقل یکی از تلفن/ایمیل)
            </label>
            <input
              name="phone"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">
              ایمیل
            </label>
            <input
              name="email"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            منبع سرنخ (مثلاً سایت، اینستاگرام، تماس مستقیم)
          </label>
          <input
            name="source"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            توضیحات
          </label>
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
            className="rounded-full bg-indigo-600 text-white text-sm px-6 py-2 hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : "ثبت سرنخ"}
          </button>
        </div>
      </form>
    </div>
  );
}
