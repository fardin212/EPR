// app/admin/(dashboard)/portfolio/new/page.tsx
import { PrismaClient } from "@prisma/client";
import { createProject } from "../actions";
import { requireAdmin } from "@/lib/adminGuard";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireAdmin(); // ✅ گارد جدید

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="space-y-4">
      <h1 className="text-lg font-bold">افزودن نمونه‌کار</h1>

      <form action={createProject} className="grid gap-3 max-w-2xl">
        <input
          name="title"
          className="rounded-xl border px-3 py-2"
          placeholder="عنوان"
          required
        />

        <input
          name="slug"
          className="rounded-xl border px-3 py-2"
          placeholder="slug-unique"
          required
          dir="ltr"
        />

        <textarea
          name="summary"
          className="rounded-xl border px-3 py-2"
          placeholder="خلاصه (اختیاری)"
          rows={4}
        />

        <select
          name="categoryId"
          className="rounded-xl border px-3 py-2"
          defaultValue=""
        >
          <option value="">— بدون دسته —</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="w-fit px-4 py-2 rounded-xl bg-indigo-600 text-white">
          ثبت
        </button>
      </form>
    </main>
  );
}
