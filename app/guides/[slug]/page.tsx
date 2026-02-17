// app/guides/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type GuidePageProps = {
  params: { slug: string };
};

const BASE_URL = "https://conexnikan.com";

// اگر لوگو داری مسیر واقعی‌اش را بگذار (ترجیحاً 512x512)
const PUBLISHER_LOGO = `${BASE_URL}/icons/icon-512.png`;

async function getGuideBySlug(slug: string) {
  const guide = await prisma.guide.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      keyword: true,

      seoTitle: true,
      seoDescription: true,
      summary: true,
      contentHtml: true,
      faqJson: true,
      specsJson: true,
      galleryJson: true,

      imageUrl: true,
      createdAt: true, // ✅ لازم برای datePublished
      updatedAt: true,
    },
  });

  return guide || null;
}

/* -------------------- SEO -------------------- */
export async function generateMetadata(
  { params }: GuidePageProps
): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "راهنما یافت نشد | کانکس نیکان",
      description: "راهنمای مورد نظر در کانکس نیکان یافت نشد.",
      robots: { index: false, follow: false },
    };
  }

  const title = guide.seoTitle || `${guide.name} | راهنمای کانکس نیکان`;

  const description =
    guide.seoDescription ||
    (guide.summary
      ? guide.summary.slice(0, 160)
      : `راهنمای کامل ${guide.name} در کانکس نیکان: تعریف، انواع، قیمت، نکات خرید و سوالات متداول.`);

  const canonicalUrl = `${BASE_URL}/guides/${encodeURIComponent(guide.slug)}`;

  const rawOgImage = guide.imageUrl || "/images/fallback-metal.jpg";
  const ogImageUrl = rawOgImage.startsWith("http")
    ? rawOgImage
    : `${BASE_URL}${rawOgImage.startsWith("/") ? rawOgImage : `/${rawOgImage}`}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "کانکس نیکان",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${guide.name} | کانکس نیکان`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

