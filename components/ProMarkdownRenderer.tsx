// components/ProMarkdownRenderer.tsx
"use client";

import { marked } from "marked";
import clsx from "clsx";

type ProMarkdownRendererProps = {
  /** متن مارک‌داون خام (اختیاری) */
  markdown?: string | null;
  /** HTML آماده (مثلاً از ادیتور) – اگر باشد، بر مارک‌داون اولویت دارد */
  html?: string | null;
  /** کلاس‌های اضافی Tailwind */
  className?: string;
};

/**
 * Pro Markdown + HTML Renderer
 * - اگر html داشته باشیم همون رو رندر می‌کنه
 * - اگر فقط markdown داشته باشیم با marked تبدیل می‌کنه به HTML
 * - استایل کامل prose + RTL
 */
export default function ProMarkdownRenderer({
  markdown,
  html,
  className,
}: ProMarkdownRendererProps) {
  if (!markdown && !html) return null;

  // اگر HTML آماده نیامده، مارک‌داون را تبدیل کن
  const finalHtml =
    html && html.trim().length > 0
      ? html
      : marked.parse(markdown || "", {
          breaks: true,
        });

  return (
    <div
      dir="rtl"
      className={clsx(
        `
        prose prose-slate max-w-none prose-rtl
        prose-headings:scroll-mt-24
        prose-h1:text-2xl prose-h1:font-extrabold prose-h1:text-slate-900
        prose-h2:text-xl prose-h2:font-bold prose-h2:text-slate-900
        prose-h3:text-lg prose-h3:font-semibold prose-h3:text-slate-900
        prose-p:text-[15px] prose-p:leading-8
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:marker:text-slate-500
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl prose-img:border prose-img:border-slate-100
        prose-strong:text-slate-900
        prose-code:text-[13px] prose-code:bg-slate-900/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:text-[13px] prose-pre:rounded-2xl
        prose-table:border prose-table:border-slate-200
        prose-th:bg-slate-50 prose-th:font-semibold
      `,
        className
      )}
      // html از پنل ادمین / مارک‌داونِ خودت می‌آید
      dangerouslySetInnerHTML={{ __html: finalHtml as string }}
    />
  );
}
