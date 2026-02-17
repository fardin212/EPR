// app/post/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { marked } from "marked";

export const dynamic = "force-dynamic";

// ───────────── Markdown config ─────────────
// پشتیبانی از Markdown + HTML
marked.setOptions({
  gfm: true,
  breaks: true,
  } as any); // 👈 برای سازگاری با تایپ‌های مختلف نسخه‌های marked

function markdownToHtml(src: string): string {
  // اگر متن همان HTML خام هم باشد، marked آن را عبور می‌دهد
  return marked.parse(src) as string;
}

// ───────────── helpers ─────────────

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // حروف فارسی را حذف می‌کنیم تا id انگلیسی شود
    .replace(/[\u0600-\u06FF]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

function calcReadMinutes(
  source: string | null | undefined
): number {
  if (!source) return 1;
  const html = markdownToHtml(source);
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.round(words / 200) || 1;
  return minutes < 1 ? 1 : minutes;
}

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function buildTocAndHtml(
  body: string | null,
  enableToc: boolean
): { html: string; toc: TocItem[] } {
  if (!body) return { html: "", toc: [] };

  // اول Markdown → HTML
  let html = markdownToHtml(body);
  const toc: TocItem[] = [];

  if (!enableToc) return { html, toc };

  const headingRegex = /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi;

  html = html.replace(
    headingRegex,
    (match, levelStr: string, attrs: string, inner: string) => {
      const level = parseInt(levelStr, 10);
      const text = stripHtml(inner).trim();
      if (!text) return match;

      const id = slugify(text);
      toc.push({ id, text, level });

      if (/id\s*=/.test(attrs)) {
        return `<h${level}${attrs}>${inner}</h${level}>`;
      }
      return `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
    }
  );

  return { html, toc };
}

function fmtDate(d?: Date | null): string {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "long",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

type FaqItem = {
  question: string;
  answer: string;
};

// استخراج FAQ از متن (الگوی سؤال / جواب)
function extractFaqFromBody(body: string | null): FaqItem[] {
  if (!body) return [];
  const html = markdownToHtml(body);
  const text = stripHtml(html);

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const faqs: FaqItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const hasQuestionMark = line.includes("؟");
    const looksLikeQ =
      line.startsWith("سوال") || line.startsWith("سؤال") || hasQuestionMark;

    if (!looksLikeQ) continue;

    const q = line.replace(/^س(وال|ؤال)[:：\-\s]*/i, "").trim();
    const answer = lines[i + 1] || "";
    if (!q || !answer) continue;

    faqs.push({ question: q, answer });
  }

  return faqs;
}

// ───────────── data fetch ─────────────
async function getPostWithTaxonomies(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) return null;
  if (post.status !== "published") return null;

  return { post };
}

// ───────────── SEO metadata ─────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      slug: true,
      metaTitle: true,
      metaDesc: true,
      excerpt: true,
      canonical: true,
      ogTitle: true,
      ogImage: true,
      coverUrl: true,
      coverAlt: true,
      noindex: true,
      nofollow: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDesc || post.excerpt || undefined;
  const url = `https://conexnikan.com/post/${post.slug}`;
  const imageUrl = post.ogImage || post.coverUrl || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: post.canonical || url,
    },
    openGraph: {
      type: "article",
      title: post.ogTitle || title,
      description,
      url,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: post.coverAlt || post.title,
            },
          ]
        : undefined,
    },
    robots: {
      index: !post.noindex,
      follow: !post.nofollow,
    },
  };
}

// ───────────── page component ─────────────

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getPostWithTaxonomies(params.slug);
  if (!data) notFound();

  const { post } = data;

  const { html, toc } = buildTocAndHtml(post.body || "", post.toc ?? false);
  const readMinutes = post.readMinutes || calcReadMinutes(post.body);
  const dateLabel = fmtDate(post.publishedAt || post.createdAt);
  const faqItems = extractFaqFromBody(post.body || "");
  const hasFaq = faqItems.length > 0;

  const faqJsonLd = hasFaq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  const canonicalUrl =
    post.canonical || `https://conexnikan.com/post/${post.slug}`;

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-1 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-800">
              خانه
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-800">
              بلاگ
            </Link>
            <span>/</span>
            <span className="text-slate-700 line-clamp-1">{post.title}</span>
          </nav>
          <span className="text-[11px] text-slate-400">
            کانکس نیکان – تخصص کانکس و سازه‌های پیش‌ساخته
          </span>
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-4 pb-12 pt-6">
        <header className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
          <div className="space-y-3">
            {post.category && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                {post.category}
              </span>
            )}

            <h1 className="text-2xl font-extrabold leading-snug text-slate-900 md:text-3xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-sm leading-relaxed text-slate-600">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span>تاریخ انتشار: {dateLabel}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>مدت زمان مطالعه: حدود {readMinutes} دقیقه</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="ltr text-[10px]">{canonicalUrl}</span>
            </div>
          </div>

          {post.coverUrl && (
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverUrl}
                alt={post.coverAlt || post.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-[15px] leading-8 text-slate-800 shadow-sm">
            <div
              className="
                prose prose-slate max-w-none prose-rtl
                prose-headings:scroll-mt-24
                prose-ul:list-disc prose-ol:list-decimal
                prose-li:marker:text-slate-500
                prose-img:rounded-xl prose-img:border prose-img:border-slate-100
                prose-h2:text-lg prose-h2:font-bold prose-h2:text-slate-900
                prose-h3:text-base prose-h3:font-semibold prose-h3:text-slate-900
              "
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          <aside className="space-y-4 lg:space-y-6">
            {post.toc && toc.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  فهرست مطالب
                </h2>
                <nav className="space-y-1 text-[13px]">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block rounded-lg px-2 py-1 hover:bg-slate-50 hover:text-slate-900 ${
                        item.level === 3 ? "ps-4 text-slate-600" : ""
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </section>
            )}

            <section className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-4 text-sm shadow-sm">
              <h2 className="mb-1 text-sm font-bold text-emerald-900">
                مشاوره رایگان انتخاب کانکس
              </h2>
              <p className="mb-3 text-xs leading-relaxed text-emerald-800/90">
                اگر بعد از خواندن این مقاله هنوز برای انتخاب مدل، متراژ یا برآورد
                قیمت کانکس سؤال داشتی، همین حالا با کانکس نیکان تماس بگیر.
              </p>
              <div className="space-y-2 text-xs">
                <a
                  href="tel:09124237146"
                  className="flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700"
                >
                  تماس مستقیم با کارشناس فروش
                </a>
                <a
                  href="https://wa.me/989124237146"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-2 font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  مشاوره در واتساپ (ارسال عکس محل و پلان)
                </a>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm">
              <p className="mb-2 font-semibold text-slate-800">
                سایر مقالات کانکس نیکان
              </p>
              <p className="mb-3 text-slate-500">
                برای آشنایی بیشتر با انواع کانکس، فونداسیون، مجوز، قیمت‌گذاری و
                نمونه‌کارها، مقالات دیگر بلاگ را هم ببین.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
              >
                مشاهده همه مقالات بلاگ
              </Link>
            </section>
          </aside>
        </div>
      </article>
    </main>
  );
}
