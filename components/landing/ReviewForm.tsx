"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-0.5"
            aria-label={`امتیاز ${n}`}
          >
            <Star
              className={
                "h-5 w-5 " +
                (active ? "text-amber-500 fill-amber-500" : "text-slate-300")
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewForm() {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const disabled = useMemo(() => {
    return name.trim().length < 2 || text.trim().length < 10 || loading;
  }, [name, text, loading]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tag,
          text,
          rating,
          website: "", // honeypot
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "خطا در ثبت نظر");
      }

      setMsg({ type: "ok", text: data.message || "نظر شما ثبت شد." });
      setName("");
      setTag("");
      setText("");
      setRating(5);
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "خطای غیرمنتظره" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/95 p-5 md:p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base md:text-lg">
            ثبت نظر شما
          </h3>
          <p className="text-slate-600 text-xs md:text-sm mt-1">
            نظر شما ابتدا بررسی می‌شود و سپس در سایت نمایش داده خواهد شد.
          </p>
        </div>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <label className="text-xs font-semibold text-slate-700">نام</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً آقای حسینی"
          />
        </div>

        <div className="md:col-span-4">
          <label className="text-xs font-semibold text-slate-700">
            نوع کانکس (اختیاری)
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="مثلاً کانکس ویلایی"
          />
        </div>

        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="md:col-span-12">
          <label className="text-xs font-semibold text-slate-700">متن نظر</label>
          <textarea
            className="mt-1 w-full min-h-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="تجربه شما از کیفیت ساخت، زمان تحویل، نصب و پشتیبانی…"
          />
        </div>

        <div className="md:col-span-12 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <button
            type="submit"
            disabled={disabled}
            className={
              "rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all " +
              (disabled
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-l from-[#ff7a3c] via-[#ff5e6b] to-[#6d5cff] hover:brightness-110 hover:-translate-y-0.5")
            }
          >
            {loading ? "در حال ثبت…" : "ثبت نظر"}
          </button>

          {msg ? (
            <div
              className={
                "text-xs md:text-sm rounded-xl px-3 py-2 border " +
                (msg.type === "ok"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700")
              }
            >
              {msg.text}
            </div>
          ) : (
            <div className="text-xs md:text-sm text-slate-500">
              لطفاً حداقل ۱۰ کاراکتر بنویسید.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
