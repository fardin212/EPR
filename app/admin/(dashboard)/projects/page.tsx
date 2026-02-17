// app/admin/(dashboard)/projects/page.tsx
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import Link from "next/link";
import Image from "next/image";
import { removeProject } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireAdmin();

  const projects = await prisma.project.findMany({
    orderBy: { id: "desc" },
    include: {
      category: true,
      projectImages: {
        orderBy: { id: "asc" },
      },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">نمونه‌کارها</h1>
          <p className="text-xs text-slate-500 mt-1">
            مدیریت یا ایجاد نمونه‌کار جدید
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-sm px-4 py-2 hover:bg-blue-700 transition"
        >
          + نمونه‌کار جدید
        </Link>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3 px-3 text-right w-24">تصویر</th>
              <th className="py-3 px-3 text-right">عنوان</th>
              <th className="py-3 px-3 text-right w-40">دسته</th>
              <th className="py-3 px-3 text-left ltr w-64">اسلاگ</th>
              <th className="py-3 px-3 text-center w-40">اقدام</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const cover =
                p.projectImages[0]?.url || "/images/fallback-metal.jpg";

              return (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                >
                  {/* ستون تصویر */}
                  <td className="py-2 px-3 align-middle">
                    <div className="w-16 h-16 rounded-md border border-slate-200 overflow-hidden bg-slate-100 relative">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </td>

                  {/* عنوان */}
                  <td className="py-2 px-3 align-middle">
                    <div className="font-semibold text-slate-900">
                      {p.title}
                    </div>
                  </td>

                  {/* دسته */}
                  <td className="py-2 px-3 align-middle">
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs">
                      {p.category?.name || "—"}
                    </span>
                  </td>

                  {/* اسلاگ */}
                  <td className="py-2 px-3 align-middle ltr text-xs text-slate-700">
                    {p.slug}
                  </td>

                  {/* اکشن‌ها */}
                  <td className="py-2 px-3 align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="px-3 py-1 rounded-full border border-slate-300 text-xs text-slate-800 bg-white hover:bg-slate-100"
                      >
                        ویرایش
                      </Link>

                      <form action={removeProject}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-full bg-rose-600 text-xs text-white hover:bg-rose-700"
                        >
                          حذف
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}

            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 px-4 text-center text-sm text-slate-500"
                >
                  هنوز هیچ نمونه‌کاری ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
