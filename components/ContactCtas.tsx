export default function ContactCtas() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-4">
        <a className="card hover:-translate-y-1 transition" href="tel:+989123679252">
          <div className="font-bold text-brand mb-1">تماس فوری</div>
          <div className="text-lg">09123679252</div>
          <div className="text-gray-400 text-sm mt-1">پاسخگویی سریع</div>
        </a>
        <a className="card hover:-translate-y-1 transition" href="https://wa.me/989124237146" target="_blank">
          <div className="font-bold text-brand mb-1">واتس‌اپ</div>
          <div className="text-lg">09124237146</div>
          <div className="text-gray-400 text-sm mt-1">ارسال عکس و مشخصات پروژه</div>
        </a>
        <a className="card hover:-translate-y-1 transition" href="tg://resolve?phone=989124237146">
          <div className="font-bold text-brand mb-1">تلگرام</div>
          <div className="text-lg">09124237146</div>
          <div className="text-gray-400 text-sm mt-1">پیام در تلگرام (در صورت نصب)</div>
        </a>
      </div>
    </div>
  );
}
