// app/admin/(dashboard)/articles/page.tsx
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function guard() {
  const auth = cookies().get("admin_auth")?.value;
  if (auth !== "1") redirect("/admin/login");
}

function fmt(d?: Date | null) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

export default async function ArticlesPage() {
  noStore();
  guard();

  const posts = await prisma.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">مقالات</h1>
        <Link
          href="/admin/articles/new"
          className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm"
        >
          افزودن مقاله
        </Link>
      </div>

      <div className="rounded-2xl border bg-white overflow-x-auto">
        {posts.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">
            هنوز مقاله‌ای ثبت نشده.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-right">عنوان</th>
                <th className="px-3 py-2 text-right">وضعیت</th>
                <th className="px-3 py-2 text-right">انتشار</th>
                <th className="px-3 py-2 text-right">آخرین ویرایش</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span>{p.title}</span>
                      <span className="text-[11px] text-gray-400 ltr">
                        /post/{p.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={statusCls(p.status || undefined)}>
                      {labelStatus(p.status || undefined)}
                    </span>
                  </td>
                  <td className="px-3 py-2">{fmt(p.publishedAt)}</td>
                  <td className="px-3 py-2">{fmt(p.updatedAt)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/post/${p.slug}`}
                        className="px-2.5 py-1.5 rounded-lg border text-xs text-gray-700 hover:bg-gray-50"
                        target="_blank"
                      >
                        مشاهده
                      </Link>
                      <Link
                        href={`/admin/articles/${p.id}`}
                        className="px-2.5 py-1.5 rounded-lg border text-xs hover:bg-gray-50"
                      >
                        ویرایش
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function statusCls(st?: string | null) {
  const base = "px-2 py-0.5 rounded-lg text-xs";
  const v = (st || "").toLowerCase();
  if (v === "published") return `${base} bg-green-100 text-green-700`;
  if (v === "draft" || v === "pending")
    return `${base} bg-amber-100 text-amber-700`;
  return `${base} bg-gray-100 text-gray-700`;
}

function labelStatus(st?: string | null) {
  const v = (st || "").toLowerCase();
  if (v === "published") return "منتشر شده";
  if (v === "draft") return "پیش‌نویس";
  if (v === "pending") return "در انتظار";
  return "—";
}
