// app/about/page.tsx – About Conex Nikan (Full SEO Version)
import Section from "@/components/ui/Section";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ====================== SEO META ======================
export const metadata: Metadata = {
  title:
    "درباره کانکس نیکان | کارگاه تخصصی ساخت کانکس کارگاهی، ویلایی و ساندویچی",
  description:
    "آشنایی با کانکس نیکان؛ کارگاه تخصصی ساخت کانکس کارگاهی، کانکس ویلایی، کانکس نگهبانی و کانکس ساندویچی با شاسی سنگین، عایق‌بندی استاندارد و کنترل کیفیت مرحله‌ای. بیش از ۳۰۰ پروژه موفق در سراسر ایران.",
  alternates: {
    canonical: "https://conexnikan.com/about",
  },
  openGraph: {
    type: "website",
    url: "https://conexnikan.com/about",
    title:
      "درباره کانکس نیکان | تولید و ساخت کانکس کارگاهی، ویلایی و سازه‌های پیش‌ساخته فلزی",
    description:
      "کانکس نیکان از سال ۱۳۹۵ در زمینه طراحی و ساخت انواع کانکس کارگاهی، کانکس ویلایی، کانکس نگهبانی و سازه‌های پیش‌ساخته فلزی فعالیت می‌کند. تمرکز ما روی کیفیت ساخت، شاسی مقاوم و عایق‌بندی حرفه‌ای است.",
    siteName: "کانکس نیکان",
    images: [
      {
        url: "https://conexnikan.com/images/og-about-workshop.jpg",
        width: 1200,
        height: 630,
        alt: "کارگاه ساخت کانکس نیکان",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "درباره کانکس نیکان | کارگاه تخصصی ساخت کانکس و سازه‌های پیش‌ساخته",
    description:
      "آشنایی با تاریخچه، تیم و استانداردهای کنترل کیفیت در کارگاه کانکس نیکان؛ تولیدکننده انواع کانکس کارگاهی، ویلایی، نگهبانی و ساندویچی.",
    images: ["https://conexnikan.com/images/og-about-workshop.jpg"],
  },
};

// کوچک، برای استفاده در چند جای صفحه
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl shadow-sky-100 px-5 py-6 text-center">
      <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm">
        {value}
      </div>
      <div className="text-xs md:text-sm text-slate-600 mt-1">{label}</div>
    </div>
  );
}

