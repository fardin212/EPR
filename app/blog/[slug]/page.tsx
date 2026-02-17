// app/blog/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type Props = { params: { slug: string } };

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

function calculateReadingTime(body: string | null | undefined): string {
  if (!body) return "زیر ۱ دقیقه";
  const words = body.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200)); // حدود ۲۰۰ کلمه در دقیقه
  return `${minutes} دقیقه مطالعه`;
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      // اگر در مدل Post فیلد excerpt نداری، این خط فقط برای TypeScript خاموش کردن خطاست
      excerpt: true as any,
      body: true,
      publishedAt: true,
      updatedAt: true,
      coverUrl: true,
    },
  });

  if (!post) return notFound();

  const publishedLabel = formatDate(post.publishedAt);
  const updatedLabel =
    post.updatedAt && post.updatedAt !== post.publishedAt
      ? formatDate(post.updatedAt)
      : null;

  const readingTime = calculateReadingTime(post.body);

  const coverSrc =
    typeof post.coverUrl === "string" && post.coverUrl.length > 0
      ? post.coverUrl.startsWith("/")
        ? post.coverUrl
        : `/${post.coverUrl.replace(/^\/+/, "")}`
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 pb-16">
      <article className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
        {/* نوار بالای صفحه + لینک بازگشت */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-slate-50 hover:text-sky-700 hover:ring-sky-200"
          >
            <svg
              className="h-3 w-3 -scale-x-100"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707A1 1 0 0 1 8.707 5.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z" />
            </svg>
            <span>بازگشت به مقالات</span>
          </Link>

          <div className="hidden items-center gap-2 text-[11px] text-slate-500 sm:flex">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>مقاله تخصصی کانکس نیکان</span>
          </div>
        </div>

        {/* هدر اصلی + کاور بزرگ */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-slate-900 shadow-xl ring-1 ring-slate-900/5">
          <div className="relative aspect-[16/7] w-full overflow-hidden">
            {coverSrc ? (
              <Image
                src={coverSrc}
                alt={`تصویر کاور مقاله ${post.title}`}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 1024px, 100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500" />
            )}

            {/* گرادیانت روی تصویر */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/0" />

            {/* متن روی تصویر */}
            <div className="absolute inset-0 flex flex-col justify-end px-5 pb-5 pt-10 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-100/80">
                {publishedLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/60 px-3 py-1 shadow-lg backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>منتشر شده در {publishedLabel}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/80 px-3 py-1 text-slate-50 shadow-lg backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
                  <span>{readingTime}</span>
                </span>
              </div>

              <h1 className="text-balance text-2xl font-black leading-relaxed text-slate-50 sm:text-3xl lg:text-4xl">
                {post.title}
              </h1>

              {(post as any).excerpt && (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-100/80">
                  {(post as any).excerpt}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* متا و خلاصه اطلاعات زیر هدر */}
        <section className="mb-8 grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="rounded-2xl bg-white/80 p-4 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <p>
              در این مقاله، به‌صورت کاربردی به معرفی سازه، نکات فنی، مزایا و
              معایب، و نکات مهم هنگام خرید این نوع کانکس می‌پردازیم تا بتوانید
              بهترین انتخاب را متناسب با پروژه‌ی خود داشته باشید.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-slate-900/95 p-4 text-[11px] text-slate-100 shadow-md ring-1 ring-slate-900/60 backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">زمان مطالعه</span>
              <span className="font-semibold text-sky-300">{readingTime}</span>
            </div>
            {publishedLabel && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">تاریخ انتشار</span>
                <span className="font-semibold text-slate-100">
                  {publishedLabel}
                </span>
              </div>
            )}
            {updatedLabel && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">آخرین به‌روزرسانی</span>
                <span className="font-semibold text-emerald-300">
                  {updatedLabel}
                </span>
              </div>
            )}
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] text-slate-100">
                راهنمای خرید کانکس
              </span>
              <span className="rounded-full bg-sky-500/80 px-2.5 py-1 text-[10px] text-slate-50">
                نکات فنی و اجرایی
              </span>
              <span className="rounded-full bg-emerald-500/80 px-2.5 py-1 text-[10px] text-slate-50">
                مشاوره قبل از سفارش
              </span>
            </div>
          </div>
        </section>

        {/* متن اصلی مقاله */}
        <section className="overflow-hidden rounded-3xl bg-white/90 p-5 shadow-md ring-1 ring-slate-200 backdrop-blur-md sm:p-7 lg:p-8">
          <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:font-semibold prose-a:text-sky-700 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-li:marker:text-slate-400 prose-img:rounded-2xl prose-hr:border-slate-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {post.body}
            </ReactMarkdown>
          </div>
        </section>

        {/* باکس تماس انتهای مقاله */}
        <section className="mt-8">
          <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 p-[1px] shadow-lg">
            <div className="flex flex-col items-start justify-between gap-4 rounded-[calc(1.5rem-1px)] bg-slate-950/95 px-5 py-5 text-slate-50 sm:flex-row sm:items-center sm:px-7">
              <div>
                <h2 className="text-base font-black sm:text-lg">
                  نیاز به مشاوره برای انتخاب کانکس مناسب دارید؟
                </h2>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                  مشخصات پروژه، متراژ و کاربری موردنیاز را برای کارشناسان کانکس
                  نیکان ارسال کنید تا بهترین گزینه را همراه با برآورد قیمت
                  دقیق به شما پیشنهاد دهند.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md transition hover:bg-sky-300"
                >
                  ثبت درخواست مشاوره رایگان
                </Link>
                <a
                  href="tel:02100000000"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-50 ring-1 ring-slate-600 transition hover:bg-slate-800"
                >
                  تماس فوری با واحد فروش
                </a>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
