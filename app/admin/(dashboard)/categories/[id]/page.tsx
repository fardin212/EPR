import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import CategoryImageField from "@/components/admin/CategoryImageField";
import { requireAdmin } from "@/lib/adminGuard";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const categoryId = Number(id);

  // دریافت دسته فعلی
  const cat = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!cat) notFound();

  // دریافت همه دسته‌ها برای انتخاب والد
  const categories = await prisma.category.findMany({
    where: { id: { not: categoryId } },
    orderBy: { name: "asc" },
  });

  async function action(formData: FormData) {
    "use server";
    await requireAdmin();

    const data = {
      name: String(formData.get("name") || "").trim(),
      slug: String(formData.get("slug") || "").trim(),
      parentId: formData.get("parentId")
        ? Number(formData.get("parentId"))
        : null,

      imageUrl: String(formData.get("imageUrl") || "").trim() || null,

      // ---- فیلدهای سئو ----
      seoTitle: String(formData.get("seoTitle") || "").trim() || null,
      seoDescription:
        String(formData.get("seoDescription") || "").trim() || null,

      focusKeyword:
        String(formData.get("focusKeyword") || "").trim() || null,
      seoKeywords:
        String(formData.get("seoKeywords") || "").trim() || null,

      canonical: String(formData.get("canonical") || "").trim() || null,
      ogTitle: String(formData.get("ogTitle") || "").trim() || null,
      ogImage: String(formData.get("ogImage") || "").trim() || null,

      noindex: formData.get("noindex") === "on",
      nofollow: formData.get("nofollow") === "on",

      readMinutes: Number(formData.get("readMinutes") || "0") || null,

      // ---- محتوا ----
      summary: String(formData.get("summary") || "").trim() || null,
      description: String(formData.get("description") || "").trim() || null,
      contentHtml: String(formData.get("contentHtml") || "").trim() || null,

      // ---- JSON Fields ----
      faqJson: formData.get("faqJson")
        ? JSON.parse(String(formData.get("faqJson")))
        : null,
      schemaJson: formData.get("schemaJson")
        ? JSON.parse(String(formData.get("schemaJson")))
        : null,
    };

    await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    redirect("/admin/categories");
  }

  return (
    <form action={action} className="space-y-8 max-w-3xl">
      <h1 className="text-xl font-bold mb-4">ویرایش دسته</h1>

      {/* نام و اسلاگ */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">نام دسته</label>
          <input
            name="name"
            defaultValue={cat.name || ""}
            className="w-full rounded-xl border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">اسلاگ</label>
          <input
            name="slug"
            defaultValue={cat.slug || ""}
            className="w-full rounded-xl border px-3 py-2"
            required
          />
        </div>
      </div>

      {/* انتخاب والد */}
      <div>
        <label className="block text-sm mb-1">والد (اختیاری)</label>
        <select
          name="parentId"
          className="w-full rounded-xl border px-3 py-2"
          defaultValue={cat.parentId ?? ""}
        >
          <option value="">— بدون والد —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* تصویر */}
      <CategoryImageField
        defaultValue={cat.imageUrl ?? ""}
        label="تصویر دسته"
      />

      {/* -------------------------- */}
      {/*    بخش سئو (SEO Section)   */}
      {/* -------------------------- */}
      <div className="border rounded-xl p-4 space-y-4 bg-gray-50">
        <h2 className="font-bold text-lg">تنظیمات سئو</h2>

        <div>
          <label className="block text-sm mb-1">عنوان سئو (SEO Title)</label>
          <input
            name="seoTitle"
            defaultValue={cat.seoTitle || ""}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">توضیحات متا (Meta Description)</label>
          <textarea
            name="seoDescription"
            defaultValue={cat.seoDescription || ""}
            rows={3}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        {/* کلیدواژه‌ها */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">کلیدواژه اصلی</label>
            <input
              name="focusKeyword"
              defaultValue={cat.focusKeyword || ""}
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">چند کلیدواژه (جدا با , یا ،)</label>
            <input
              name="seoKeywords"
              defaultValue={cat.seoKeywords || ""}
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>
        </div>

        {/* Canonical + OG */}
        <div>
          <label className="block text-sm mb-1">Canonical URL</label>
          <input
            name="canonical"
            defaultValue={cat.canonical || ""}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">OG Title</label>
            <input
              name="ogTitle"
              defaultValue={cat.ogTitle || ""}
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">OG Image</label>
            <input
              name="ogImage"
              defaultValue={cat.ogImage || ""}
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>
        </div>

        {/* noindex / nofollow */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="noindex" defaultChecked={cat.noindex} />
            <span>noindex</span>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="nofollow" defaultChecked={cat.nofollow} />
            <span>nofollow</span>
          </label>
        </div>

        {/* زمان مطالعه */}
        <div>
          <label className="block text-sm mb-1">مدت مطالعه (دقیقه)</label>
          <input
            name="readMinutes"
            type="number"
            min="1"
            defaultValue={cat.readMinutes || ""}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>
      </div>

      {/* -------------------------- */}
      {/*   بخش محتوا / توضیحات    */}
      {/* -------------------------- */}
      <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
        <h2 className="font-bold text-lg">محتوای دسته</h2>

        <div>
          <label className="block text-sm mb-1">خلاصه</label>
          <textarea
            name="summary"
            defaultValue={cat.summary || ""}
            rows={2}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">توضیحات کوتاه</label>
          <textarea
            name="description"
            defaultValue={cat.description || ""}
            rows={3}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">محتوای HTML</label>
          <textarea
            name="contentHtml"
            defaultValue={cat.contentHtml || ""}
            rows={10}
            className="w-full rounded-xl border px-3 py-2 font-mono"
          />
        </div>
      </div>

      {/* -------------------------- */}
      {/*      FAQ + Schema JSON     */}
      {/* -------------------------- */}
      <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
        <h2 className="font-bold text-lg">FAQ و اسکیما</h2>

        <div>
          <label className="block text-sm mb-1">FAQ (فرمت JSON)</label>
          <textarea
            name="faqJson"
            defaultValue={
              cat.faqJson ? JSON.stringify(cat.faqJson, null, 2) : ""
            }
            rows={6}
            className="w-full rounded-xl border px-3 py-2 font-mono"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Schema JSON</label>
          <textarea
            name="schemaJson"
            defaultValue={
              cat.schemaJson ? JSON.stringify(cat.schemaJson, null, 2) : ""
            }
            rows={6}
            className="w-full rounded-xl border px-3 py-2 font-mono"
          />
        </div>
      </div>

      {/* دکمه ذخیره */}
      <button className="rounded-xl bg-indigo-600 text-white px-5 py-3 text-lg">
        ذخیره تغییرات
      </button>
    </form>
  );
}
