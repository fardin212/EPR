// app/contact/page.tsx – Contact Conex Nikan (SEO + UX Optimized)
import Section from "@/components/ui/Section";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ====================== SEO META ======================
export const metadata: Metadata = {
  title: "تماس با کانکس نیکان | مشاوره خرید و ساخت انواع کانکس",
  description:
    "برای مشاوره رایگان، استعلام قیمت و ثبت سفارش انواع کانکس کارگاهی، ویلایی، ساندویچی و نگهبانی با کانکس نیکان تماس بگیرید. راه‌های ارتباطی شامل تلفن، واتساپ، فرم آنلاین و بازدید از کارگاه.",
  alternates: {
    canonical: "https://conexnikan.com/contact",
  },
  openGraph: {
    title: "تماس با کانکس نیکان | مشاوره و استعلام قیمت کانکس",
    description:
      "از طریق تلفن، واتساپ یا فرم آنلاین با کانکس نیکان در ارتباط باشید و برای پروژه خود بهترین مدل کانکس را انتخاب کنید.",
    url: "https://conexnikan.com/contact",
    type: "website",
  },
};

// ====================== PAGE ======================
export default function ContactPage() {
  const phone = "09124237146";

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "تماس با کانکس نیکان",
    description:
      "اطلاعات تماس، مشاوره و راه‌های ارتباطی با کارگاه تولیدی کانکس نیکان برای سفارش انواع کانکس.",
    url: "https://conexnikan.com/contact",
    mainEntity: {
      "@type": "Organization",
      name: "کانکس نیکان",
      url: "https://conexnikan.com",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: `+98${phone}`,
          contactType: "customer service",
          areaServed: "IR",
          availableLanguage: ["fa"],
        },
      ],
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      {/* ================= HERO / INTRO ================= */}
      <Section
        id="contact-hero"
        title="تماس با کانکس نیکان"
        subtitle="برای مشاوره، استعلام قیمت و پیگیری سفارش، یکی از روش‌های زیر را انتخاب کنید"
      >
        <div className="grid gap-6 lg:grid-cols-[1.5fr,1.2fr] items-start">
          {/* ستون متن توضیحی */}
          <div className="bg-white/95 border border-slate-200 rounded-2xl p-5 md:p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] text-slate-700 text-sm md:text-[15px] leading-7 space-y-4">
            <p>
              صفحه <strong>تماس با کانکس نیکان</strong> برای این طراحی شده است که
              قبل از هر چیز، مسیر ارتباط شما با کارگاه کاملاً روشن و ساده باشد.
              چه برای اولین بار قصد استعلام قیمت داشته باشید و چه بخواهید درباره
              جزئیات یک سفارش در حال اجرا سؤال بپرسید، از همین صفحه می‌توانید
              سریع‌ترین روش ارتباطی را انتخاب کنید.
            </p>

            <p>
              تیم فروش و پشتیبانی ما هر روز در حال پاسخ‌گویی به کارفرماهایی است
              که به دنبال <strong>کانکس کارگاهی</strong>،{" "}
              <strong>کانکس ویلایی</strong>،{" "}
              <strong>کانکس ساندویچی و فست‌فود</strong> یا{" "}
              <strong>کانکس نگهبانی</strong> هستند. به همین دلیل تلاش کرده‌ایم
              فرایند دریافت اطلاعات اولیه، ارائه مشاوره و ارسال پیش‌فاکتور تا حد
              ممکن شفاف و مرحله‌به‌مرحله باشد.
            </p>

            <p>
              اگر هنوز نمی‌دانید دقیقاً چه مدلی مناسب پروژه شماست، کافی است
              اطلاعاتی مثل <strong>ابعاد حدودی، نوع کاربری و شهر پروژه</strong>{" "}
              را در اختیار ما بگذارید؛ در ادامه، کارشناسان نیکان مناسب‌ترین
              گزینه‌ها را بر اساس بودجه و شرایط محل نصب معرفی می‌کنند.
            </p>

            <p>
              برای پروژه‌های بزرگ‌تر، امکان برنامه‌ریزی برای بازدید از محل نصب
              یا ارسال تصاویر و نقشه‌ها نیز وجود دارد. در این موارد، بعد از
              بررسی شرایط، یک پیشنهاد فنی و مالی دقیق برای شما آماده می‌شود تا
              بتوانید با دید باز تصمیم‌گیری کنید.
            </p>

            <p>
              اگر در حال حاضر زمان تماس تلفنی ندارید، می‌توانید از فرم تماس
              آنلاین یا واتساپ استفاده کنید. تمام درخواست‌های ثبت‌شده در سیستم
              پشتیبانی کانکس نیکان ذخیره می‌شود تا هیچ پیام یا سوالی بدون پاسخ
              نماند.
            </p>
          </div>

          {/* ستون کارت‌های تماس مستقیم */}
          <div className="space-y-4">
            {/* تلفن و واتساپ */}
            <div className="rounded-2xl bg-gradient-to-b from-sky-50 via-white to-white border border-sky-100 shadow-[0_10px_32px_rgba(15,23,42,0.08)] p-5 md:p-6 space-y-4">
              <h2 className="text-sm md:text-base font-extrabold text-slate-900">
                تماس مستقیم با کارشناس فروش
              </h2>
              <p className="text-xs md:text-sm text-slate-700 leading-6">
                برای پرسیدن سؤال فوری درباره قیمت، زمان تحویل یا جزئیات فنی
                می‌توانید مستقیماً با کارشناس فروش کانکس نیکان تماس بگیرید یا در
                واتساپ پیام بدهید.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 text-xs md:text-sm">
                    شماره تماس (همراه / واتساپ)
                  </span>
                  <a
                    href={`tel:${phone}`}
                    className="font-bold text-sky-700 text-sm md:text-base"
                  >
                    {phone}
                  </a>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href={`tel:${phone}`}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs md:text-sm font-semibold shadow-[0_10px_26px_rgba(56,189,248,0.55)] hover:bg-sky-700 transition"
                >
                  تماس تلفنی فوری
                </a>
                <a
                  href={`https://wa.me/98${phone.slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-sky-500 text-sky-700 text-xs md:text-sm font-semibold hover:bg-sky-50 transition"
                >
                  ارسال پیام در واتساپ
                </a>
              </div>
            </div>

            {/* ساعات کاری و محل کارگاه */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 md:p-6 space-y-3 text-xs md:text-sm text-slate-700 leading-6">
              <h2 className="text-sm md:text-base font-extrabold text-slate-900 mb-1">
                ساعات پاسخ‌گویی و محل کارگاه
              </h2>
              <p>
                پاسخ‌گویی تلفنی و واتساپ در روزهای کاری معمولاً بین ساعت{" "}
                <strong>۹ صبح تا ۱۸</strong> انجام می‌شود. در صورت تماس خارج از
                این ساعات، پیام شما ثبت شده و در اولین فرصت با شما تماس گرفته
                خواهد شد.
              </p>
              <p>
                محل کارگاه تولیدی کانکس نیکان در محدوده صنعتی استان البرز قرار
                دارد و امکان هماهنگی برای <strong>بازدید حضوری</strong> از روند
                ساخت یا مشاهده چند نمونه کانکس آماده وجود دارد. برای برنامه‌ریزی
                بازدید حضوری، حتماً از قبل با واحد فروش هماهنگ کنید.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ================= فرم تماس / راهنمای تکمیل ================= */}
      <Section
        id="contact-form-guide"
        title="قبل از تماس چه اطلاعاتی آماده داشته باشم؟"
        subtitle="چند نکته کوتاه که کمک می‌کند مشاوره سریع‌تر و دقیق‌تری دریافت کنید"
      >
        <div className="grid gap-6 lg:grid-cols-[1.6fr,1.4fr] items-start">
          {/* راهنمای اطلاعات موردنیاز */}
          <div className="bg-white/95 border border-slate-200 rounded-2xl p-5 md:p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] text-xs md:text-sm text-slate-700 leading-7 space-y-4">
            <p>
              هرچقدر اطلاعات اولیه شما کامل‌تر باشد، سرعت برآورد هزینه و ارائه
              پیشنهاد مناسب بیشتر می‌شود. لازم نیست نقشه دقیق داشته باشید؛ همین
              که چند مورد کلیدی زیر را بدانید، برای آغاز مشاوره کافی است.
            </p>

            <h2 className="text-sm md:text-base font-extrabold text-slate-900">
              موارد مهم برای استعلام قیمت
            </h2>
            <ul className="list-disc pr-5 space-y-2">
              <li>
                نوع کانکس موردنظر: کارگاهی، مسکونی، ویلایی، ساندویچی، نگهبانی یا
                سفارشی
              </li>
              <li>ابعاد حدودی سازه (مثلاً ۳×۶، ۳×۹ یا متراژ دلخواه)</li>
              <li>محل نصب و شهر پروژه (برای محاسبه حمل و شرایط آب‌وهوایی)</li>
              <li>امکانات داخلی مدنظر مانند سرویس، دوش، آشپزخانه، اتاق خواب</li>
              <li>سطح کیفیت و بودجه تقریبی شما برای هر سازه</li>
            </ul>

            <p>
              بعد از دریافت این اطلاعات، معمولاً یک تا چند مدل پیشنهادی به همراه
              توضیح تفاوت‌ها، مزایا و قیمت تقریبی به شما معرفی می‌شود. در صورت
              نیاز می‌توان جزئیات بیشتری مثل نوع نما، کف‌پوش و تأسیسات را هم
              مشخص کرد تا پیش‌فاکتور دقیق صادر شود.
            </p>

            <h2 className="text-sm md:text-base font-extrabold text-slate-900">
              پیگیری سفارش‌های در حال ساخت
            </h2>
            <p>
              اگر قبلاً از کانکس نیکان سفارش ثبت کرده‌اید، هنگام تماس شماره
              فاکتور یا نام پروژه را در اختیار پشتیبانی قرار دهید تا وضعیت ساخت،
              زمان آماده‌سازی، تاریخ تقریبی ارسال و سایر جزئیات سریع‌تر بررسی و
              اعلام شود.
            </p>
          </div>

          {/* دعوت به استفاده از فرم آنلاین / لینک به فرم پیش‌فاکتور */}
          <div className="bg-gradient-to-b from-sky-50 via-white to-violet-50 border border-sky-100 rounded-2xl p-5 md:p-6 shadow-[0_14px_45px_rgba(15,23,42,0.12)] space-y-4 text-xs md:text-sm text-slate-700 leading-7">
            <h2 className="text-sm md:text-base font-extrabold text-slate-900 mb-1">
              اگر الان فرصت تماس تلفنی ندارید
            </h2>
            <p>
              می‌توانید فرم درخواست پیش‌فاکتور را در سایت تکمیل کنید تا اطلاعات
              شما به‌صورت کامل در سیستم ثبت شود. پس از بررسی اولیه، کارشناس
              فروش با شما تماس می‌گیرد و درباره جزئیات پروژه سؤال‌های تکمیلی را
              مطرح می‌کند.
            </p>
            <p>
              در این روش، پیام و اطلاعات شما حتی اگر مشغول باشید یا تلفن در
              دسترس نباشد، از دست نمی‌رود و می‌توانید در زمان مناسب تماس
              بگیرید یا پاسخ‌گو باشید.
            </p>
            <div className="pt-2">
              <Link
                href="/#quote"
                className="inline-flex items-center justify-center px-7 py-2.5 rounded-2xl bg-sky-600 text-white text-xs md:text-sm font-semibold shadow-[0_10px_30px_rgba(37,99,235,0.55)] hover:bg-sky-700 transition"
              >
                رفتن به فرم درخواست پیش‌فاکتور
              </Link>
            </div>
            <p className="text-[11px] md:text-xs text-slate-600 mt-1">
              اگر ترجیح می‌دهید فقط یک پیام کوتاه بفرستید، ارسال یادداشت در
              واتساپ نیز کافی است؛ همکاران ما معمولاً در اولین بازه زمانی آزاد
              پاسخ‌گو خواهند بود.
            </p>
          </div>
        </div>
      </Section>

      {/* ================= سوالات متداول کوتاه مخصوص تماس ================= */}
      <Section
        id="contact-faq"
        title="سوالات متداول قبل از تماس با کانکس نیکان"
        subtitle="چند پرسش کوتاه که معمولاً قبل از برقراری ارتباط مطرح می‌شود"
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] space-y-3 text-xs md:text-sm text-slate-700 leading-7">
          <details className="border border-slate-200 rounded-xl p-3 md:p-4 bg-slate-50/70">
            <summary className="cursor-pointer font-semibold text-slate-900">
              چه زمانی برای تماس گرفتن مناسب‌تر است؟
            </summary>
            <p className="mt-2">
              بهترین زمان تماس در روزهای کاری بین ساعت ۹ تا ۱۸ است. در این
              بازه، امکان اتصال مستقیم به کارشناس فروش و دریافت پاسخ سریع‌تر
              بیشتر است. خارج از این ساعات هم می‌توانید پیام خود را در واتساپ یا
              فرم سایت ثبت کنید.
            </p>
          </details>

          <details className="border border-slate-200 rounded-xl p-3 md:p-4 bg-slate-50/70">
            <summary className="cursor-pointer font-semibold text-slate-900">
              آیا مشاوره اولیه هزینه‌ای دارد؟
            </summary>
            <p className="mt-2">
              خیر. مشاوره اولیه برای بررسی نوع پروژه، ابعاد، شرایط محل نصب و
              انتخاب مدل مناسب کانکس کاملاً رایگان است. هدف ما این است که قبل
              از هر تصمیم، تصویر دقیق‌تری از هزینه و گزینه‌های موجود داشته
              باشید.
            </p>
          </details>

          <details className="border border-slate-200 rounded-xl p-3 md:p-4 bg-slate-50/70">
            <summary className="cursor-pointer font-semibold text-slate-900">
              بعد از ثبت درخواست، چه مدت طول می‌کشد تا با من تماس بگیرید؟
            </summary>
            <p className="mt-2">
              در ساعات کاری معمولاً حداکثر ظرف چند ساعت با شما تماس گرفته
              می‌شود. اگر درخواست شما در ساعات غیرکاری ثبت شده باشد، در اولین
              روز و بازه کاری بعدی پیگیری خواهد شد.
            </p>
          </details>
        </div>
      </Section>
    </>
  );
}
