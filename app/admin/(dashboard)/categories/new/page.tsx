import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CategoryImageField from "@/components/admin/CategoryImageField";
import { requireAdmin } from "@/lib/adminGuard";

export default async function NewCategoryPage() {
  await requireAdmin();

  // ⬅️ دسته‌های موجود برای انتخاب والد
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  async function action(formData: FormData) {
    "use server";

    await requireAdmin();

    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const parentIdRaw = formData.get("parentId");
    const parentId = parentIdRaw ? Number(parentIdRaw) : null;
    const imageUrl = String(formData.get("imageUrl") || "").trim() || null;

    await prisma.category.create({
      data: { name, slug, parentId, imageUrl },
    });

    redirect("/admin/categories");
  }

  return (
    <form action={action} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm mb-1">نام دسته</label>
        <input name="name" className="w-full rounded-xl border px-3 py-2" required />
      </div>

      <div>
        <label className="block text-sm mb-1">اسلاگ</label>
        <input name="slug" className="w-full rounded-xl border px-3 py-2" required />
      </div>

      {/* ⬅️ فیلد انتخاب والد */}
      <div>
        <label className="block text-sm mb-1">والد (اختیاری)</label>
        <select
          name="parentId"
          className="w-full rounded-xl border px-3 py-2"
        >
          <option value="">— بدون والد —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <CategoryImageField label="تصویر دسته" />

      <button className="rounded-xl bg-indigo-600 text-white px-4 py-2">
        ثبت
      </button>
    </form>
  );
}