/* -------------------- PAGE -------------------- */
export default async function GuidePage({ params }: GuidePageProps) {
  const slug = decodeURIComponent(params.slug);
  const guide = await getGuideBySlug(slug);

  if (!guide) notFound();

  const summary = guide.summary?.trim() || "";
  const contentHtml = guide.contentHtml?.trim() || "";

  // FAQ
  const faqItems: { question: string; answer: string }[] = Array.isArray(
    guide.faqJson as any
  )
    ? ((guide.faqJson as any) as { question: string; answer: string }[])
    : [];

  // Specs
  const specs: { label: string; value: string }[] = Array.isArray(
    guide.specsJson as any
  )
    ? ((guide.specsJson as any) as { label: string; value: string }[])
    : [];

  // Gallery (string | {url, alt})
  const rawGallery = Array.isArray(guide.galleryJson as any)
    ? (guide.galleryJson as any)
    : [];

  const gallery: { url: string; alt?: string }[] = rawGallery
    .map((item: any) => {
      if (!item) return null;
      if (typeof item === "string") return { url: item, alt: undefined };
      if (typeof item === "object" && typeof item.url === "string")
        return { url: item.url, alt: item.alt };
      return null;
    })
    .filter(Boolean) as { url: string; alt?: string }[];

  const coverUrl =
    guide.imageUrl || gallery[0]?.url || "/images/fallback-metal.jpg";
  const coverAlt = gallery[0]?.alt || `${guide.name} – کانکس نیکان`;
  const extraGallery = gallery.slice(1);

  const heroTitle = guide.seoTitle || guide.name;
  const canonicalUrl = `${BASE_URL}/guides/${encodeURIComponent(guide.slug)}`;

  const absoluteCoverUrl = coverUrl.startsWith("http")
    ? coverUrl
    : `${BASE_URL}${coverUrl.startsWith("/") ? coverUrl : `/${coverUrl}`}`;

  // ---------- Article Schema ---------- //
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: heroTitle,
    description:
      guide.seoDescription ||
      `راهنمای کامل ${guide.name} در کانکس نیکان: نکات خرید، انواع، قیمت و سوالات متداول.`,
    image: [absoluteCoverUrl],
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    datePublished: guide.createdAt, // ✅
    dateModified: guide.updatedAt,
    author: {
      "@type": "Organization",
      name: "کانکس نیکان",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "کانکس نیکان",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
      },
    },
  };

  // ---------- FAQ Schema ---------- //
  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  // ---------- Breadcrumb Schema ---------- //
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "راهنماها",
        item: `${BASE_URL}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <main className="bg-slate-50 pb-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden text-slate-50">
        <div className="absolute inset-0">
          <Image
            src={coverUrl}
            alt={coverAlt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/80" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/90 via-slate-900/75 to-slate-900/45" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-14 lg:pt-20 lg:pb-20">
          <nav className="flex items-center gap-1 text-[11px] md:text-xs text-slate-200 mb-4 drop-shadow">
            <Link href="/" className="hover:text-emerald-300">
              صفحه اصلی
            </Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-emerald-300">
              راهنماها
            </Link>
            <span>/</span>
            <span className="text-emerald-300 font-semibold">{guide.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
            <div className="flex-1">
              <div className="bg-slate-900/85 border border-white/10 rounded-3xl px-6 py-5 lg:px-7 lg:py-6 backdrop-blur-sm shadow-lg max-w-2xl ml-auto">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-300 mb-2 drop-shadow">
                  <span className="inline-block w-1 h-1 rounded-full bg-emerald-300" />
                  راهنمای تخصصی کانکس نیکان
                </p>

                {/* ✅ H1 واقعی */}
                <h1
                  className="text-2xl md:text-3xl lg:text-[32px] font-extrabold mb-3 leading-[1.3] drop-shadow-sm text-slate-50"
                  style={{
                    background: "transparent",
                    boxShadow: "none",
                    padding: 0,
                    display: "block",
                  }}
                >
                  {heroTitle}
                </h1>

                {summary && (
                  <p
                    className="text-xs md:text-[13px] lg:text-sm leading-7 drop-shadow-sm text-slate-100"
                    style={{
                      background: "transparent",
                      boxShadow: "none",
                      padding: 0,
                      display: "block",
                    }}
                  >
                    {summary}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] md:text-xs">
                  <a
                    href="#overview"
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                  >
                    معرفی و نکات اصلی
                  </a>

                  {/* ✅ پرش به بخش انواع (حتی اگر داخل contentHtml آی‌دی نزاری) */}
                  <a
                    href="#types"
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                  >
                    انواع {guide.name}
                  </a>

                  {specs.length > 0 && (
                    <a
                      href="#specs"
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                    >
                      نکات کلیدی / مشخصات
                    </a>
                  )}
                  {faqItems.length > 0 && (
                    <a
                      href="#faq"
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                    >
                      سوالات متداول
                    </a>
                  )}
                  <a
                    href="#cta"
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                  >
                    مشاوره و استعلام
                  </a>
                </div>

                <div className="mt-4 text-[11px] text-slate-300">
                  آدرس:{" "}
                  <span className="text-slate-100">
                    {canonicalUrl.replace(BASE_URL, "")}
                  </span>
                </div>
              </div>
            </div>

            {/* کارت CTA */}
            <div className="w-full max-w-xs lg:max-w-sm">
              <div
                className="rounded-3xl border p-5 shadow-xl"
                style={{
                  background: "rgba(15,23,42,1)",
                  borderColor: "rgba(148,163,184,0.7)",
                  color: "#f9fafb",
                  position: "relative",
                  zIndex: 40,
                }}
              >
                <h2 className="text-[13px] font-extrabold mb-3 text-slate-50">
                  مشاوره برای انتخاب {guide.name}
                </h2>
                <ul className="space-y-1.5 text-[11px] leading-5">
                  <li
                    style={{
                      color: "#f9fafb",
                      textShadow: "0 0 10px rgba(15,23,42,0.9)",
                    }}
                  >
                    معرفی دقیق مدل‌ها و انتخاب درست بر اساس نیاز شما
                  </li>
                  <li
                    style={{
                      color: "#f9fafb",
                      textShadow: "0 0 10px rgba(15,23,42,0.9)",
                    }}
                  >
                    بررسی متریال، عایق، شاسی و کیفیت ساخت
                  </li>
                  <li
                    style={{
                      color: "#f9fafb",
                      textShadow: "0 0 10px rgba(15,23,42,0.9)",
                    }}
                  >
                    برآورد قیمت + زمان ساخت و نصب
                  </li>
                </ul>

                <a
                  href="/order"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 text-white text-[11px] font-extrabold py-2 hover:bg-emerald-400 transition"
                >
                  درخواست مشاوره و برآورد قیمت
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* بدنه */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)]">
          {/* ستون اصلی */}
          <div className="space-y-8">
            {contentHtml && (
              <section
                id="overview"
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6"
              >
                {/* ✅ Anchor برای انواع */}
                <div id="types" className="scroll-mt-28" />

                <h2 className="text-base md:text-lg font-extrabold mb-3 text-slate-900">
                  راهنمای کامل {guide.name}
                </h2>

                <div
                  className="prose prose-sm md:prose-base max-w-none prose-headings:text-slate-900
                             prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900
                             prose-ul:list-disc prose-ul:pr-5 [&>*:first-child]:mt-0"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </section>
            )}

            {specs.length > 0 && (
              <section
                id="specs"
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6"
              >
                <h2 className="text-base md:text-lg font-extrabold mb-3 text-slate-900">
                  نکات کلیدی و جمع‌بندی {guide.name}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {specs.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 flex flex-col gap-1"
                    >
                      <div className="text-[11px] font-semibold text-slate-500">
                        {s.label}
                      </div>
                      <div className="text-sm text-slate-800 leading-6">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {faqItems.length > 0 && (
              <section
                id="faq"
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6"
              >
                <h2 className="text-base md:text-lg font-extrabold mb-4 text-slate-900">
                  سوالات متداول درباره {guide.name}
                </h2>
                <div className="space-y-3">
                  {faqItems.map((f, i) => (
                    <details
                      key={i}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-slate-800 flex items-center justify-between gap-3">
                        <span>{f.question}</span>
                        <span className="text-xs text-slate-500 group-open:rotate-180 transition">
                          ⌄
                        </span>
                      </summary>
                      <p className="mt-2 text-[13px] leading-6 text-slate-700">
                        {f.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* CTA پایانی */}
            <section
              id="cta"
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6"
            >
              <h2 className="text-base md:text-lg font-extrabold text-slate-900">
                برای انتخاب {guide.name} مناسب، مشاوره بگیرید
              </h2>
              <p className="mt-2 text-sm text-slate-700 leading-7">
                اگر بین چند مدل مردد هستید یا قیمت دقیق می‌خواهید، فرم سفارش را
                تکمیل کنید تا تیم کانکس نیکان راهنمایی‌تان کند.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href="/order"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white text-sm font-extrabold px-5 py-3 hover:bg-emerald-500 transition"
                >
                  مشاوره و استعلام قیمت
                </a>
                <Link
                  href="/category"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-extrabold px-5 py-3 hover:bg-slate-50 transition"
                >
                  مشاهده دسته‌بندی‌ها
                </Link>
              </div>
            </section>
          </div>

          {/* ستون راست */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">
                مسیرهای مرتبط
              </h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/guides"
                  className="block rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 hover:bg-slate-50 transition"
                >
                  همه راهنماها
                </Link>
                <Link
                  href="/category"
                  className="block rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 hover:bg-slate-50 transition"
                >
                  دسته‌بندی کانکس‌ها
                </Link>
                <Link
                  href="/order"
                  className="block rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 hover:bg-emerald-100 transition font-bold"
                >
                  مشاوره و استعلام قیمت
                </Link>
              </div>
            </div>

            {extraGallery.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                <h3 className="text-sm font-extrabold text-slate-900 mb-3">
                  تصاویر بیشتر
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {extraGallery.slice(0, 6).map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-100 bg-slate-100"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || `${guide.name} تصویر ${i + 2}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
