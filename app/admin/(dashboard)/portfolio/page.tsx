// app/admin/(dashboard)/portfolio/page.tsx
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function PortfolioAdminPage() {
  noStore();
  await requireAdmin();

  const projects = await prisma.project.findMany({
    orderBy: { id: "desc" },
    include: {
      category: { select: { name: true } },
      projectImages: {
        select: { url: true },
        take: 1,
        orderBy: { id: "asc" },
      },
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">نمونه‌کارها</h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریت لیست پروژه‌ها و دسترسی سریع به ویرایش هر نمونه‌کار.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-3 py-2 text-sm rounded-xl bg-gray-900 text-white hover:bg-black"
        >
          + نمونه‌کار جدید
        </Link>
      </header>

      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-right text-gray-500">
              <th className="px-3 py-2 font-normal">تصویر</th>
              <th className="px-3 py-2 font-normal">عنوان</th>
              <th className="px-3 py-2 font-normal">دسته‌بندی</th>
              <th className="px-3 py-2 font-normal">شهر</th>
              <th className="px-3 py-2 font-normal">متراژ</th>
              <th className="px-3 py-2 font-normal">تاریخ ایجاد</th>
              <th className="px-3 py-2 font-normal">اقدام</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const cover =
                p.imageUrl || // ✅ فیلد مستقیم پروژه
                p.projectImages[0]?.url || // ✅ اولین تصویر گالری پروژه
                "/images/fallback-metal.jpg";

              const alt =
                p.heroAlt ||
                `${p.category?.name ? `کانکس ${p.category.name} – ` : ""}${p.title} – کانکس نیکان`;

              return (
                <tr key={p.id} className="border-t align-middle">
                  <td className="px-3 py-2">
                    <div className="h-14 w-20 rounded-md border overflow-hidden bg-zinc-100">
                      {/* می‌تونی بعداً این رو به <Image /> تبدیل کنی */}
                      <img
                        src={cover}
                        alt={alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">{p.title}</div>
                    {p.slug && (
                      <div className="text-[11px] text-gray-500 ltr">
                        {p.slug}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {p.category?.name || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    {p.city || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    {p.meters ? `${p.meters} متر` : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        ویرایش
                      </Link>
                      <Link
                        href={`/portfolio/${p.slug}`}
                        className="text-purple-600 hover:underline text-xs"
                        target="_blank"
                      >
                        مشاهده در سایت
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}

            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-gray-600 text-center"
                >
                  هنوز نمونه‌کاری ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
