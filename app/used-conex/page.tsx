// app/used-conex/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "کانکس دست دوم | خرید، فروش و قیمت روز کانکس کارکرده",
  description:
    "خرید و فروش کانکس دست دوم با بررسی فنی، قیمت‌گذاری منصفانه و امکان ثبت آگهی فروش. مشاهده لیست کانکس‌های کارکرده آماده تحویل در کانکس نیکان.",
  alternates: {
    canonical: "https://conexnikan.com/used-conex",
  },
};

export default function UsedConexHubPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      {/* HERO */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-extrabold">
          خرید و فروش کانکس دست دوم
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-200 leading-7 max-w-3xl">
          اگر قصد <strong>خرید کانکس دست دوم</strong> با قیمت مناسب یا
          <strong> فروش کانکس کارکرده</strong> خود را دارید، این بخش به شما
          کمک می‌کند سریع، مطمئن و بدون دردسر معامله کنید.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/used-conex/buy"
            className="rounded-xl bg-emerald-400 text-slate-900 px-5 py-2 font-bold text-sm hover:bg-emerald-300 transition"
          >
            مشاهده کانکس‌های موجود
          </Link>
          <Link
            href="/used-conex/sell"
            className="rounded-xl border border-white/40 px-5 py-2 text-sm font-bold hover:bg-white/10 transition"
          >
            ثبت آگهی فروش کانکس
          </Link>
        </div>
      </section>

      {/* معرفی */}
      <section className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-extrabold mb-3">
          کانکس دست دوم چیست و چه مزایایی دارد؟
        </h2>
        <p className="text-sm text-slate-700 leading-7">
          کانکس دست دوم یا کانکس کارکرده، سازه‌ای است که قبلاً استفاده شده اما
          همچنان از نظر فنی و سازه‌ای قابل بهره‌برداری است. خرید کانکس دست دوم
          گزینه‌ای اقتصادی برای پروژه‌های موقت، کارگاهی، انباری و حتی سکونتی
          کوتاه‌مدت محسوب می‌شود.
        </p>
      </section>

      {/* کارت‌های خرید / فروش */}
      <section className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/used-conex/buy"
          className="group rounded-2xl border p-6 hover:shadow-md transition"
        >
          <h3 className="font-extrabold text-lg group-hover:text-emerald-500 transition">
            خرید کانکس دست دوم
          </h3>
          <p className="mt-2 text-sm text-slate-600 leading-6">
            لیست کانکس‌های موجود، بررسی وضعیت، تصاویر واقعی و امکان مقایسه قیمت‌ها.
          </p>
          <span className="inline-block mt-3 text-sm font-bold text-emerald-500">
            مشاهده لیست کانکس‌ها →
          </span>
        </Link>

        <Link
          href="/used-conex/sell"
          className="group rounded-2xl border p-6 hover:shadow-md transition"
        >
          <h3 className="font-extrabold text-lg group-hover:text-emerald-500 transition">
            فروش کانکس دست دوم
          </h3>
          <p className="mt-2 text-sm text-slate-600 leading-6">
            ثبت مشخصات کانکس، آپلود تصاویر و دریافت پیشنهاد قیمت از کارشناسان.
          </p>
          <span className="inline-block mt-3 text-sm font-bold text-emerald-500">
            ثبت آگهی فروش →
          </span>
        </Link>
      </section>

      {/* FAQ کوتاه */}
      <section className="bg-slate-50 rounded-2xl border p-6">
        <h2 className="text-lg font-extrabold mb-4">
          سوالات متداول درباره کانکس دست دوم
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            <strong>آیا کانکس دست دوم قابل استفاده است؟</strong><br />
            بله، در صورتی که سازه و اسکلت سالم باشد، کانکس دست دوم می‌تواند سال‌ها
            بدون مشکل استفاده شود.
          </p>
          <p>
            <strong>قیمت کانکس دست دوم چطور تعیین می‌شود؟</strong><br />
            قیمت بر اساس ابعاد، نوع کاربری، وضعیت ظاهری و تجهیزات داخلی مشخص می‌شود.
          </p>
        </div>
      </section>
    </main>
  );
}
