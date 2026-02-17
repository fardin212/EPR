import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

const prisma = new PrismaClient();
export const runtime = "nodejs";

function formatDate(date: Date | null | undefined) {
  if (!date) return "";
  try {
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { id: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
        {/* هدر صفحه وبلاگ */}
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-sky-600">
              وبلاگ کانکس نیکان
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              مقالات تخصصی کانکس، سازه پیش‌ساخته و ساندویچ‌پنل
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              در این بخش می‌توانید راهنماهای خرید، مقایسه انواع کانکس، نکات فنی و
              تجربیات اجرایی پروژه‌های واقعی کانکس نیکان را مطالعه کنید.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-2xl bg-sky-50/80 px-4 py-3 text-xs font-medium text-sky-800 shadow-sm ring-1 ring-sky-100">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>
              {posts.length > 0
                ? `${posts.length} مقاله منتشر شده`
                : "به‌زودی مقالات جدید اضافه می‌شوند"}
            </span>
          </div>
        </header>

        {/* اگر فعلاً مقاله‌ای نیست */}
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
              <span className="text-2xl">📝</span>
            </div>
            <h2 className="mb-2 text-lg font-bold text-slate-900">
              هنوز مقاله‌ای منتشر نشده است
            </h2>
            <p className="max-w-md text-sm text-slate-600">
              از طریق پنل ادمین، اولین مقاله تخصصی خود را منتشر کنید تا در این‌جا
              با یک نمای شیک و حرفه‌ای نمایش داده شود.
            </p>
          </div>
        )}

        {/* گرید کارت‌های مقالات */}
        {posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: any) => {
              const date = p.publishedAt ?? p.createdAt;
              const dateLabel = formatDate(date);

              // اطمینان از اینکه آدرس کاور با / شروع می‌شود
              const coverSrc =
                typeof p.coverUrl === "string" && p.coverUrl.length > 0
                  ? p.coverUrl.startsWith("/")
                    ? p.coverUrl
                    : `/${p.coverUrl.replace(/^\/+/, "")}`
                  : null;

              return (
                <article
                  key={p.id}
                  className="group relative overflow-hidden rounded-3xl bg-white/80 p-1 shadow-sm ring-1 ring-slate-100 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-sky-200"
                >
                  <Link href={`/post/${p.slug}`} className="flex h-full flex-col">
                    {/* تصویر کاور */}
                    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                      {coverSrc ? (
                        <Image
                          src={coverSrc}
                          alt={`تصویر کاور مقاله ${p.title}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500 opacity-90" />
                      )}

                      {/* گرادیانت شیشه‌ای روی تصویر */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

                      {/* تاریخ و برچسب بالای تصویر */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-slate-50 shadow-lg backdrop-blur">
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/80 text-[9px] font-bold">
                            ●
                          </span>
                          <span>مقاله تخصصی</span>
                        </span>
                        {dateLabel && (
                          <span className="rounded-full bg-slate-950/70 px-3 py-1 text-[11px] text-slate-100 shadow-md backdrop-blur">
                            {dateLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* متن کارت */}
                    <div className="flex flex-1 flex-col gap-3 px-3.5 pb-3.5 pt-3">
                      <h2 className="line-clamp-2 text-sm font-extrabold leading-relaxed text-slate-900 transition-colors group-hover:text-sky-700">
                        {p.title}
                      </h2>

                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                        در این مقاله درباره نکات فنی، کاربردها و راهنمای خرید
                        این نوع کانکس صحبت می‌کنیم. برای مشاهده جزئیات، روی
                        کارت کلیک کنید.
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>زمان مطالعه ۳ تا ۷ دقیقه</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 group-hover:text-sky-800">
                          <span>مشاهده مقاله</span>
                          <svg
                            className="mt-0.5 h-3 w-3 -scale-x-100 transition-transform duration-300 group-hover:translate-x-0.5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707A1 1 0 0 1 8.707 5.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
