// app/admin/(dashboard)/banners/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function guard() {
  const auth = cookies().get("admin_auth")?.value;
  if (auth !== "1") redirect("/admin/login");
}

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  guard();

  // Server Action: تغییر وضعیت فعال/حذف
  async function toggleActive(formData: FormData) {
    "use server";
    const auth = cookies().get("admin_auth")?.value;
    if (auth !== "1") redirect("/admin/login");

    const id = Number(formData.get("id"));
    const active = String(formData.get("active")) === "true";
    await prisma.banner.update({ where: { id }, data: { active } });
    revalidatePath("/admin/banners");
  }

  async function removeBanner(formData: FormData) {
    "use server";
    const auth = cookies().get("admin_auth")?.value;
    if (auth !== "1") redirect("/admin/login");

    const id = Number(formData.get("id"));
    await prisma.banner.delete({ where: { id } });
    revalidatePath("/admin/banners");
  }

  const rows = await prisma.banner.findMany({
    orderBy: [{ sort: "asc" }, { id: "desc" }],
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">بنرها / Hero</h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریت بنرهای اسلایدر یا تصویر هدر
          </p>
        </div>

        <Link
          href="/admin/banners/new"
          className="px-3 py-2 text-sm rounded-xl bg-gray-900 text-white hover:bg-black"
        >
          + بنر جدید
        </Link>
      </header>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr className="[&>th]:py-3 [&>th]:px-3 text-right text-gray-500">
              <th>تصویر</th>
              <th>عنوان</th>
              <th>لینک</th>
              <th>مرتب‌سازی</th>
              <th>وضعیت</th>
              <th className="w-40">اقدام</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b: any) => (
              <tr key={b.id} className="border-t">
                <td className="px-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt={b.title || ""}
                    className="h-10 w-18 rounded-md object-cover border"
                  />
                </td>

                <td className="px-3 py-2 font-medium">{b.title || "—"}</td>
                <td className="px-3 py-2 text-zinc-600 ltr">{b.link || "—"}</td>
                <td className="px-3 py-2">{b.sort}</td>

                <td className="px-3 py-2">
                  <form
                    action={toggleActive}
                    className="inline-flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={b.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={(!b.active).toString()}
                    />
                    <button
                      className={`rounded-lg px-3 py-1.5 text-xs border ${
                        b.active
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      {b.active ? "فعال" : "غیرفعال"}
                    </button>
                  </form>
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/banners/${b.id}`}
                      className="rounded-lg border px-3 py-1.5 text-xs"
                    >
                      ویرایش
                    </Link>

                    <form action={removeBanner}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs hover:bg-rose-700"
                      >
                        حذف
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-zinc-500"
                >
                  هنوز بنری ثبت نشده.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
