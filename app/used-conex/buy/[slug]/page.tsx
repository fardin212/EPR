import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import StatusBadge from "@/components/used/StatusBadge";
import BeforeAfterSlider from "@/components/used/BeforeAfterSlider";
import RefurbChecklist from "@/components/used/RefurbChecklist";
import { getUsedConexBySlug } from "@/lib/usedConex";
import { shimmer, toBase64 } from "@/lib/imagePlaceholder";
import { createUsedConexLead } from "./actions";

function formatToman(n: number) {
  return n.toLocaleString("fa-IR") + " تومان";
}

const PHONE = "09124237146";
const WHATSAPP = "989124237146";

const FAQ = [
  {
    q: "قیمت کانکس دست دوم چطور تعیین می‌شود؟",
    a: "قیمت بر اساس ابعاد، نوع سازه، وضعیت بدنه و سقف، سلامت شاسی، امکانات داخلی و شهر تحویل تعیین می‌شود.",
  },
  {
    q: "آیا کانکس دست دوم ضمانت دارد؟",
    a: "برای کانکس‌های سالم/بازسازی‌شده، کارشناسی فنی و توضیحات کامل وضعیت سازه ارائه می‌شود.",
  },
  {
    q: "تحویل فوری یعنی چه؟",
    a: "تحویل فوری یعنی کانکس آماده بارگیری و ارسال است و فقط زمان هماهنگی حمل نیاز دارد.",
  },
];

export default async function UsedConexDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const item = await getUsedConexBySlug(slug);
  if (!item) return notFound();

  const status = item.status === "minor_fix" ? "minor-fix" : (item.status as any);

  const gallery = item.images.filter((i) => i.kind === "gallery");
  const before = item.images.filter((i) => i.kind === "before");
  const after = item.images.filter((i) => i.kind === "after");

  const siteUrl = "https://conexnikan.com";
  const pageUrl = `${siteUrl}/used-conex/buy/${item.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: item.note || `${item.type} ${item.size} در ${item.city}`,
    brand: { "@type": "Brand", name: "کانکس نیکان" },
    sku: item.slug,
    url: pageUrl,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "IRR",
      price: item.price,
      availability: item.isReady
        ? "https://schema.org/InStock"
        : "https://schema.org/LimitedAvailability",
      seller: { "@type": "Organization", name: "کانکس نیکان" },
    },
    image: gallery.slice(0, 4).map((x) => `${siteUrl}${x.url.startsWith("/") ? "" : "/"}${x.url}`),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "کانکس دست دوم", item: `${siteUrl}/used-conex` },
      { "@type": "ListItem", position: 3, name: "خرید کانکس دست دوم", item: `${siteUrl}/used-conex/buy` },
      { "@type": "ListItem", position: 4, name: item.title, item: pageUrl },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/used-conex/buy" className="text-sm underline">
            ← برگشت به لیست
          </Link>

          <h1 className="mt-3 text-2xl font-extrabold leading-9">
            {item.title} | {item.city}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {item.type} • {item.size} • {item.isReady ? "تحویل فوری" : "نیازمند هماهنگی تحویل"}
          </p>
        </div>

        {/* Decision card */}
        <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">
          <StatusBadge status={status} />
          <div className="mt-2 text-xs text-gray-500">قیمت حدودی</div>
          <div className="mt-1 text-2xl font-extrabold">{formatToman(item.price)}</div>
          <div className="mt-2 text-sm text-emerald-700 font-medium">
            {item.isReady ? "تحویل فوری" : "نیازمند هماهنگی تحویل"}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-white p-4">
          <div className="text-sm font-semibold">گالری تصاویر</div>

          {gallery.length === 0 ? (
            <div className="mt-4 aspect-[16/9] rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
              تصویر موجود نیست
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              <div className="relative aspect-[16/9] rounded-2xl border overflow-hidden">
                <Image
                  src={gallery[0].url}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(1200, 675))}`}
                />
              </div>

              {gallery.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {gallery.slice(1, 4).map((img) => (
                    <div key={img.id} className="relative aspect-[4/3] rounded-xl border overflow-hidden">
                      <Image
                        src={img.url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 18vw"
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <aside className="rounded-2xl border bg-white p-4">
          <div className="text-sm font-semibold">تماس سریع</div>
          <div className="mt-2 text-xs text-gray-600">
            برای قیمت دقیق و موجودی همین الان تماس بگیر یا واتساپ پیام بده.
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <a
              href={`tel:${PHONE}`}
              className="rounded-2xl bg-emerald-600 px-6 py-4 text-center text-white font-bold text-sm hover:bg-emerald-700 transition"
            >
              📞 تماس فوری
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border px-6 py-4 text-center text-sm font-semibold hover:shadow-sm transition"
            >
              💬 پیام در واتساپ
            </a>
          </div>

          {item.note && (
            <div className="mt-5 rounded-2xl border bg-gray-50 p-3 text-sm">{item.note}</div>
          )}
        </aside>
      </section>

      {/* Refurbished */}
      {item.refurbished && (
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-3 text-sm font-semibold">قبل / بعد بازسازی</div>
            {before.length && after.length ? (
              <BeforeAfterSlider
                beforeUrl={before[0].url}
                afterUrl={after[0].url}
                beforeLabel="قبل بازسازی"
                afterLabel="بعد بازسازی"
              />
            ) : (
              <div className="aspect-[16/7] rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                تصاویر قبل/بعد موجود نیست
              </div>
            )}
          </div>

          <RefurbChecklist
            items={
              item.refurbItems.length
                ? item.refurbItems.map((r) => ({ title: r.title, desc: r.desc ?? undefined }))
                : [{ title: "بازسازی انجام شده" }]
            }
          />
        </section>
      )}

      {/* Lead form */}
      <section className="mt-10 rounded-2xl border bg-white p-6">
        <div className="text-lg font-extrabold">درخواست قیمت / مشاوره سریع</div>
        <div className="mt-1 text-sm text-gray-600">
          شماره‌تان را بگذارید تا برای موجودی و قیمت دقیق با شما تماس بگیریم.
        </div>

        <form
          action={async (fd) => {
            "use server";
            await createUsedConexLead(item.slug, fd);
          }}
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          <input name="name" className="rounded-xl border px-3 py-3 text-sm" placeholder="نام (اختیاری)" />
          <input name="phone" className="rounded-xl border px-3 py-3 text-sm" placeholder="شماره تماس *" required />
          <input name="city" className="rounded-xl border px-3 py-3 text-sm" placeholder="شهر (اختیاری)" />
          <input
            name="message"
            className="rounded-xl border px-3 py-3 text-sm sm:col-span-2"
            placeholder="توضیحات (اختیاری)"
          />
          <button className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white sm:col-span-2">
            ثبت درخواست
          </button>
        </form>
      </section>

      {/* FAQ */}
      <section className="mt-10 rounded-2xl border bg-white p-6">
        <div className="text-lg font-extrabold">سوالات متداول</div>
        <div className="mt-4 grid gap-3">
          {FAQ.map((f, i) => (
            <details key={i} className="rounded-xl border px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </main>
  );
}
