// app/guides/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  sort?: "updated" | "new";
};

export const metadata: Metadata = {
  title: "راهنماهای کانکس | دانشنامه خرید، قیمت و انواع کانکس - کانکس نیکان",
  description:
    "مرجع کامل راهنمای کانکس: انواع کانکس، قیمت‌ها، نکات خرید، مقایسه مدل‌ها و پاسخ سوالات پرتکرار. قبل از خرید، راهنماها را بخوانید و تصمیم دقیق بگیرید.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "راهنماهای کانکس | کانکس نیکان",
    description:
      "راهنماهای تخصصی کانکس: قیمت، انواع، مشخصات و نکات خرید برای انتخاب بهتر.",
    url: "https://conexnikan.com/guides",
    type: "website",
  },
};

function faNum(n: number) {
  try {
    return n.toLocaleString("fa-IR");
  } catch {
    return String(n);
  }
}

function clip(s?: string, n = 180) {
  if (!s) return "";
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function safeSlug(s?: string) {
  return (s || "").trim();
}

/** انتخاب بهترین تصویر برای کارت‌ها */
function pickImage(g: {
  coverImage?: string | null;
  ogImage?: string | null;
  imageUrl?: string | null;
}) {
  // اولویت: coverImage -> ogImage -> imageUrl -> fallback
  return (
    g.coverImage ||
    g.ogImage ||
    g.imageUrl ||
    "/uploads/og/guide-default.jpg"
  );
}

export default async function GuidesHubPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = (searchParams?.q || "").trim();
  const sort = searchParams?.sort || "updated";

  const where: any = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { keyword: { contains: q } },
          { seoTitle: { contains: q } },
          { seoDescription: { contains: q } },
          { summary: { contains: q } },
        ],
      }
    : {};

  const orderBy =
    sort === "new"
      ? ({ createdAt: "desc" } as any)
      : ({ updatedAt: "desc" } as any);

  const guides = await prisma.guide.findMany({
    where,
    orderBy,
    select: {
      id: true,
      slug: true,
      name: true,
      keyword: true,
      seoTitle: true,
      seoDescription: true,
      summary: true,
      imageUrl: true,
      coverImage: true,
      ogImage: true,
      readMinutes: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 200,
  });

  const items = guides
    .map((g) => ({
      ...g,
      slug: safeSlug(g.slug),
      title: g.seoTitle || g.name,
      desc: g.seoDescription || g.summary || "",
      img: pickImage(g),
      updatedAtDate: g.updatedAt ? new Date(g.updatedAt) : null,
    }))
    .filter((g) => g.slug);

  const siteUrl = "https://conexnikan.com";
  const total = items.length;

  // Schema: BreadcrumbList + CollectionPage/ItemList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "راهنماها", item: `${siteUrl}/guides` },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "راهنماهای کانکس",
    url: `${siteUrl}/guides`,
    description: "مرجع راهنماهای کانکس برای قیمت، انواع، مشخصات و نکات خرید.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 50).map((g, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${siteUrl}/guides/${encodeURIComponent(g.slug)}`,
        name: g.title,
      })),
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* HERO */}
      <section className="rounded-3xl border border-border bg-gradient-to-l from-[var(--btn-grad-from)] via-[var(--btn-grad-via)] to-[var(--btn-grad-to)] p-6 sm:p-8 text-white shadow-sm">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <p className="text-xs sm:text-sm text-white/85 mb-2">
              دانشنامه تخصصی کانکس نیکان
            </p>
            <h1 className="text-xl sm:text-3xl font-black leading-snug">
              راهنماهای کانکس: قیمت، انواع، خرید و نکات انتخاب
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/90 leading-7">
              قبل از خرید کانکس، این راهنماها را بخوانید تا انتخاب دقیق‌تر و هزینه کمتر داشته باشید.
              از «کانکس چیست» تا «قیمت کانکس ویلایی» و «خرید کانکس دست دوم».
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/order"
                className="inline-flex items-center justify-center rounded-2xl bg-white text-slate-900 px-4 py-2 text-sm font-black hover:opacity-95 transition"
              >
                مشاوره و استعلام قیمت
              </Link>
              <Link
                href="/category"
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/15 transition"
              >
                مشاهده دسته‌بندی‌ها
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-white/10 border border-white/15 p-4 sm:p-5 backdrop-blur">
              <div className="text-xs text-white/80">تعداد راهنماها</div>
              <div className="text-2xl sm:text-3xl font-black mt-1">{faNum(total)}</div>
              <div className="mt-3 text-xs text-white/80 leading-6">
                با جستجو و فیلتر مرتب‌سازی، سریع‌تر به راهنمای موردنظر برسید.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5">
        <form className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end" action="/guides" method="get">
          <div className="sm:col-span-7">
            <label className="block text-xs font-bold mb-1">جستجو در راهنماها</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="مثلاً: کانکس ویلایی، قیمت، دست دوم…"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-blue)]"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold mb-1">مرتب‌سازی</label>
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-blue)]"
            >
              <option value="updated">آخرین بروزرسانی</option>
              <option value="new">جدیدترین</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--brand-blue)] text-white px-4 py-2 text-sm font-extrabold hover:opacity-95 transition"
            >
              اعمال
            </button>
          </div>
        </form>
      </section>

      {/* GRID */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-black">همه راهنماها</h2>
          <div className="text-xs text-muted-foreground">{faNum(total)} راهنما</div>
        </div>

        {total === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="text-base font-bold">راهنمایی پیدا نشد</div>
            <p className="mt-2 text-sm text-muted-foreground">
              عبارت جستجو را تغییر دهید یا از لینک‌های پیشنهادی استفاده کنید.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Link className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-sm" href="/guides/کانکس">
                راهنمای کانکس
              </Link>
              <Link className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-sm" href="/guides/کانکس-ویلایی">
                کانکس ویلایی
              </Link>
              <Link className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-sm" href="/guides/قیمت-کانکس-ویلایی">
                قیمت کانکس ویلایی
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((g) => {
              const href = `/guides/${encodeURIComponent(g.slug)}`;
              const desc =
                g.desc || "راهنمای کامل و کاربردی برای انتخاب بهتر و جلوگیری از هزینه اضافه.";

              return (
                <Link
                  key={g.id}
                  href={href}
                  className="group overflow-hidden rounded-2xl border border-border bg-card hover:shadow-md hover:border-[var(--brand-blue)] transition"
                >
                  {/* IMAGE */}
                  <div className="relative">
                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                      <img
                        src={g.img || "/uploads/og/guide-default.jpg"}
                        alt={g.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center rounded-xl bg-black/50 backdrop-blur px-2 py-1 text-[11px] font-bold text-white">
                        {g.readMinutes ? `${faNum(g.readMinutes)} دقیقه` : "راهنما"}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">
                      {g.keyword ? `کلیدواژه: ${g.keyword}` : "راهنمای تخصصی"}
                    </div>

                    <h3 className="font-black text-base sm:text-lg leading-snug group-hover:text-[var(--brand-blue)] transition">
                      {g.title}
                    </h3>

                    <p className="mt-3 text-sm text-muted-foreground leading-7">
                      {clip(desc, 190)}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="rounded-lg bg-muted/40 border border-border px-2 py-1">
                        مطالعه راهنما
                      </span>
                      <span>
                        {g.updatedAtDate
                          ? `بروزرسانی: ${g.updatedAtDate.toLocaleDateString("fa-IR")}`
                          : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
