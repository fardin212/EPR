// app/admin/(dashboard)/portfolio/[id]/edit/page.tsx
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { updateProject, removeProject } from "../../actions";
import { requireAdmin } from "@/lib/adminGuard";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin(); // ✅ گارد جدید

  const { id } = await params;
  const pid = Number(id);
  if (!Number.isFinite(pid)) notFound();

  const [project, categories] = await Promise.all([
    prisma.project.findUnique({ where: { id: pid } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!project) notFound();

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">
          ویرایش نمونه‌کار #{project.id}
        </h1>

        <form action={removeProject}>
          <input type="hidden" name="id" value={project.id} />
          <button className="px-3 py-2 rounded-xl border text-rose-600 hover:bg-rose-50">
            حذف
          </button>
        </form>
      </div>

      <form action={updateProject} className="grid gap-3 max-w-2xl">
        <input type="hidden" name="id" value={project.id} />

        <input
          name="title"
          defaultValue={project.title}
          className="rounded-xl border px-3 py-2"
          placeholder="عنوان"
          required
        />

        <input
          name="slug"
          defaultValue={project.slug}
          className="rounded-xl border px-3 py-2"
          placeholder="slug-unique"
          required
          dir="ltr"
        />

        <textarea
          name="summary"
          defaultValue={project.summary || ""}
          className="rounded-xl border px-3 py-2"
          placeholder="خلاصه"
          rows={4}
        />

        <select
          name="categoryId"
          defaultValue={project.categoryId || ""}
          className="rounded-xl border px-3 py-2"
        >
          <option value="">— بدون دسته —</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="w-fit px-4 py-2 rounded-xl bg-indigo-600 text-white">
          ذخیره
        </button>
      </form>
    </main>
  );
}
