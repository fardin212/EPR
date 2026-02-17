// app/admin/(dashboard)/categories/page.tsx
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { requireAdmin } from "@/lib/adminGuard";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  noStore();
  await requireAdmin(); // ✅ گارد مرکزی

  const cats = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    include: {
      children: true,
      projects: true,
      parent: { select: { id: true, name: true } },
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">دسته‌بندی‌ها</h1>
          <p className="text-sm text-gray-500 mt-1">
            افزودن/ویرایش/حذف دسته‌ها و زیردسته‌ها
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="px-3 py-2 text-sm rounded-xl bg-gray-900 text-white hover:bg-black"
        >
          + دستهٔ جدید
        </Link>
      </header>

      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-right text-gray-500">
              <th className="px-3 py-2 font-normal">تصویر</th>
              <th className="px-3 py-2 font-normal">عنوان</th>
              <th className="px-3 py-2 font-normal">Slug</th>
              <th className="px-3 py-2 font-normal">والد</th>
              <th className="px-3 py-2 font-normal">زیردسته</th>
              <th className="px-3 py-2 font-normal">پروژه‌ها</th>
              <th className="px-3 py-2 font-normal">اقدام</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c: any) => (
              <tr key={c.id} className="border-t align-middle">
                <td className="px-3 py-2">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="h-10 w-10 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md border bg-zinc-100" />
                  )}
                </td>
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2 text-gray-600">{c.slug}</td>
                <td className="px-3 py-2">{c.parent?.name || "—"}</td>
                <td className="px-3 py-2">{c.children.length}</td>
                <td className="px-3 py-2">{c.projects.length}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      ویرایش
                    </Link>
                    <Link
                      href={`/admin/categories/${c.id}/content`}
                      className="text-purple-600 hover:underline text-xs"
                    >
                      صفحه دسته‌بندی
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {cats.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-gray-600 text-center"
                >
                  هنوز دسته‌ای ثبت نشده.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
