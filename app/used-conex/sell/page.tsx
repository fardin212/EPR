"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const TYPES = ["نگهبانی", "کارگاهی", "ساندویچ‌پنل", "اداری", "ویلایی"] as const;
const CONDITIONS = [
  { v: "healthy", label: "سالم و آماده استفاده" },
  { v: "minor", label: "نیاز به تعمیر جزئی" },
  { v: "worn", label: "مستهلک / نیاز به بازسازی" },
] as const;

function isIranMobile(s: string) {
  const t = s.replaceAll(" ", "").trim();
  return /^09\d{9}$/.test(t);
}

export default function UsedConexSellPage() {
  const [type, setType] = useState<(typeof TYPES)[number]>("نگهبانی");
  const [size, setSize] = useState("");
  const [city, setCity] = useState("");
  const [condition, setCondition] =
    useState<(typeof CONDITIONS)[number]["v"]>("healthy");
  const [phone, setPhone] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(
    null
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!size.trim()) e.size = "ابعاد را وارد کنید (مثلاً 3×6)";
    if (!city.trim()) e.city = "شهر را وارد کنید";
    if (!isIranMobile(phone)) e.phone = "شماره موبایل معتبر (09xxxxxxxxx) وارد کنید";
    if (images.length === 0) e.images = "حداقل ۱ عکس از کانکس آپلود کنید";
    if (images.length > 8) e.images = "حداکثر ۸ عکس مجاز است";
    return e;
  }, [size, city, phone, images.length]);

  async function onSubmit() {
    setResult(null);

    if (Object.keys(errors).length > 0) {
      setResult({ ok: false, msg: "لطفاً خطاهای فرم را برطرف کنید." });
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("type", type);
      fd.append("size", size);
      fd.append("city", city);
      fd.append("condition", condition);
      fd.append("phone", phone);
      fd.append("desc", desc);

      images.forEach((f) => fd.append("images", f));

      const res = await fetch("/api/used-conex/sell", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setResult({
          ok: false,
          msg: json?.message || "ثبت درخواست ناموفق بود. دوباره تلاش کنید.",
        });
        return;
      }

      setResult({ ok: true, msg: "✅ درخواست شما ثبت شد. به‌زودی تماس می‌گیریم." });
      // پاکسازی
      setSize("");
      setCity("");
      setPhone("");
      setDesc("");
      setImages([]);
      setCondition("healthy");
      setType("نگهبانی");
    } catch {
      setResult({ ok: false, msg: "خطا در ارتباط با سرور" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">فروش کانکس دست دوم</h1>
        <Link href="/used-conex" className="text-sm underline">
          برگشت
        </Link>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        کارشناسی اولیه رایگان + پیشنهاد قیمت منصفانه. هرچه عکس‌ها واضح‌تر باشد،
        قیمت دقیق‌تر اعلام می‌شود.
      </p>

      {/* Trust block */}
      <div className="mt-5 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-3">
        <div className="text-sm">
          <div className="font-semibold">✔ کارشناسی رایگان</div>
          <div className="text-xs text-gray-600 mt-1">بررسی اولیه با عکس و توضیحات</div>
        </div>
        <div className="text-sm">
          <div className="font-semibold">✔ پیشنهاد قیمت منصفانه</div>
          <div className="text-xs text-gray-600 mt-1">بر اساس بازار و وضعیت واقعی</div>
        </div>
        <div className="text-sm">
          <div className="font-semibold">✔ پاسخ سریع</div>
          <div className="text-xs text-gray-600 mt-1">همان روز تماس می‌گیریم</div>
        </div>
      </div>

      {/* Form */}
      <section className="mt-6 rounded-2xl border bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-gray-600">نوع کانکس</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600">ابعاد (مثلاً 3×6)</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="3×6"
            />
            {errors.size && <div className="mt-1 text-xs text-rose-600">{errors.size}</div>}
          </div>

          <div>
            <label className="block text-xs text-gray-600">شهر</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="تهران"
            />
            {errors.city && <div className="mt-1 text-xs text-rose-600">{errors.city}</div>}
          </div>

          <div>
            <label className="block text-xs text-gray-600">وضعیت ظاهری</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
            >
              {CONDITIONS.map((c) => (
                <option key={c.v} value={c.v}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-600">شماره تماس</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
              inputMode="numeric"
            />
            {errors.phone && (
              <div className="mt-1 text-xs text-rose-600">{errors.phone}</div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-600">
              توضیحات تکمیلی (اختیاری)
            </label>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="مثلاً: کف سالمه، یک پنجره شکسته، برق‌کشی دارد..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-600">
              آپلود عکس‌ها (۱ تا ۸ عکس)
            </label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImages(files);
              }}
            />
            {errors.images && (
              <div className="mt-1 text-xs text-rose-600">{errors.images}</div>
            )}

            {/* Preview */}
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl border px-3 py-2 text-xs text-gray-700"
                    title={f.name}
                  >
                    {f.name.length > 24 ? f.name.slice(0, 24) + "…" : f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div
            className={[
              "mt-4 rounded-2xl border p-3 text-sm",
              result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800",
            ].join(" ")}
          >
            {result.msg}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "در حال ارسال..." : "ثبت درخواست فروش"}
          </button>

          <div className="text-xs text-gray-600">
            یا مستقیم تماس بگیر:
            <a className="mx-2 underline" href="tel:09124237146">
              09124237146
            </a>
            |
            <a className="mx-2 underline" href="https://wa.me/989124237146" target="_blank" rel="noreferrer">
              واتساپ
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