export default function AboutPage() {
  // ====================== SCHEMA (JSON-LD) ======================
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "HomeAndConstructionBusiness"],
    name: "کانکس نیکان",
    url: "https://conexnikan.com",
    logo: "https://conexnikan.com/logos/logo.png",
    description:
      "کانکس نیکان کارگاه تخصصی ساخت کانکس کارگاهی، کانکس ویلایی، کانکس نگهبانی و کانکس ساندویچی با شاسی سنگین و عایق‌بندی حرفه‌ای در سراسر ایران است.",
    foundingDate: "2016",
    areaServed: "IR",
    sameAs: [
      "https://conexnikan.com",
      // در صورت داشتن شبکه‌های اجتماعی، اینجا اضافه کن:
      // "https://www.instagram.com/yourpage"
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
    },
  };

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntityOfPage: "https://conexnikan.com/about",
    name: "درباره کانکس نیکان",
    description:
      "آشنایی با تاریخچه، تیم و استانداردهای کنترل کیفیت در کارگاه کانکس نیکان؛ تولیدکننده انواع کانکس کارگاهی، ویلایی، نگهبانی و ساندویچی.",
    publisher: {
      "@id": "https://conexnikan.com/#organization",
    },
  };

  return (
    <>
      {/* H1 سئویی مخفی */}
      <h1 className="sr-only">
        درباره کانکس نیکان؛ کارگاه تخصصی ساخت کانکس کارگاهی، کانکس ویلایی،
        کانکس نگهبانی و کانکس ساندویچی در سراسر ایران
      </h1>

      {/* JSON-LD برای ارگان و صفحه درباره ما */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            { "@id": "https://conexnikan.com/#organization", ...orgSchema },
            aboutPageSchema,
          ]),
        }}
      />

      {/* ======================= Hero Section ======================= */}
      <Section
        title="دربارهٔ کانکس نیکان"
        subtitle="کارگاه تخصصی ساخت سازه‌های پیش‌ساخته؛ ترکیب مهندسی، کیفیت و دقت"
      >
        <div className="grid lg:grid-cols-[1.3fr_.9fr] gap-8">
          {/* متن + کارت ماموریت */}
          <div className="relative rounded-3xl border border-slate-200 bg-white/95 p-7 md:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.1)] space-y-6 overflow-hidden">
            {/* هاله رنگی */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 bg-sky-400/20 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-52 w-52 bg-fuchsia-500/15 blur-3xl rounded-full" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 border border-sky-300 bg-sky-50/60 backdrop-blur">
              <span className="text-sky-700">🚀</span>
              <span className="text-xs font-bold text-sky-700">
                ماموریت کارگاه کانکس نیکان
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-relaxed">
              تحویل سازه‌ای مقاوم، دقیق و زیبـا — با استانداردی که خیال شما را
              راحت کند
            </h2>

            <p className="leading-8 text-slate-700 text-sm md:text-base">
              کانکس نیکان یک{" "}
              <strong>
                کارگاه تخصصی ساخت کانکس کارگاهی، کانکس ویلایی، کانکس نگهبانی و
                کانکس ساندویچی
              </strong>{" "}
              است. ما از سال ۱۳۹۵ در زمینه{" "}
              <strong>تولید سازه‌های پیش‌ساخته فلزی با شاسی سنگین</strong>،
              عایق‌بندی استاندارد و اجرای دقیق کارگاهی فعالیت می‌کنیم و تلاش
              ما این است که هر کانکس، برای سال‌ها قابل اعتماد و قابل استفاده
              بماند.
            </p>

            <p className="leading-8 text-slate-700 text-sm md:text-base">
              تمرکز ما روی ساخت سازه‌هایی است که در پروژه‌های{" "}
              <strong>عمرانی، صنعتی، کارگاهی، ویلایی و تجاری</strong>، هم از نظر
              مقاومت و هم از نظر ظاهر، یک سروگردن بالاتر از سازه‌های معمولی
              باشند. در کانکس نیکان، قیمت‌گذاری، انتخاب متریال و برنامه تولید
              روی یک اصل مشترک می‌چرخد:{" "}
              <strong>شفافیت و تعادل بین کیفیت واقعی و بودجه کارفرما</strong>.
            </p>

            {/* کارت‌های کیفیت */}
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                [
                  "کیفیت ساخت",
                  "کنترل جوش، اسکلت، عایق و رنگ در تمام مراحل تولید کانکس.",
                  "🛠️",
                ],
                [
                  "زمان‌بندی دقیق",
                  "تحویل کانکس در بازهٔ زمانی توافق‌شده و قابل پیگیری.",
                  "⏱️",
                ],
                [
                  "پشتیبانی واقعی",
                  "گارانتی اجرا و پاسخ‌گویی شفاف بعد از تحویل سازه.",
                  "💬",
                ],
              ].map(([title, desc, emoji]) => (
                <div
                  key={title as string}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-white shadow-sm p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="font-bold text-slate-900 text-sm md:text-base">
                      {title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* آمار */}
          <div className="grid grid-cols-2 gap-4">
            <Stat label="سال شروع فعالیت کارگاه کانکس نیکان" value="۱۳۹۵" />
            <Stat label="پروژه‌های موفق در حوزه ساخت کانکس" value="۳۰۰+" />
            <Stat label="شهرهای پوشش‌دهی در سراسر ایران" value="۴۰+" />
            <Stat label="میانگین زمان ساخت و تحویل کانکس" value="۲–۳ هفته" />
          </div>
        </div>
      </Section>

      {/* ======================= چرا کانکس نیکان ======================= */}
      <Section
        title="چرا کانکس نیکان؟"
        subtitle="مزایایی که ما را از دیگر تولیدکنندگان کانکس متمایز می‌کند"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {[
            [
              "شاسی مقاوم",
              "استفاده از پروفیل صنعتی، شاسی سنگین و طراحی مناسب جابه‌جایی چندباره سازه.",
            ],
            [
              "عایق حرفه‌ای",
              "استفاده از XPS، پلی‌یورتان یا پشم‌سنگ براساس اقلیم و نوع کاربری کانکس.",
            ],
            [
              "الکتریک و تأسیسات",
              "سیم‌کشی اصولی، تابلو برق استاندارد و لوله‌کشی تمیز و قابل دسترس.",
            ],
            [
              "سفارشی‌سازی کامل",
              "چیدمان فضاها، تعداد و محل پنجره‌ها، نوع نما و رنگ طبق سلیقه شما.",
            ],
            [
              "حمل و نصب",
              "هماهنگی جرثقیل، حمل کانکس و استقرار روی فونداسیون یا بستر مناسب.",
            ],
            [
              "قیمت شفاف",
              "پیش‌فاکتور ریز آیتم‌ها، بدون ابهام و با توضیح کامل متریال مصرفی.",
            ],
          ].map(([title, desc], i) => (
            <div
              key={title as string}
              className="rounded-3xl border border-slate-200 bg-white/95 shadow-lg shadow-sky-100 p-6 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-600 to-fuchsia-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                  {i + 1}
                </div>
                <span className="font-extrabold text-slate-900 text-base">
                  {title}
                </span>
              </div>
              <p className="text-sm leading-7 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ======================= Timeline ======================= */}
      <Section
        title="مسیر رشد کانکس نیکان"
        subtitle="از یک کارگاه کوچک تا اجرای پروژه‌های سراسری"
      >
        <ol className="relative ps-6 space-y-5 border-s border-slate-300">
          {[
            [
              "۱۳۹۵",
              "آغاز فعالیت کارگاه کانکس نیکان با تمرکز بر ساخت کانکس کارگاهی در اطراف تهران.",
            ],
            [
              "۱۳۹۸",
              "گسترش خطوط تولید و اضافه شدن کانکس ویلایی، کانکس ساندویچی و سازه‌های تجاری.",
            ],
            [
              "۱۴۰۲",
              "استانداردسازی کنترل کیفیت و تدوین چک‌لیست تحویل برای تمام انواع کانکس.",
            ],
            [
              "امروز",
              "پوشش اغلب شهرهای کشور، اجرای پروژه‌های بزرگ و توسعه تیم نصب و پشتیبانی.",
            ],
          ].map(([year, text], idx) => (
            <li key={idx} className="relative">
              <div className="absolute -start-[7px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-sky-600 to-fuchsia-500 shadow" />
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
                {year}
              </h3>
              <p className="text-slate-600 text-sm mt-1 leading-6">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ======================= FAQ ======================= */}
      <Section
        title="سوالات پرتکرار درباره کارگاه کانکس نیکان"
        subtitle="پاسخ‌های کوتاه، دقیق و کاربردی قبل از ثبت سفارش"
      >
        <div className="rounded-3xl border border-slate-200 bg-white/95 shadow-lg shadow-sky-100 divide-y divide-slate-200">
          {[
            [
              "مدت زمان ساخت و تحویل کانکس چقدر است؟",
              "برای اکثر مدل‌های کانکس، بین ۲ تا ۳ هفته کاری زمان نیاز است. در پروژه‌های بزرگ یا تیراژ بالا، زمان دقیق در پیش‌فاکتور و قبل از شروع ساخت با شما نهایی می‌شود.",
            ],
            [
              "آیا امکان بازدید از کارگاه یا نمونه‌کارهای نصب‌شده وجود دارد؟",
              "بله؛ با هماهنگی قبلی می‌توانید از کارگاه کانکس نیکان بازدید کنید یا تعدادی از پروژه‌های اجرا شده را از نزدیک ببینید.",
            ],
            [
              "گارانتی کانکس شامل چه مواردی می‌شود؟",
              "اتصالات، شاسی، آب‌بندی و اجرای سازه تحت گارانتی کارگاه قرار می‌گیرد. جزئیات ضمانت در هنگام عقد قرارداد برای شما توضیح داده می‌شود.",
            ],
          ].map(([q, a]) => (
            <details key={q as string} className="group">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm md:text-base">
                  {q}
                </span>
                <span className="text-xs text-slate-400 group-open:rotate-180 transition">
                  ▼
                </span>
              </summary>
              <p className="px-6 pb-4 text-sm leading-7 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ======================= CTA ======================= */}
      <Section>
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-l from-sky-100/70 via-white to-fuchsia-100/40 p-7 md:p-9 shadow-xl shadow-sky-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-sky-600 to-fuchsia-500 bg-clip-text text-transparent drop-shadow">
              پروژهٔ بعدی شما از همین‌جا آغاز می‌شود
            </h2>
            <p className="text-sm text-slate-700 mt-3 leading-7">
              اگر به دنبال{" "}
              <strong>
                ساخت کانکس کارگاهی، کانکس ویلایی، کانکس نگهبانی یا کانکس
                ساندویچی
              </strong>{" "}
              با کیفیت مهندسی هستید، اطلاعات اولیه پروژه را ارسال کنید تا
              کارشناسان کانکس نیکان در کوتاه‌ترین زمان با شما تماس بگیرند.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center md:justify-end">
            <a
              href="/order"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-sky-600 to-fuchsia-500 text-white font-extrabold shadow-lg hover:brightness-110 transition"
            >
              ثبت سفارش کانکس
            </a>
            <a
              href="/contact"
              className="px-7 py-3 rounded-full border border-slate-300 bg-white text-slate-700 font-semibold hover:border-sky-600 hover:text-sky-700 transition"
            >
              مشاوره و تماس
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
