// app/admin/(dashboard)/articles/new/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createPost } from "../actions";

export const dynamic = "force-dynamic";

const cls = {
  wrap: "max-w-5xl mx-auto px-4 py-6 text-[color:var(--text)]",
  header:
    "sticky top-0 z-10 -mx-4 -mt-6 mb-6 px-4 py-3 bg-[color:var(--surface)]/80 backdrop-blur border-b border-[color:var(--line)]",
  card: "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-sm p-4",
  label: "block text-xs font-medium text-[color:var(--muted)] mb-1",
  field:
    "w-full rounded-xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]",
  area:
    "w-full rounded-xl border border-[color:var(--line)] bg-white/70 px-3 py-2 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]",
  hint: "text-xs text-[color:var(--muted)] mt-1",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-[color:var(--brand)] text-white hover:brightness-110 transition",
  grid2:
    "grid gap-4 md:grid-cols-2 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse",
  grid3:
    "grid gap-4 md:grid-cols-3 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse",
};

export default function NewArticlePage() {
  const auth = cookies().get("admin_auth")?.value;
  if (auth !== "1") redirect("/admin/login");

  return (
    <main className={cls.wrap}>
      {/* هدر */}
      <div className={cls.header}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold">افزودن مقاله جدید</h1>
            <p className="text-xs text-[color:var(--muted)]">
              عنوان، اسلاگ، تصویر کاور، متن مقاله و تنظیمات سئو را پر کنید.
            </p>
          </div>
        </div>
      </div>

      {/* فرم ایجاد مقاله – حتما سرور اکشن و enctype */}
      <form
        action={createPost}
        method="post"
        encType="multipart/form-data"
        className="space-y-5"
      >
        {/* هدر مقاله: عنوان / اسلاگ / وضعیت / خلاصه / کاور */}
        <section className={cls.card}>
          <div className={cls.grid3}>
            <div className="md:px-4">
              <label className={cls.label}>عنوان (H1)</label>
              <input
                name="title"
                required
                className={cls.field}
                placeholder="مثلاً: کانکس پیش‌ساخته چیست؟ راهنمای کامل خرید ۱۴۰۳"
              />
              <p className={cls.hint}>عنوان اصلی مقاله.</p>
            </div>
            <div className="md:px-4">
              <label className={cls.label}>اسلاگ (URL)</label>
              <input
                name="slug"
                dir="ltr"
                className={cls.field + " ltr"}
                placeholder="sandwich-panel-conex-guide"
              />
              <p className={cls.hint}>
                فقط اسلاگ را بنویس (بدون https و دامنه) – مسیر نهایی می‌شود
                <br />
                <code className="text-[10px]">
                  https://conexnikan.com/post/your-slug
                </code>
              </p>
            </div>
            <div className="md:px-4">
              <label className={cls.label}>وضعیت</label>
              <select name="status" defaultValue="published" className={cls.field}>
                <option value="draft">پیش‌نویس</option>
                <option value="published">انتشار</option>
                <option value="pending">در انتظار</option>
              </select>
              <p className={cls.hint}>
                در حالت انتشار، مقاله روی سایت عمومی دیده می‌شود.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:px-0">
              <label className={cls.label}>خلاصه / Excerpt</label>
              <textarea
                name="excerpt"
                rows={3}
                className={cls.area}
                placeholder="چکیدهٔ ۲–۳ خطی برای لیست مقالات…"
              />
              <p className={cls.hint}>
                در کارت‌های بلاگ و گاهی در شبکه‌های اجتماعی استفاده می‌شود.
              </p>
            </div>

            {/* کاور – آپلود + URL + Alt */}
            <div className="md:px-0 grid gap-3">
              <div>
                <label className={cls.label}>تصویر کاور (Hero) – آپلود</label>
                <input
                  type="file"
                  name="coverFile"
                  accept="image/*"
                  className={cls.field}
                />
                <p className={cls.hint}>
                  یک تصویر افقی حداقل ۴۶۰×۲۲۱ برای بالای مقاله آپلود کنید.
                </p>
              </div>
              <div>
                <label className={cls.label}>
                  یا آدرس آماده تصویر کاور (URL اختیاری)
                </label>
                <input
                  name="coverUrl"
                  className={cls.field + " ltr"}
                  dir="ltr"
                  placeholder="/uploads/2025/10/sandwich-panel-hero.webp"
                />
                <p className={cls.hint}>
                  اگر URL را پر کنی، در اولویت است؛ در غیر این صورت از فایل
                  آپلود شده استفاده می‌شود.
                </p>
              </div>
              <div>
                <label className={cls.label}>Alt تصویر کاور</label>
                <input
                  name="coverAlt"
                  className={cls.field}
                  placeholder="نمای کانکس ساندویچ‌پنلی در کارگاه"
                />
              </div>
            </div>
          </div>
        </section>

        {/* متن مقاله + تنظیمات ساختاری / دسته‌بندی / زمان مطالعه */}
        <section className={cls.card}>
          <div className={cls.grid2}>
            <div className="md:px-4">
              <label className={cls.label}>متن مقاله (Markdown/HTML)</label>
              <textarea
                name="body"
                rows={16}
                required
                className={cls.area}
                placeholder={`## مقدمه\n\nدر این مقاله با انواع کانکس ساندویچ‌پنلی، مزایا، معایب و نکات مهم قبل از خرید آشنا می‌شوید…`}
              />
            </div>

            <div className="md:px-4">
              <label className={cls.label}>تنظیمات ساختاری</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="toc" className="h-4 w-4" />
                  <span>فهرست مطالب خودکار (TOC)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="featured" className="h-4 w-4" />
                  <span>ویژه / Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="noindex" className="h-4 w-4" />
                  <span>Noindex</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="nofollow" className="h-4 w-4" />
                  <span>Nofollow</span>
                </label>
              </div>

              <div className="mt-3 grid gap-3">
                <div>
                  <label className={cls.label}>دسته‌بندی (متنی)</label>
                  <input
                    name="category"
                    className={cls.field}
                    placeholder="راهنماها / کانکس ساندویچ‌پنلی"
                  />
                </div>
                <div>
                  <label className={cls.label}>برچسب‌ها (اختیاری)</label>
                  <input
                    name="tags"
                    className={cls.field}
                    placeholder="کانکس, کانکس ساندویچ‌پنلی, دفتر کارگاهی"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={cls.label}>تاریخ انتشار (اختیاری)</label>
                    <input
                      name="publishedAt"
                      type="datetime-local"
                      className={cls.field + " ltr"}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={cls.label}>
                      زمان تقریبی مطالعه (دقیقه)
                    </label>
                    <input
                      name="readMinutes"
                      type="number"
                      min={1}
                      className={cls.field + " ltr"}
                      defaultValue={10}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* سئو و شبکه‌های اجتماعی – مثل فرم ویرایش */}
        <section className={cls.card}>
          <h2 className="text-sm font-bold">تنظیمات سئو و شبکه‌های اجتماعی</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>Meta Title</label>
              <input
                name="metaTitle"
                className={cls.field}
                placeholder="کانکس ساندویچ‌پنلی چیست؟ راهنمای خرید، قیمت و مزایا ۱۴۰۳"
              />
              <p className={cls.hint}>حدود ۵۵–۶۵ کاراکتر.</p>
            </div>
            <div className="md:px-4">
              <label className={cls.label}>Meta Description</label>
              <input
                name="metaDesc"
                className={cls.field}
                placeholder="در این مقاله با انواع کانکس ساندویچ‌پنلی، کاربردها، مزایا و نکات مهم قبل از خرید آشنا می‌شوید…"
              />
              <p className={cls.hint}>حدود ۱۴۰–۱۶۰ کاراکتر.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>Canonical URL</label>
              <input
                name="canonical"
                dir="ltr"
                className={cls.field + " ltr"}
                placeholder="https://conexnikan.com/post/sandwich-panel-conex-guide"
              />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>OG Title</label>
              <input
                name="ogTitle"
                className={cls.field}
                placeholder="کانکس ساندویچ‌پنلی چیست؟"
              />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>OG Image (URL)</label>
              <input
                name="ogImage"
                dir="ltr"
                className={cls.field + " ltr"}
                placeholder="/og/sandwich-panel-guide.jpg"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:px-0">
              <label className={cls.label}>نوع اسکیما</label>
              <select name="schemaType" className={cls.field} defaultValue="Article">
                <option value="Article">Article</option>
                <option value="BlogPosting">BlogPosting</option>
                <option value="NewsArticle">NewsArticle</option>
              </select>
            </div>
            <div className="md:px-0">
              <label className={cls.label}>FAQ (سؤال — پاسخ در هر خط)</label>
              <textarea
                name="faq"
                rows={3}
                className={cls.area}
                placeholder={`کانکس ساندویچ‌پنلی چیست؟—یک سازه پیش‌ساخته با دیواره‌های عایق ساندویچ‌پنل.\nزمان ساخت چقدر است؟—بسته به متراژ معمولاً ۱۰ تا ۲۰ روز کاری.`}
              />
            </div>
            <div className="md:px-0">
              <label className={cls.label}>Internal Links (لینک‌های داخلی)</label>
              <input
                name="internalLinks"
                className={cls.field}
                placeholder="/category/sandwich-conex, /post/villa-conex-guide"
              />
            </div>
          </div>
        </section>

        {/* دکمه‌ها */}
        <div className="flex items-center gap-3">
          <button type="submit" className={cls.btnPrimary}>
            ثبت مقاله
          </button>
          <a
            href="/admin/articles"
            className="rounded-xl px-4 py-2 border border-[color:var(--line)] hover:bg-white/50"
          >
            انصراف
          </a>
        </div>
      </form>
    </main>
  );
}
