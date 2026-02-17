// components/BlogPostLayout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";

type BlogPostLayoutProps = {
  title: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  readingTime?: string; // مثل "۷ دقیقه مطالعه"
  publishedAt?: string; // تاریخ فرمت‌شده فارسی
  updatedAt?: string;
  children: ReactNode;  // محتوای مقاله (Markdown رندر شده)
};

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export default function BlogPostLayout({
  title,
  excerpt,
  coverImage,
  category,
  tags = [],
  readingTime,
  publishedAt,
  updatedAt,
  children,
}: BlogPostLayoutProps) {
  const [toc, setToc] = useState<TocItem[]>([]);

  // ساخت فهرست از H2/H3 ها
  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>(
        "article.prose h2, article.prose h3"
      )
    );

    const items = headings.map((h) => ({
      id: h.id || h.innerText.replace(/\s+/g, "-"),
      text: h.innerText,
      level: h.tagName === "H2" ? 2 : 3,
    }));

    // اگر id نداشت، ست کن
    headings.forEach((h, idx) => {
      if (!h.id && items[idx]) {
        h.id = items[idx].id;
      }
    });

    setToc(items);
  }, []);

  return (
    <main className="bg-slate-50 pb-16 pt-8">
      <div className="container mx-auto max-w-6xl px-4 lg:px-6">
        {/* مسیر ناوبری بالا */}
        <nav className="mb-4 text-xs md:text-sm text-slate-500 flex gap-1">
          <span className="hover:text-slate-800 transition-colors">
            صفحه اصلی
          </span>
          <span>·</span>
          <span className="hover:text-slate-800 transition-colors">
            مقالات
          </span>
          {category && (
            <>
              <span>·</span>
              <span className="text-slate-700 font-medium">{category}</span>
            </>
          )}
        </nav>

        {/* کاور + عنوان */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          {coverImage && (
            <div className="h-52 md:h-72 w-full overflow-hidden">
              {/* می‌تونی این را با <Image /> نکست عوض کنی */}
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* دسته / زمان مطالعه */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs md:text-sm text-slate-500">
              {category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                  {category}
                </span>
              )}
              {publishedAt && (
                <span>انتشار: {publishedAt}</span>
              )}
              {updatedAt && (
                <span>به‌روزرسانی: {updatedAt}</span>
              )}
              {readingTime && (
                <span className="px-2 py-1 rounded-full bg-slate-100">
                  ⏱ {readingTime}
                </span>
              )}
            </div>

            {/* عنوان */}
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-relaxed">
              {title}
            </h1>

            {/* خلاصه */}
            {excerpt && (
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                {excerpt}
              </p>
            )}
          </div>
        </div>

        {/* بدنه + سایدبار */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)] gap-10">
          {/* متن مقاله */}
          <article className="prose prose-slate prose-lg max-w-none leading-relaxed bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-8">
            {children}
          </article>

          {/* سایدبار راست (فهرست + تگ‌ها + CTA) */}
          <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
            {/* فهرست عناوین */}
            {toc.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5">
                <h2 className="text-sm md:text-base font-bold text-slate-800 mb-3">
                  فهرست این مقاله
                </h2>
                <div className="space-y-1 max-h-72 overflow-y-auto text-xs md:text-sm">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-1 hover:text-indigo-600 hover:ps-1 transition-all ${
                        item.level === 3 ? "ps-4 text-slate-500" : ""
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* تگ‌ها */}
            {tags.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-5">
                <h2 className="text-sm md:text-base font-bold text-slate-800 mb-3">
                  برچسب‌ها
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-slate-100 text-xs md:text-sm text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* باکس CTA برای مشاوره / پیش‌فاکتور */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-5 md:p-6 text-white shadow-md">
              <h3 className="text-base md:text-lg font-bold mb-2">
                نیاز به مشاوره برای انتخاب کانکس دارید؟
              </h3>
              <p className="text-xs md:text-sm text-indigo-50 mb-4 leading-relaxed">
                مشخصات پروژه‌تان را بفرستید تا کارشناسان کانکس نیکان بهترین
                مدل، متراژ و بازه قیمتی را به شما پیشنهاد بدهند.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-full bg-white text-indigo-700 text-sm font-semibold shadow-sm hover:bg-indigo-50 transition"
              >
                درخواست مشاوره و پیش‌فاکتور
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
