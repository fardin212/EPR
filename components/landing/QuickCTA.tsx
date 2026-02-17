// =======================================
// file: components/landing/QuickCTA.tsx
// نوار تماس سریع ثابت + دکمه واتس‌اپ/تلگرام
// =======================================
export default function QuickCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="rounded-2xl bg-white ring-1 ring-black/5 shadow-soft px-5 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xl font-extrabold">همین حالا درباره پروژه‌تان صحبت کنیم</div>
          <div className="text-slate-600 text-sm">ارسال ابعاد، موقعیت نصب و کاربری؛ تخمین زمان و هزینه‌ی ساخت.</div>
        </div>
        <div className="flex gap-3">
          <a className="btn btn-brand" href="https://wa.me/989124237146" target="_blank">واتس‌اپ</a>
          <a className="btn btn-ghost" href="tg://resolve?phone=989124237146">تلگرام</a>
          <a className="btn btn-ghost" href="tel:+989123679252">تماس: 09123679252</a>
        </div>
      </div>
    </section>
  );
}
