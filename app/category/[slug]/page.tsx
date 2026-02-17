// app/category/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: { slug: string };
};

const BASE_URL = "https://conexnikan.com";

// شماره واتساپ واحد (یکدست در کل صفحه)
const WHATSAPP_E164 = "989124237146"; // 09124237146
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_E164}`;

async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,

      // فقط فیلدهایی که در Prisma Schema داریم
      seoTitle: true,
      seoDescription: true,
      summary: true,
      contentHtml: true,
      faqJson: true,
      specsJson: true,
      galleryJson: true,

      imageUrl: true,
    },
  });

  if (!category) return null;
  return category;
}

/* -------------------- SEO -------------------- */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "دسته‌بندی یافت نشد | کانکس نیکان",
      description: "دسته‌بندی مورد نظر در کانکس نیکان یافت نشد.",
    };
  }

  const title = category.seoTitle || `${category.name} | کانکس نیکان`;

  const description =
    category.seoDescription ||
    (category.summary
      ? category.summary.slice(0, 150)
      : `مشخصات، کاربردها و نمونه‌کارهای ${category.name} در کانکس نیکان.`);

  const canonicalUrl = `${BASE_URL}/category/${encodeURIComponent(category.slug)}`;

  // تصویر OG: اول imageUrl، بعد fallback
  const rawOgImage = category.imageUrl || "/images/fallback-metal.jpg";

  const ogImageUrl = rawOgImage.startsWith("http")
    ? rawOgImage
    : `${BASE_URL}${rawOgImage.startsWith("/") ? rawOgImage : `/${rawOgImage}`}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "کانکس نیکان",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${category.name} | کانکس نیکان`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/* -------------------- PAGE -------------------- */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = decodeURIComponent(params.slug);
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const summary = category.summary?.trim() || "";
  const contentHtml = category.contentHtml?.trim() || "";

  // تشخیص ویلایی (برای تقویت خوشه ویلایی بدون ایجاد تغییر در سایر دسته‌ها)
  const isVilla =
    category.slug.toLowerCase().includes("vill") ||
    /ویلایی/.test(`${category.name || ""} ${category.seoTitle || ""} ${category.summary || ""}`);

  // FAQ
  const faqItems: { question: string; answer: string }[] = Array.isArray(category.faqJson as any)
    ? ((category.faqJson as any) as { question: string; answer: string }[])
    : [];

  // مشخصات
  const specs: { label: string; value: string }[] = Array.isArray(category.specsJson as any)
    ? ((category.specsJson as any) as { label: string; value: string }[])
    : [];

  // گالری – هم رشته، هم آبجکت {url, alt} را پشتیبانی می‌کنیم
  const rawGallery = Array.isArray(category.galleryJson as any) ? (category.galleryJson as any) : [];

  const gallery: { url: string; alt?: string }[] = rawGallery
    .map((item: any) => {
      if (!item) return null;
      if (typeof item === "string") return { url: item, alt: undefined };
      if (typeof item === "object" && typeof item.url === "string") return { url: item.url, alt: item.alt };
      return null;
    })
    .filter(Boolean) as { url: string; alt?: string }[];

  const coverUrl = category.imageUrl || gallery[0]?.url || "/images/fallback-metal.jpg";
  const coverAlt = gallery[0]?.alt || `${category.name} – کانکس نیکان`;
  const extraGallery = gallery.slice(1);

  /* --------- زیر‌دسته‌ها --------- */
  const children = await prisma.category.findMany({
    where: { parentId: category.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, imageUrl: true },
  });

  const allCatIds = [category.id, ...children.map((c) => c.id)];

  /* --------- پروژه‌ها + تصویر کاور --------- */
  const projects = await prisma.project.findMany({
    where: { categoryId: { in: allCatIds } },
    orderBy: { id: "desc" },
    include: { category: { select: { name: true } } },
    take: 20,
  });

  const projectIds = projects.map((p) => p.id);

  const images = projectIds.length
    ? await prisma.image.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { id: "asc" },
      })
    : [];

  const coverByProject = new Map<number, string>();
  for (const img of images) {
    if (!img.projectId) continue;
    if (!coverByProject.has(img.projectId)) coverByProject.set(img.projectId, img.url);
  }

  // عنوانی که در Hero نشان داده می‌شود: ترجیحاً seoTitle، در غیر این صورت name
  const heroTitle = category.seoTitle || category.name;

  // ---------- PRODUCT SCHEMA ---------- //
  const absoluteCoverUrl = coverUrl.startsWith("http")
    ? coverUrl
    : `${BASE_URL}${coverUrl.startsWith("/") ? coverUrl : `/${coverUrl}`}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: category.name,
    image: absoluteCoverUrl,
    url: `${BASE_URL}/category/${category.slug}`,
    brand: { "@type": "Brand", name: "کانکس نیکان" },
    description: category.seoDescription || `مدل‌ها، مشخصات و نمونه‌کارهای ${category.name} در کانکس نیکان.`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IRR",
      lowPrice: isVilla ? "250000000" : "95000000",
      highPrice: isVilla ? "2500000000" : "650000000",
      offerCount: "1",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "37",
    },
  };

  // ---------- FAQ SCHEMA (اگر FAQ داشته باشیم) ---------- //
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

  // ---------- Breadcrumb SCHEMA ---------- //
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "دسته‌بندی‌ها", item: `${BASE_URL}/category` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${BASE_URL}/category/${category.slug}` },
    ],
  };

  return (
    <main className="bg-slate-50 pb-24">
      {/* H1 اصلی برای سئو */}
      <h1 className="sr-only">{heroTitle}</h1>

      {/* JSON-LD برای Product Snippet */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      {/* JSON-LD برای FAQ (اگر وجود داشته باشد) */}
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* JSON-LD برای Breadcrumb */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* HERO بالای صفحه */}
      <section className="relative overflow-hidden text-slate-50">
        {/* تصویر پس‌زمینه + اوورلی */}
        <div className="absolute inset-0">
          <Image src={coverUrl} alt={coverAlt} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-slate-900/80" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/90 via-slate-900/75 to-slate-900/45" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-14 lg:pt-20 lg:pb-20">
          {/* breadcrumb */}
          <nav className="flex items-center gap-1 text-[11px] md:text-xs text-slate-200 mb-4 drop-shadow">
            <Link href="/" className="hover:text-emerald-300">
              صفحه اصلی
            </Link>
            <span>/</span>
            <Link href="/category" className="hover:text-emerald-300">
              دسته‌بندی‌ها
            </Link>
            <span>/</span>
            <span className="text-emerald-300 font-semibold">{category.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
            {/* باکس متن سمت چپ */}
            <div className="flex-1">
              <div className="bg-slate-900/85 border border-white/10 rounded-3xl px-6 py-5 lg:px-7 lg:py-6 backdrop-blur-sm shadow-lg max-w-2xl ml-auto">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-300 mb-2 drop-shadow">
                  <span className="inline-block w-1 h-1 rounded-full bg-emerald-300" />
                  دسته‌بندی کانکس نیکان
                </p>

                <h2
                  className="text-2xl md:text-3xl lg:text-[32px] font-extrabold mb-3 leading-[1.3] drop-shadow-sm text-slate-50"
                  style={{ background: "transparent", boxShadow: "none", padding: 0, display: "block" }}
                >
                  {heroTitle}
                </h2>

                {summary && (
                  <p
                    className="text-xs md:text-[13px] lg:text-sm leading-7 drop-shadow-sm text-slate-100"
                    style={{ background: "transparent", boxShadow: "none", padding: 0, display: "block" }}
                  >
                    {summary}
                  </p>
                )}

                {/* لینک‌های سریع */}
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] md:text-xs">
                  <a
                    href="#overview"
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                  >
                    معرفی و کاربردها
                  </a>
                  {isVilla && (
                    <a
                      href="#villa-price"
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                    >
                      قیمت و مشاوره فوری
                    </a>
                  )}
                  {children.length > 0 && (
                    <a
                      href="#subcats"
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                    >
                      زیر‌دسته‌ها
                    </a>
                  )}
                  {projects.length > 0 && (
                    <a
                      href="#projects"
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                    >
                      نمونه‌کارهای این دسته
                    </a>
                  )}
                  {specs.length > 0 && (
                    <a
                      href="#specs"
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-slate-50 hover:bg-emerald-400 hover:text-slate-900 transition"
                    >
                      مشخصات فنی
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
                </div>
              </div>
            </div>

            {/* کارت مشاوره سمت راست */}
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
                  چرا {category.name} از کانکس نیکان؟
                </h2>

                <ul className="space-y-1.5 text-[11px] leading-5">
                  <li style={{ color: "#f9fafb", opacity: 1, textShadow: "0 0 10px rgba(15,23,42,0.9)" }}>
                    طراحی اختصاصی بر اساس نوع کسب‌وکار و محل نصب شما
                  </li>
                  <li style={{ color: "#f9fafb", opacity: 1, textShadow: "0 0 10px rgba(15,23,42,0.9)" }}>
                    متریال مقاوم، عایق مناسب و اجرای استاندارد
                  </li>
                  <li style={{ color: "#f9fafb", opacity: 1, textShadow: "0 0 10px rgba(15,23,42,0.9)" }}>
                    زمان ساخت و نصب کوتاه با حداقل توقف کار
                  </li>
                  <li style={{ color: "#f9fafb", opacity: 1, textShadow: "0 0 10px rgba(15,23,42,0.9)" }}>
                    امکان توسعه، جابجایی و تغییر در آینده
                  </li>
                </ul>

                <a
                  href="/order"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 text-white text-[11px] font-extrabold py-2 hover:bg-emerald-400 transition"
                >
                  درخواست مشاوره و برآورد قیمت
                </a>

                {isVilla && (
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-slate-500 text-[11px] font-bold py-2 hover:bg-slate-800/80 transition"
                  >
                    گفت‌وگو در واتساپ (ویلایی)
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* بلوک ویژه ویلایی: قیمت + مقایسه (سیگنال فروش/رفتار) */}
      {isVilla && (
        <section id="villa-price" className="max-w-6xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl border shadow-sm p-5 md:p-6">
            <h2 className="text-base md:text-lg font-extrabold text-slate-900">قیمت کانکس ویلایی (بازه تقریبی)</h2>
            <p className="mt-2 text-[13px] md:text-sm text-slate-600 leading-7">
              قیمت نهایی به متراژ، پلان (تعداد اتاق‌ها)، نوع عایق، نوع پنجره‌ها، نمای بیرونی و امکانات داخلی بستگی دارد.
              برای اعلام قیمت دقیق، ابعاد و امکانات مدنظر را بفرستید.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3 border">
                <div className="text-xs text-slate-500">مدل اقتصادی</div>
                <div className="mt-1 font-bold text-slate-900">ویلایی ساده</div>
                <div className="mt-1 text-[12px] text-slate-600">برای باغ و اقامت کوتاه‌مدت</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border">
                <div className="text-xs text-slate-500">مدل استاندارد</div>
                <div className="mt-1 font-bold text-slate-900">ویلایی مجهز</div>
                <div className="mt-1 text-[12px] text-slate-600">پلان بهینه + امکانات کامل</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border">
                <div className="text-xs text-slate-500">مدل لوکس</div>
                <div className="mt-1 font-bold text-slate-900">نمای خاص + سفارشی</div>
                <div className="mt-1 text-[12px] text-slate-600">برای ویلا و اقامت دائمی</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/order"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-white font-extrabold text-xs hover:bg-emerald-400 transition"
              >
                استعلام قیمت ویلایی
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border px-4 py-2 text-xs font-bold hover:bg-slate-50 transition"
              >
                واتساپ مستقیم
              </a>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 border p-4">
              <h3 className="font-extrabold text-sm text-slate-900">مقایسه سریع با ساخت سنتی</h3>
              <ul className="mt-2 grid gap-2 text-[13px] text-slate-700 leading-6">
                <li>✅ زمان اجرا: سریع‌تر آماده و قابل استفاده</li>
                <li>✅ کنترل هزینه: شفاف و مرحله‌ای</li>
                <li>✅ قابلیت جابه‌جایی: امکان انتقال در صورت نیاز</li>
                <li>✅ سفارشی‌سازی: پلان، نما و امکانات داخلی قابل انتخاب</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* بدنه صفحه */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)]">
          {/* ستون اصلی */}
          <div className="space-y-8">
            {/* معرفی */}
            {contentHtml && (
              <section id="overview" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                <h2 className="text-base md:text-lg font-extrabold mb-3 text-slate-900">
                  معرفی {category.name} و کاربردها
                </h2>

                <div
                  className="
                    prose prose-sm md:prose-base max-w-none prose-headings:text-slate-900
                    prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900
                    prose-ul:list-disc prose-ul:pr-5
                    [&>*:first-child]:mt-0
                  "
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              </section>
            )}

            {/* زیر‌دسته‌ها */}
            {children.length > 0 && (
              <section id="subcats" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                <h2 className="text-base md:text-lg font-extrabold mb-2 text-slate-900">
                  زیر‌دسته‌های کانکس {category.name}
                </h2>
                <p className="text-xs md:text-sm text-slate-600 mb-4">
                  بر اساس کاربری دقیق‌تر، یکی از زیر‌دسته‌های زیر را انتخاب کنید تا مشخصات و نمونه‌کارهای مرتبط را ببینید.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {children.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      className="group bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                    >
                      <div className="relative h-28 w-full">
                        <Image
                          src={c.imageUrl || "/images/fallback-metal.jpg"}
                          alt={`کانکس ${c.name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="font-bold text-sm md:text-base text-slate-900">{c.name}</h3>
                        <p className="text-[11px] md:text-xs text-slate-600 leading-5">
                          مشاهده مدل‌ها و نمونه‌کارهای دسته <strong>{c.name}</strong>.
                        </p>
                        <span className="inline-block mt-1 text-[var(--accent)] text-[11px] md:text-xs font-semibold group-hover:underline">
                          ورود به این زیر‌دسته
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* نمونه‌کارها */}
            {projects.length > 0 && (
              <section id="projects" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                <h2 className="text-base md:text-lg font-extrabold mb-2 text-slate-900">
                  نمونه‌کارهای انجام‌شده در دسته {category.name}
                </h2>
                <p className="text-xs md:text-sm text-slate-600 mb-4">
                  در این بخش، پروژه‌هایی را می‌بینید که در دسته <strong>{category.name}</strong> و زیر‌دسته‌های آن ساخته شده‌اند.
                </p>

                <div className="proj-grid">
                  {projects.map((p) => {
                    const cover = coverByProject.get(p.id) || "/images/fallback-metal.jpg";
                    const catName = p.category?.name ?? "";

                    return (
                      <Link key={p.slug} href={`/portfolio/${p.slug}`} className="proj-card group">
                        <div className="proj-img">
                          <Image
                            src={cover}
                            alt={p.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform"
                          />
                          {catName && <span className="proj-badge">{catName}</span>}
                        </div>
                        <div className="proj-body">
                          <h3 className="proj-title text-sm md:text-base">{p.title}</h3>
                          <p className="text-[var(--text-mid)] text-xs md:text-sm line-clamp-2">
                            اجرای کانکس در دسته {catName} با ابعاد و مشخصات سفارشی بر اساس نیاز کارفرما.
                          </p>
                          <span className="proj-link mt-2">مشاهده جزئیات پروژه</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* مشخصات فنی */}
            {specs.length > 0 && (
              <section id="specs" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                <h2 className="text-base md:text-lg font-extrabold mb-3 text-slate-900">
                  مشخصات کلی {category.name}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {specs.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 flex flex-col gap-1"
                    >
                      <div className="text-[11px] font-semibold text-slate-500">{s.label}</div>
                      <div className="text-sm text-slate-800 leading-6">{s.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {faqItems.length > 0 && (
              <section id="faq" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                <h2 className="text-base md:text-lg font-extrabold mb-4 text-slate-900">
                  سوالات متداول درباره {category.name}
                </h2>
                <div className="space-y-3">
                  {faqItems.map((f, i) => (
                    <details key={i} className="group rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-800 flex items-center justify-between gap-3">
                        <span>{f.question}</span>
                        <span className="text-xs text-slate-500 group-open:rotate-180 transition">⌄</span>
                      </summary>
                      <p className="mt-2 text-[13px] leading-6 text-slate-700">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ستون کناری */}
          <aside className="space-y-4 lg:sticky lg:top-28 self-start">
            {/* گالری */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <h3 className="text-sm font-extrabold mb-3 text-slate-900">نمای بیرونی و داخلی {category.name}</h3>

              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={coverUrl}
                  alt={coverAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width:1024px) 30vw, 100vw"
                />
              </div>

              {extraGallery.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {extraGallery.map((g, i) => (
                    <div key={i} className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src={g.url}
                        alt={g.alt || `${category.name} – تصویر ${i + 2} – کانکس نیکان`}
                        fill
                        className="object-cover"
                        sizes="(min-width:1024px) 14vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              )}

              {gallery.length === 0 && (
                <p className="mt-3 text-[12px] text-slate-500">
                  برای این دسته هنوز تصویری ثبت نشده است. از طریق پنل ادمین می‌توانید گالری تصاویر را کامل کنید.
                </p>
              )}
            </div>

            {/* CTA کناری */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 text-sm space-y-2 shadow-md">
              <h3 className="font-extrabold text-[15px]">مشاوره تخصصی برای انتخاب {category.name}</h3>
              <p className="text-slate-100/90 text-[13px] leading-6">
                اگر برای نوع سازه، متراژ یا طراحی مردد هستید، جزئیات پروژه و کسب‌وکارتان را بگویید تا کارشناسان کانکس نیکان بهترین گزینه را پیشنهاد دهند.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                <a
                  href="/order"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-emerald-400 text-slate-900 font-bold text-xs hover:bg-emerald-300 transition"
                >
                  ثبت درخواست مشاوره و قیمت
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-slate-500 text-[11px] hover:bg-slate-800/80 transition"
                >
                  گفت‌وگو در واتساپ با کانکس نیکان
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA چسبنده موبایل فقط برای ویلایی */}
      {isVilla && (
        <div className="fixed bottom-3 left-3 right-3 z-50 md:hidden">
          <div className="mx-auto max-w-md flex gap-2 rounded-2xl bg-white/95 border p-2 shadow-lg backdrop-blur">
            <a
              href="/order"
              className="flex-1 rounded-xl bg-emerald-500 py-2 text-center text-white font-extrabold text-xs"
            >
              استعلام قیمت ویلایی
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border py-2 text-center text-xs font-bold"
            >
              واتساپ
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
