/* Server Component */
export default function ContactCtas() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-4">
        <a className="card hover:-translate-y-1 transition p-4" href="tel:+989123679252">
          <div className="font-bold text-[color:var(--brand-2)] mb-1">تماس فوری</div>
          <div className="text-lg">09123679252</div>
          <div className="text-muted text-sm mt-1">پاسخگویی سریع</div>
        </a>

        <a className="card hover:-translate-y-1 transition p-4" href="https://wa.me/989124237146" target="_blank">
          <div className="font-bold text-[color:var(--brand-2)] mb-1">واتس‌اپ</div>
          <div className="text-lg">09124237146</div>
          <div className="text-muted text-sm mt-1">ارسال عکس و مشخصات پروژه</div>
        </a>

        <a className="card hover:-translate-y-1 transition p-4" href="tg://resolve?phone=989124237146">
          <div className="font-bold text-[color:var(--brand-2)] mb-1">تلگرام</div>
          <div className="text-lg">09124237146</div>
          <div className="text-muted text-sm mt-1">پیام در تلگرام (در صورت نصب)</div>
        </a>
      </div>
    </div>
  );
}
