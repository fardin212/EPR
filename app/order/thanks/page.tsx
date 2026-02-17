// app/order/thanks/page.tsx
import Link from "next/link";

export const metadata = {
  title: "ثبت سفارش با موفقیت انجام شد | کانکس نیکان",
};

export default function OrderThanks() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <div className="rounded-2xl border border-white/10 bg-[var(--brand-mid,#0f1720)] p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="shrink-0 grid place-items-center w-12 h-12 rounded-full bg-[var(--accent,#d4a019)]/20 border border-[var(--accent,#d4a019)]/40">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--accent,#d4a019)]">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black">سفارش شما ثبت شد</h1>
            <p className="mt-2 text-[15.5px] leading-8 text-white/80">
              از ارسال اطلاعات سپاسگزاریم. کارشناسان ما پس از بررسی، برای هماهنگی‌های بعدی با شما تماس خواهند گرفت.
              همچنین می‌توانید از طریق دکمه‌های زیر پیگیری سریع‌تری داشته باشید.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-xl bg-[var(--accent,#d4a019)] px-4 py-2.5 font-bold text-black hover:brightness-110"
              >
                بازگشت به صفحه اصلی
              </Link>
              <Link
                href="/portfolio"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-semibold text-white hover:bg-white/10"
              >
                مشاهده نمونه‌کارها
              </Link>
              <a
                href="https://wa.me/98912XXXXXXX"
                target="_blank"
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2.5 font-semibold text-emerald-300 hover:bg-emerald-500/15"
              >
                گفت‌وگوی واتس‌اپ
              </a>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              اگر هنگام ارسال، تصویر ضمیمه کرده‌اید، فایل‌ها در بخش <span className="font-bold">uploads/orders</span> ذخیره شده‌اند.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
