"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const cls = {
  wrap: "max-w-3xl mx-auto px-4 py-6 text-[color:var(--text)]",
  title: "text-xl font-semibold mb-1",
  subtitle: "text-xs text-[color:var(--muted)] mb-4",
  card:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 mb-4",
  label: "block text-[11px] mb-1",
  input:
    "w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)]",
  textarea:
    "w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)] resize-y",
  primaryBtn:
    "inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-5 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-soft)] transition disabled:opacity-60 disabled:cursor-not-allowed",
  secondaryBtn:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-2 text-xs text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]",
  alertError:
    "mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100",
  alertSuccess:
    "mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100",
};

const jalaliFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "short",
});

export default function NewStockTakingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("انبارگردانی دوره‌ای");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const jalaliDate = useMemo(() => {
    if (!date) return "";
    try {
      return jalaliFormatter.format(new Date(date));
    } catch {
      return "";
    }
  }, [date]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("عنوان جلسه را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stocktaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          note: note.trim() || undefined,
          date,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error || "خطا در ایجاد جلسه انبارگردانی. دوباره تلاش کنید.",
        );
      } else {
        setSuccess("جلسه انبارگردانی ایجاد شد و اقلام از موجودی فعلی بارگذاری شدند.");
        setTimeout(() => {
          router.push(`/dashboard/inventory/stocktaking/${data.id}`);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setError("خطای غیرمنتظره در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cls.wrap} dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className={cls.title}>شروع جلسه انبارگردانی جدید</h1>
          <p className={cls.subtitle}>
            با شروع یک جلسه، موجودی فعلی همه کالاها در همه انبارها به‌عنوان «موجودی سیستمی» ثبت می‌شود و می‌توانید مقادیر شمارش‌شده را وارد کنید.
          </p>
        </div>

        <button
          type="button"
          className={cls.secondaryBtn}
          onClick={() => router.push("/dashboard/inventory/stocktaking")}
        >
          ← بازگشت به لیست انبارگردانی
        </button>
      </div>

      <form onSubmit={handleSubmit} className={cls.card}>
        <div className="space-y-3">
          <div>
            <label className={cls.label}>عنوان جلسه *</label>
            <input
              className={cls.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً انبارگردانی پایان سال ۱۴۰۴"
            />
          </div>

          <div>
            <label className={cls.label}>تاریخ جلسه</label>
            <input
              type="date"
              className={cls.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {jalaliDate && (
              <div className="mt-1 text-[10px] text-[color:var(--muted)]">
                تاریخ شمسی معادل: {jalaliDate}
              </div>
            )}
          </div>

          <div>
            <label className={cls.label}>توضیحات</label>
            <textarea
              className={cls.textarea}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً محدوده کالاها، نام مسئول انبار، توضیحات اضافی..."
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className={cls.primaryBtn}
              disabled={loading}
            >
              {loading ? "در حال ایجاد جلسه..." : "شروع انبارگردانی"}
            </button>
            <button
              type="button"
              className={cls.secondaryBtn}
              onClick={() => router.push("/dashboard/inventory/stocktaking")}
            >
              انصراف
            </button>
          </div>

          {error && <div className={cls.alertError}>{error}</div>}
          {success && <div className={cls.alertSuccess}>{success}</div>}
        </div>
      </form>
    </div>
  );
}
