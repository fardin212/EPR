import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: { slug: string };
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const slug = decodeURIComponent(params.slug);

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      category: true,
      projectImages: true,
    },
  });

  if (!project) notFound();

  // تصویر قدیمی برای سازگاری با داده‌های قبلی
  const legacyImage = await prisma.image.findFirst({
    where: { projectId: project.id },
    orderBy: { id: "asc" },
  });

  // انتخاب تصویر هدر
  const heroImage =
    project.imageUrl ||
    project.projectImages[0]?.url ||
    legacyImage?.url ||
    "/uploads/2025/11/villa-6x3-01.jpg";

  const heroAlt =
    project.heroAlt ||
    project.projectImages[0]?.alt ||
    legacyImage?.alt ||
    `${project.category?.name ? `کانکس ${project.category.name} – ` : ""}${
      project.title
    } – کانکس نیکان`;

  /* ------------------------- بولت‌ها (ویژگی‌های شاخص) ------------------------ */

  let bulletItems: string[] = [];
  if (project.bullets) {
    try {
      const parsed = JSON.parse(project.bullets as any);
      if (Array.isArray(parsed)) {
        bulletItems = parsed
          .map((v) => String(v || "").trim())
          .filter(Boolean);
      } else {
        bulletItems = String(project.bullets)
          .split(/\r?\n/)
          .map((b) => b.replace(/^[-•]+/, "").trim())
          .filter(Boolean);
      }
    } catch {
      bulletItems = String(project.bullets)
        .split(/\r?\n/)
        .map((b) => b.replace(/^[-•]+/, "").trim())
        .filter(Boolean);
    }
  }

  /* ----------------------------- مشخصات فنی ----------------------------- */

  const specBlocks = [
    { title: "سازه و شاسی", text: project.specFrame },
    { title: "دیوار / سقف / عایق", text: project.specWalls },
    { title: "طراحی داخلی", text: project.specInterior },
    { title: "تأسیسات (برق / آب / سرمایش و گرمایش)", text: project.specMEP },
    { title: "حمل و نصب", text: project.specLogistic },
  ].filter((b) => b.text && b.text.trim().length > 0);

  /* --------------------------- مدل‌های کانکس --------------------------- */

  let workshopTypes:
    | {
        key?: string;
        title?: string;
        imageUrl?: string | null;
        items?: string[];
      }[]
    | [] = [];

  if (project.workshopTypesJson) {
    try {
      const parsed = JSON.parse(project.workshopTypesJson as any);
      if (Array.isArray(parsed)) workshopTypes = parsed;
    } catch {
      // اگر خراب بود، نادیده می‌گیریم
    }
  }

  /* ------------------------------ UI Helpers ---------------------------- */

  // استایل پایه‌ی همه‌ی کارت‌ها (گلس‌مورفیسم روشن)
  const cardBase = [
    "relative overflow-hidden rounded-3xl",
    "border border-white/60",
    "bg-gradient-to-b from-white/80 via-white/40 to-sky-100/20",
    "backdrop-blur-xl",
    "shadow-[0_18px_60px_rgba(15,23,42,0.35)]",
  ].join(" ");

  return (
    <main className="bg-[color:var(--page-bg)] text-[color:var(--text)]">
      {/* هدر / بنر پروژه */}
      <section className="w-full bg-slate-900/80">
        <div className="relative mx-auto max-w-[1440px] h-[420px] sm:h-[460px] lg:h-[500px] overflow-hidden rounded-b-[32px] bg-slate-900">
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            priority
            unoptimized
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/40 to-slate-900/0" />

          <div className="absolute inset-x-4 bottom-5 sm:bottom-7 sm:left-8 sm:right-8">
            {/* نان‌برگ */}
            <nav className="mb-3 flex flex-wrap items-center gap-1 text-[10px] sm:text-xs text-slate-200/85">
              <Link href="/" className="hover:text-white">
                صفحه اصلی
              </Link>
              <span>/</span>
              <Link href="/portfolio" className="hover:text-white">
                نمونه‌کارها
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">{project.title}</span>
            </nav>

            {/* باکس توضیح روی بنر */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-600/70 bg-slate-950/70 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_22px_60px_rgba(15,23,42,0.9)]">
              <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-slate-100">
                <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] sm:text-xs font-semibold text-white">
                  نمونه‌کار اجرا شده
                </span>
                {project.category?.name && (
                  <span className="inline-flex items-center rounded-full bg-slate-900/70 px-3 py-1 text-[10px] sm:text-xs text-slate-100">
                    {project.category.name}
                  </span>
                )}
                {project.city && (
                  <span className="inline-flex items-center rounded-full bg-slate-900/70 px-3 py-1 text-[10px] sm:text-xs text-slate-100">
                    شهر: {project.city}
                  </span>
                )}
                {project.meters && (
                  <span className="inline-flex items-center rounded-full bg-slate-900/70 px-3 py-1 text-[10px] sm:text-xs text-slate-100">
                    متراژ: {project.meters} متر
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold leading-snug text-white">
                {project.title}
              </h1>

              {project.summary && (
                <p className="mt-2 max-w-3xl text-xs sm:text-sm text-slate-100/95 leading-relaxed">
                  {project.summary}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* بدنه صفحه */}
      <section className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-0 py-10 lg:py-12 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          {/* ستون اصلی */}
          <div className="space-y-8">
            {/* اطلاعات خلاصه بالا */}
            <div
              className={`${cardBase} px-4 py-4 grid gap-3 sm:grid-cols-3 text-[color:var(--text)]`}
            >
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">
                  کاربری پیشنهادی
                </div>
                <div className="text-sm font-medium">
                  {project.category?.name || "کانکس کارگاهی / سفارشی"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">
                  موقعیت اجرا
                </div>
                <div className="text-sm font-medium">
                  {project.city || "در سراسر کشور"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-700">
                  متراژ سازه
                </div>
                <div className="text-sm font-medium">
                  {project.meters
                    ? `${project.meters} متر مربع`
                    : "بر اساس نیاز کارفرما"}
                </div>
              </div>
              {project.priceRange && (
                <div className="space-y-1 sm:col-span-3">
                  <div className="text-[11px] font-semibold text-slate-700">
                    رِنج قیمتی
                  </div>
                  <div className="text-sm font-medium">
                    {project.priceRange}
                  </div>
                </div>
              )}
            </div>

            {/* توضیحات اصلی */}
            {project.description && (
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[color:var(--text)]">
                  شرح پروژه
                </h2>
                <article className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:text-[color:var(--text)] prose-p:text-[color:var(--text)] prose-strong:text-[color:var(--text)]">
                  {project.description.includes("<") ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: project.description,
                      }}
                    />
                  ) : (
                    project.description
                      .split("\n\n")
                      .map((p, i) => (
                        <p key={i} className="leading-relaxed">
                          {p}
                        </p>
                      ))
                  )}
                </article>
              </section>
            )}

            {/* ویژگی‌های شاخص (بولت‌ها) */}
            {bulletItems.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[color:var(--text)]">
                  ویژگی‌های شاخص این کانکس
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {bulletItems.map((item, idx) => (
                    <li
                      key={idx}
                      className={`${cardBase} px-3 py-2 text-sm flex items-start gap-2 text-[color:var(--text)]`}
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--brand)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

{/* مشخصات فنی سازه – کارت‌های سفید، آبی و واکنش‌گرا */}
{specBlocks.length > 0 && (
  <section className="space-y-3">
    <h2 className="text-base font-bold text-[color:var(--text)]">
      مشخصات فنی سازه
    </h2>

    <div className="grid gap-4 lg:grid-cols-2">
      {specBlocks.map((block, i) => {
        const lines =
          block.text
            ?.split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean) ?? [];

        return (
          <article
            key={i}
            className={[
              "relative flex flex-col overflow-hidden rounded-3xl",
              "bg-white",
              "border border-slate-200/80",
              "shadow-[0_8px_30px_rgba(15,23,42,0.08)]",
              "px-4 py-3 sm:px-5 sm:py-4",
              "text-sky-900",
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-1.5 hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)]",
            ].join(" ")}
          >
            {/* هدر کارت */}
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold text-white shadow-sm">
                {i + 1}
              </span>
              <h3 className="text-xs sm:text-sm font-semibold text-sky-800">
                {block.title}
              </h3>
            </div>

            {/* لیست موردی مشخصات (فعلاً متن رو خودش خط‌خطی نکردی، بعداً از ادمین اصلاح می‌کنی) */}
            {lines.length > 0 ? (
              <ul className="space-y-1.5 text-[13px] leading-6 text-slate-700">
                {lines.map((line, idx2) => (
                  <li
                    key={idx2}
                    className="relative pr-4 before:absolute before:right-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-sky-400"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-slate-700">
                {block.text}
              </p>
            )}
          </article>
        );
      })}
    </div>
  </section>
)}

{/* مدل‌های کانکس – سه کارت شیشه‌ای تیره با متن سفید */}
{workshopTypes.length > 0 && (
  <section className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-[color:var(--text)]">
        مدل‌های این کانکس
      </h2>
      <p className="hidden text-[11px] text-[color:var(--muted)] sm:block">
      </p>
    </div>

    <div className="grid gap-4 md:gap-6 md:grid-cols-3">
      {workshopTypes.map((t, idx) => {
        const labelFromKey =
          t.key === "light"
            ? "مدل سبک"
            : t.key === "heavy"
            ? "مدل سنگین"
            : t.key === "equip"
            ? "مدل مجهز"
            : "مدل کانکس";

        const title = t.title || labelFromKey;

        return (
          <article
            key={idx}
            className="workshop-card group relative flex flex-col overflow-hidden rounded-3xl border border-sky-400/60 bg-gradient-to-b from-sky-500/35 via-indigo-900/90 to-slate-950/95 shadow-[0_26px_90px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-transform duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_32px_110px_rgba(15,23,42,0.98)]"
            style={{ color: "#F9FAFB", opacity: 1, filter: "none" }}
          >
            {/* تصویر */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {t.imageUrl ? (
                <Image
                  src={t.imageUrl}
                  alt={title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-200">
                  بدون تصویر
                </div>
              )}

              {/* گرادیان فقط روی تصویر */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-900/0" />

              {/* برچسب‌ها روی تصویر */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] z-10">
                <span className="inline-flex items-center rounded-full bg-black/80 px-2.5 py-1 font-semibold text-white">
                  {title}
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-400 px-2 py-0.5 font-extrabold text-slate-950">
                  {labelFromKey}
                </span>
              </div>
            </div>

            {/* بدنه کارت */}
            <div className="relative flex flex-1 flex-col p-4 sm:p-5 z-10">
              <h3 className="mb-2 text-sm font-bold text-white">
                مشخصات این مدل
              </h3>

              {/* باکس متن داخل کارت */}
              <div className="flex-1 overflow-y-auto pr-2 rounded-2xl bg-[#020b2a]/85 px-3 py-2 text-[13px] leading-6 shadow-[0_0_0_1px_rgba(148,163,184,0.25)]">
                {t.items && t.items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {t.items.map((it, i) => (
                      <li
                        key={i}
                        className="relative pr-3 before:absolute before:right-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-300"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px]">
                    برای این مدل هنوز توضیحاتی ثبت نشده است.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-100/90">
                <span className="text-amber-200">
                  مناسب انتخاب هوشمندانه‌تر سازه
                </span>
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  </section>
)}

            {/* تجربه کارفرما / چالش‌ها */}
            {(project.challenges ||
              project.clientName ||
              project.clientQuote) && (
              <section
                className={`${cardBase} px-4 py-4 space-y-3 text-[color:var(--text)]`}
              >
                <h2 className="text-base font-bold text-[color:var(--text)]">
                  تجربه کارفرما و چالش‌ها
                </h2>
                {project.challenges && (
                  <p className="text-sm leading-relaxed">
                    {project.challenges}
                  </p>
                )}
                {project.clientQuote && (
                  <blockquote className="border-r-2 border-[color:var(--brand)] pr-3 text-sm leading-relaxed">
                    <p>“{project.clientQuote}”</p>
                    {project.clientName && (
                      <footer className="mt-1 text-xs text-slate-600">
                        — {project.clientName}
                      </footer>
                    )}
                  </blockquote>
                )}
              </section>
            )}

            {/* CTA پایانی */}
            <section
              className={`${cardBase} px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
            >
              <div className="space-y-1">
                <h2 className="text-sm sm:text-base font-bold text-[color:var(--text)]">
                  نیاز به کانکس مشابه دارید؟
                </h2>
                <p className="text-xs sm:text-sm text-[color:var(--muted)] leading-relaxed">
                  مشخصات پروژه‌ی خود را برای ما ارسال کنید تا برآورد متراژ، زمان
                  تحویل و هزینه‌ی اجرا را دقیق و تخصصی اعلام کنیم.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={project.ctaWhatsapp || "https://wa.me/989126300225"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
				     inline-flex items-center justify-center gap-1
					 rounded-full px-5 py-2 text-sm font-semibold
					 bg-slate-900/70 text-white backdrop-blur-md
					 border border-sky-500/40
					 shadow-[0_4px_20px_rgba(0,0,0,0.3)]
					 hover:bg-slate-900/90 hover:border-sky-400
					 transition-all duration-200
					"
                >
                  مشاوره واتساپی با کانکس نیکان
                </a>
                <Link
                  href="/order"
                  className="
				    inline-flex items-center justify-center gap-1
					rounded-full px-5 py-2 text-sm font-semibold
					bg-slate-900/70 text-white backdrop-blur-md
					border border-sky-500/40
					shadow-[0_4px_20px_rgba(0,0,0,0.3)]
					hover:bg-slate-900/90 hover:border-sky-400
					transition-all duration-200
				   "
                >
                  ثبت سفارش کانکس سفارشی
                </Link>
              </div>
            </section>
          </div>

          {/* ستون کناری – تصویر و گالری کوچک */}
          <aside className="space-y-4">
            <div className={cardBase + " p-3"}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200">
                <Image
                  src={heroImage}
                  alt={heroAlt}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              </div>

              {project.projectImages.length > 1 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {project.projectImages.slice(1).map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || project.title}
                        fill
                        unoptimized
                        className="object-cover hover:scale-[1.03] transition-transform"
                        sizes="(min-width: 1024px) 12vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
