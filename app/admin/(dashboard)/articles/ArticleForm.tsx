// app/admin/(dashboard)/articles/ArticleForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Post, PostStatus } from "@prisma/client";

type ArticleFormMode = "create" | "edit";

type ArticleFormProps = {
  mode: ArticleFormMode;
  defaultValues?: Partial<Post>;
  /**
   * سرور اکشن createPost یا updatePost را از صفحه والد پاس بده:
   * <ArticleForm mode="create" onSubmit={createPost} />
   */
  onSubmit: (formData: FormData) => void;
};

const META_TITLE_IDEAL_MIN = 55;
const META_TITLE_IDEAL_MAX = 65;
const META_DESC_IDEAL_MIN = 140;
const META_DESC_IDEAL_MAX = 160;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // حذف کاراکترهای غیر لاتین (اگر دوست نداری حذف شود، این خط را بردار)
    .replace(/[\u0600-\u06FF]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ArticleForm({ mode, defaultValues, onSubmit }: ArticleFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);

  const [metaTitle, setMetaTitle] = useState(defaultValues?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(defaultValues?.metaDesc ?? "");

  const [status, setStatus] = useState<PostStatus>(
    defaultValues?.status ?? "draft"
  );

  // وقتی عنوان تغییر کند و اسلاگ هنوز دستی دست‌کاری نشده، اسلاگ خودکار بساز
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  const metaTitleLen = metaTitle.length;
  const metaDescLen = metaDesc.length;

  const metaTitleHint = useMemo(() => {
    if (!metaTitleLen) return "بهتر است ۵۵ تا ۶۵ کاراکتر باشد.";
    if (metaTitleLen < META_TITLE_IDEAL_MIN) return "کمی کوتاه است.";
    if (metaTitleLen > META_TITLE_IDEAL_MAX) return "کمی بلند است.";
    return "طول بسیار مناسب است ✅";
  }, [metaTitleLen]);

  const metaDescHint = useMemo(() => {
    if (!metaDescLen) return "بهتر است ۱۴۰ تا ۱۶۰ کاراکتر باشد.";
    if (metaDescLen < META_DESC_IDEAL_MIN) return "کمی کوتاه است.";
    if (metaDescLen > META_DESC_IDEAL_MAX) return "کمی بلند است.";
    return "طول بسیار مناسب است ✅";
  }, [metaDescLen]);

  return (
    <form
      action={onSubmit}
      className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* hidden id برای حالت ویرایش */}
      {mode === "edit" && defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {/* هدر فرم */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {mode === "create" ? "افزودن مقاله جدید" : "ویرایش مقاله"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            عنوان، اسلاگ، وضعیت انتشار و تصویر کاور را مشخص کنید.
          </p>
        </div>

        {/* وضعیت مقاله */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">وضعیت</label>
          <select
            name="status"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
          >
            <option value="draft">پیش‌نویس</option>
            <option value="published">منتشر شده</option>
            <option value="pending">در انتظار بازبینی</option>
          </select>
        </div>
      </div>

      {/* بخش اصلی: عنوان / اسلاگ / کاور */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* عنوان */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">
              عنوان (H1)
            </label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="مثلاً: راهنمای جامع خرید کانکس ویلایی در سال ۲۰۲۵"
            />
            <p className="mt-1 text-xs text-slate-500">
              عنوان اصلی که در بالای مقاله و تب مرورگر (در صورت خالی بودن Meta
              Title) نمایش داده می‌شود.
            </p>
          </div>

          {/* اسلاگ */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">
              اسلاگ (URL)
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="truncate text-slate-400">
                https://conexnikan.com/post/
              </span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                onBlur={() => setSlugTouched(true)}
                className="min-w-0 flex-1 bg-transparent text-left text-slate-800 outline-none"
                placeholder="villa-conex-buying-guide"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              در صورت خالی بودن، به‌صورت خودکار از روی عنوان ساخته می‌شود.
            </p>
          </div>

          {/* چکیده */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800">
              چکیده (Excerpt)
            </label>
            <textarea
              name="excerpt"
              defaultValue={defaultValues?.excerpt ?? ""}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="۲–۳ خط خلاصه جذاب برای ابتدای مقاله و نمایش در لیست مقالات..."
            />
            <p className="mt-1 text-xs text-slate-500">
              این متن در بالای مقاله و همچنین در کارت‌های لیست مقالات استفاده
              می‌شود.
            </p>
          </div>
        </div>

        {/* کاور و دسته‌بندی / زمان مطالعه */}
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              URL تصویر کاور (Hero)
            </label>
            <input
              name="coverUrl"
              defaultValue={defaultValues?.coverUrl ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="/images/blog/villa-hero.webp"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              متن Alt تصویر کاور
            </label>
            <input
              name="coverAlt"
              defaultValue={defaultValues?.coverAlt ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="نمای کانکس ویلایی در باغ"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                دسته‌بندی (اختیاری)
              </label>
              <input
                name="category"
                defaultValue={defaultValues?.category ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="کانکس ویلایی، فونداسیون..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                زمان تقریبی مطالعه (دقیقه)
              </label>
              <input
                name="readMinutes"
                type="number"
                min={1}
                defaultValue={defaultValues?.readMinutes ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="۵"
              />
            </div>
          </div>

          {/* فلگ‌ها */}
          <div className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-xs">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">
              تنظیمات نمایشی و سئو
            </p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="toc"
                defaultChecked={defaultValues?.toc ?? false}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <span>ساخت خودکار فهرست مطالب (Table of Contents)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={defaultValues?.featured ?? false}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <span>نمایش به‌عنوان مقاله ویژه (Featured)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="noindex"
                defaultChecked={defaultValues?.noindex ?? false}
                className="h-4 w-4 rounded border-slate-300 text-rose-500"
              />
              <span>عدم ایندکس (Noindex)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="nofollow"
                defaultChecked={defaultValues?.nofollow ?? false}
                className="h-4 w-4 rounded border-slate-300 text-rose-500"
              />
              <span>عدم دنبال‌کردن لینک‌ها (Nofollow)</span>
            </label>
          </div>
        </div>
      </section>

      {/* متن مقاله (Markdown/HTML) */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              متن مقاله (Markdown/HTML)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              از هدینگ‌های منظم H2/H3 استفاده کنید، لیست چک‌لیست، جدول و نقل‌قول
              بسیار مفید است.
            </p>
          </div>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] text-slate-700">
            پشتیبانی از Markdown
          </span>
        </div>

        <textarea
          name="body"
          required
          defaultValue={defaultValues?.body ?? ""}
          rows={16}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-7 text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder={`## مقدمه\n\nدر این راهنمای جامع، قدم‌به‌قدم شما را با انتخاب کانکس ویلایی مناسب، فونداسیون، مجوزها و نکات فنی آشنا می‌کنیم...`}
        />
      </section>

      {/* سئو و متا */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Meta Title + Meta Description */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            تنظیمات سئو (Meta Title / Description)
          </h2>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Meta Title
            </label>
            <input
              name="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="راهنمای خرید کانکس ویلایی | قیمت، مجوز، فونداسیون"
            />
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">{metaTitleHint}</span>
              <span
                className={
                  metaTitleLen >= META_TITLE_IDEAL_MIN &&
                  metaTitleLen <= META_TITLE_IDEAL_MAX
                    ? "font-semibold text-emerald-600"
                    : "text-slate-500"
                }
              >
                {metaTitleLen} کاراکتر
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Meta Description
            </label>
            <textarea
              name="metaDesc"
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="راهنمای کامل انتخاب کانکس ویلایی؛ هزینه‌ها، نکات فنی، مجوز، فونداسیون و چک‌لیست خرید مطمئن..."
            />
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">{metaDescHint}</span>
              <span
                className={
                  metaDescLen >= META_DESC_IDEAL_MIN &&
                  metaDescLen <= META_DESC_IDEAL_MAX
                    ? "font-semibold text-emerald-600"
                    : "text-slate-500"
                }
              >
                {metaDescLen} کاراکتر
              </span>
            </div>
          </div>
        </div>

        {/* Canonical / OG */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Canonical و شبکه‌های اجتماعی
          </h2>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Canonical URL
            </label>
            <input
              name="canonical"
              defaultValue={defaultValues?.canonical ?? ""}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="https://conexnikan.com/post/villa-conex-buying-guide"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                OG Title (اختیاری)
              </label>
              <input
                name="ogTitle"
                defaultValue={defaultValues?.ogTitle ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="راهنمای خرید کانکس ویلایی"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                OG Image (URL)
              </label>
              <input
                name="ogImage"
                defaultValue={defaultValues?.ogImage ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="/og/villa-guide.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* دکمه ثبت */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <p className="text-xs text-slate-500">
          پس از ذخیره، صفحه مقاله و لیست مقالات به‌صورت خودکار به‌روزرسانی
          می‌شود.
        </p>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
        >
          {mode === "create" ? "ثبت مقاله" : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}
