import Link from "next/link";
import UsedConexCard from "@/components/used/UsedConexCard";
import { listUsedConex } from "@/lib/usedConex";
import { UsedConexStatus } from "@prisma/client";

const TYPES = ["همه", "نگهبانی", "کارگاهی", "ساندویچ‌پنل", "اداری", "ویلایی"] as const;
const CITIES = ["همه", "تهران", "کرج", "قم"] as const;

function mapStatus(s: string | undefined): UsedConexStatus | undefined {
  if (!s) return undefined;
  if (s === "ready") return UsedConexStatus.ready;
  if (s === "minor_fix") return UsedConexStatus.minor_fix;
  if (s === "refurbished") return UsedConexStatus.refurbished;
  if (s === "temporary") return UsedConexStatus.temporary;
  return undefined;
}

export default async function UsedConexBuyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const type = (typeof sp.type === "string" ? sp.type : "همه") as any;
  const city = (typeof sp.city === "string" ? sp.city : "همه") as any;
  const statusRaw = typeof sp.status === "string" ? sp.status : undefined;

  const rows = await listUsedConex({
    type,
    city,
    status: mapStatus(statusRaw),
  });

  const qs = (next: Record<string, string>) => {
    const p = new URLSearchParams();
    if (next.type && next.type !== "همه") p.set("type", next.type);
    if (next.city && next.city !== "همه") p.set("city", next.city);
    if (next.status && next.status !== "all") p.set("status", next.status);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const siteUrl = "https://conexnikan.com";
  const listUrl = `${siteUrl}/used-conex/buy`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "خرید کانکس دست دوم",
    url: listUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: rows.map((r, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${siteUrl}/used-conex/buy/${r.slug}`,
        name: r.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "کانکس دست دوم", item: `${siteUrl}/used-conex` },
      { "@type": "ListItem", position: 3, name: "خرید کانکس دست دوم", item: listUrl },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">خرید کانکس دست دوم</h1>
        <Link href="/used-conex" className="text-sm underline">
          برگشت
        </Link>
      </div>

      {/* Trust band */}
      <div className="mt-5 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-4">
        <div className="text-sm">
          <div className="font-semibold">✔ کارشناسی فنی</div>
          <div className="text-gray-600 text-xs mt-1">بررسی شاسی، بدنه، سقف</div>
        </div>
        <div className="text-sm">
          <div className="font-semibold">✔ قیمت واقعی بازار</div>
          <div className="text-gray-600 text-xs mt-1">شفاف و قابل مقایسه</div>
        </div>
        <div className="text-sm">
          <div className="font-semibold">✔ تحویل سریع</div>
          <div className="text-gray-600 text-xs mt-1">آماده تحویل یا زمان‌بندی</div>
        </div>
        <div className="text-sm">
          <div className="font-semibold">✔ بازسازی تخصصی</div>
          <div className="text-gray-600 text-xs mt-1">قبل/بعد برای بازسازی‌شده‌ها</div>
        </div>
      </div>

      {/* Filters */}
      <section className="mt-6 rounded-2xl border bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px]">
            <label className="block text-xs text-gray-600">نوع کانکس</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <Link
                  key={t}
                  href={"/used-conex/buy" + qs({ type: t, city, status: statusRaw || "all" })}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    t === type ? "bg-black text-white" : "bg-white hover:shadow-sm",
                  ].join(" ")}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs text-gray-600">شهر</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <Link
                  key={c}
                  href={"/used-conex/buy" + qs({ type, city: c, status: statusRaw || "all" })}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    c === city ? "bg-black text-white" : "bg-white hover:shadow-sm",
                  ].join(" ")}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-[200px]">
            <label className="block text-xs text-gray-600">وضعیت</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {[
                ["all", "همه"],
                ["ready", "🟢 آماده تحویل"],
                ["minor_fix", "🟡 بازسازی جزئی"],
                ["refurbished", "🔵 بازسازی‌شده"],
                ["temporary", "🔴 پروژه موقت"],
              ].map(([k, label]) => (
                <Link
                  key={k}
                  href={"/used-conex/buy" + qs({ type, city, status: k })}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    (statusRaw || "all") === k ? "bg-black text-white" : "bg-white hover:shadow-sm",
                  ].join(" ")}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="ml-auto text-sm text-gray-600">{rows.length} مورد</div>
        </div>
      </section>

      {/* Grid */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((item) => (
          <UsedConexCard
            key={item.id}
            item={{
              id: item.id,
              slug: item.slug,
              title: item.title,
              type: item.type,
              size: item.size,
              city: item.city,
              price: item.price,
              status: item.status === "minor_fix" ? "minor-fix" : (item.status as any),
              isReady: item.isReady,
            }}
          />
        ))}
      </section>

      {/* CTA */}
      <section className="mt-10 rounded-2xl border bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-extrabold">قیمت روز و موجودی می‌خوای؟</div>
            <div className="mt-1 text-sm text-gray-600">
              همین الان تماس بگیر یا واتساپ پیام بده تا گزینه‌های موجود رو بفرستیم.
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="tel:09124237146"
              className="rounded-2xl border px-5 py-3 text-sm font-semibold hover:shadow-sm transition"
            >
              تماس
            </a>
            <a
              href="https://wa.me/989124237146"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              واتساپ
            </a>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </main>
  );
}
