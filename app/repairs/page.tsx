// app/repairs/page.tsx
export const dynamic = "force-dynamic";

export default function RepairsPage() {
  const services = [
    "تعویض یا تقویت شاسی و کف",
    "ترمیم پنل‌ها، درب/پنجره، آب‌بندی کامل",
    "عایق‌بندی (پشم‌سنگ، XPS، فوم)",
    "برق‌کشی استاندارد، روشنایی و تابلو برق",
    "لوله‌کشی و سرویس بهداشتی",
    "رنگ‌آمیزی صنعتی و نوسازی نما (سندبلاست / رنگ اپوکسی)",
  ];

  const steps = [
    {
      title: "بازدید و عیب‌یابی",
      desc: "بررسی سازه، شاسی، دیوارها، اتصالات و تاسیسات برق و لوله‌کشی در محل پروژه.",
    },
    {
      title: "برآورد زمان و هزینه",
      desc: "تهیه لیست دقیق اقلام، زمان‌بندی اجرا و ارائه پیش‌فاکتور شفاف و قابل پیگیری.",
    },
    {
      title: "اجرای تعمیرات",
      desc: "انجام تعمیرات تخصصی شامل تقویت شاسی، تعویض پنل‌ها، کف‌سازی، عایق، رنگ و تجهیزات.",
    },
    {
      title: "تحویل و ضمانت",
      desc: "تحویل سازه تمیز و آماده به‌کار، همراه با ضمانت کیفیت اجرا و پشتیبانی پس از تحویل.",
    },
  ];

  const highlights = [
    "امکان تعمیر در محل یا انتقال سازه به کارگاه",
    "استفاده از رنگ و متریال صنعتی با دوام بالا",
    "ارائه گزارش وضعیت قبل و بعد از تعمیر",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-16 space-y-10 text-slate-900">
        {/* HERO بالای صفحه */}
        <header className="grid gap-8 lg:grid-cols-[2.1fr,1.6fr] items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/40 text-[var(--accent)] text-sm font-extrabold">
              خدمات تخصصی تعمیر و بازسازی کانکس
            </div>

            <h1 className="text-3xl md:text-4xl font-black leading-snug bg-gradient-to-l from-[var(--accent)] via-indigo-500 to-slate-900 bg-clip-text text-transparent">
              تعمیرات و بازسازی کانکس، مثل روز اول
            </h1>

            <p className="leading-8 text-slate-600 max-w-xl text-sm md:text-[0.95rem]">
              اگر سازه‌ی شما فرسوده شده، مشکل آب‌بندی دارد یا نیاز به
              به‌روزرسانی تاسیسات پیدا کرده، تیم نیکان سازه را بدون نیاز به
              تعویض کامل، با حداقل توقف کار و حداکثر دوام، بازسازی می‌کند.
            </p>

            {/* آمار/هایلایت‌ها */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/90 border border-slate-200 shadow-sm px-4 py-3">
                <div className="text-xs text-slate-500">میانگین زمان تعمیر</div>
                <div className="font-black text-lg text-slate-900">
                  ۳ تا ۷ روز
                </div>
              </div>
              <div className="rounded-2xl bg-white/90 border border-slate-200 shadow-sm px-4 py-3">
                <div className="text-xs text-slate-500">نوع سازه قابل تعمیر</div>
                <div className="font-black text-lg text-slate-900">
                  اداری، کارگاهی، ویلایی
                </div>
              </div>
              <div className="rounded-2xl bg-white/90 border border-slate-200 shadow-sm px-4 py-3 col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-500">پوشش پروژه‌ها</div>
                <div className="font-black text-lg text-slate-900">
                  سراسر کشور
                </div>
              </div>
            </div>

            {/* دکمه‌ها */}
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="/order?type=repair"
                className="px-5 py-2.5 rounded-full bg-gradient-to-l from-[var(--accent)] via-indigo-500 to-fuchsia-500 text-white text-sm font-extrabold shadow-lg shadow-[var(--accent)]/40 hover:brightness-110 transition"
              >
                ثبت درخواست تعمیر
              </a>
              <a
                href="/contact"
                className="px-5 py-2.5 rounded-full border border-slate-300 bg-white/70 text-slate-700 text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-white transition"
              >
                مشاوره رایگان قبل از تعمیر
              </a>
            </div>
          </div>

          {/* کارت کناری / نکات مهم */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-l from-[var(--accent)]/10 via-sky-400/10 to-purple-500/10 blur-3xl -z-10" />
            <div className="rounded-3xl bg-white/95 border border-slate-200 shadow-xl p-5 md:p-6 space-y-4">
              <div className="text-sm font-extrabold text-slate-900">
                چرا تعمیر به‌جای تعویض؟
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                در بسیاری از پروژه‌ها، با تقویت شاسی، تعویض بخش‌های آسیب‌دیده و
                انجام عایق و رنگ‌آمیزی استاندارد، می‌توان عمر کانکس را چند سال
                دیگر افزایش داد؛ بدون اینکه هزینه‌ی سنگین ساخت سازه‌ی جدید را
                پرداخت کنید.
              </p>
              <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-2 items-start">
                    <span className="mt-1 w-2 h-2 rounded-full bg-[var(--accent)] shadow-sm shadow-[var(--accent)]/40" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>

        {/* دو کارت اصلی: مراحل اجرا + خدمات */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* مراحل اجرا به صورت استپر عمودی */}
          <div className="rounded-3xl border border-slate-200 bg-white/95 shadow-xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/40 text-[var(--accent)] text-xs font-extrabold">
                مراحل اجرا
              </div>
              <span className="text-[0.7rem] text-slate-500">
                از اولین تماس تا تحویل نهایی
              </span>
            </div>

            <ol className="space-y-4 relative">
              <div className="absolute right-4 top-4 bottom-4 w-px bg-slate-200/80" />
              {steps.map((st, i) => (
                <li key={st.title} className="relative flex gap-3 items-start">
                  <div className="flex flex-col items-center z-10">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white grid place-items-center font-extrabold text-xs shadow-md shadow-[var(--accent)]/40">
                      {i + 1}
                    </div>
                  </div>
                  <div className="pr-1">
                    <div className="font-bold text-slate-900 text-sm md:text-[0.95rem]">
                      {st.title}
                    </div>
                    <p className="m-0 mt-1 text-slate-600 text-xs md:text-[0.85rem] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* خدمات ما */}
          <div className="rounded-3xl border border-slate-200 bg-white/95 shadow-xl p-5 md:p-6 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[var(--accent)]/10 border border-[var(--accent)]/40 text-[var(--accent)] text-xs font-extrabold">
              خدمات قابل انجام
            </div>

            <ul className="space-y-2 pe-1">
              {services.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-2 inline-block w-2 h-2 rounded-full bg-[var(--accent)] shadow-sm shadow-[var(--accent)]/40" />
                  <p className="m-0 text-slate-800 text-xs md:text-[0.95rem] leading-relaxed">
                    {s}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-3 rounded-2xl bg-slate-50 border border-dashed border-slate-300 px-4 py-3 text-[0.8rem] text-slate-600 leading-relaxed">
              برای سازه‌هایی که سال‌ها در شرایط نامساعد جوی بوده‌اند، امکان
              بازسازی کامل نما، تعویض کف، تقویت اسکلت و به‌روزرسانی تاسیسات
              بر اساس استانداردهای روز وجود دارد.
            </div>
          </div>
        </section>

        {/* CTA پایانی */}
        <section className="rounded-3xl border border-slate-200 bg-white/95 shadow-xl p-5 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="text-center md:text-right space-y-1">
              <div className="font-extrabold text-lg md:text-xl text-slate-900">
                نیاز به بازدید حضوری دارید؟
              </div>
              <p className="m-0 text-slate-600 text-xs md:text-[0.9rem] leading-relaxed max-w-xl">
                برای برآورد دقیق هزینه و اطمینان از اینکه تعمیر به‌صرفه‌تر از
                تعویض است، درخواست بازدید ثبت کنید تا کارشناس فنی نیکان در محل
                سازه حاضر شود و گزارش کامل ارائه دهد.
              </p>
            </div>
            <a
              href="/order?type=repair"
              className="px-5 py-2.5 rounded-full bg-gradient-to-l from-[var(--accent)] via-indigo-500 to-fuchsia-500 text-white text-sm font-extrabold shadow-lg shadow-[var(--accent)]/40 hover:brightness-110 transition"
            >
              ثبت درخواست بازدید و تعمیر
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
