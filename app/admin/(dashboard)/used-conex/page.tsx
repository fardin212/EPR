import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteUsedConex } from "./actions";

export default async function AdminUsedConexPage() {
  const rows = await prisma.usedConex.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: { id: true, title: true, slug: true, city: true, price: true, status: true, isReady: true },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">مدیریت کانکس‌های دست دوم</h1>
        <Link className="rounded-xl border px-4 py-2 text-sm font-semibold" href="/admin/used-conex/new">
          + افزودن مورد جدید
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border bg-white p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{r.title}</div>
              <div className="mt-1 text-xs text-gray-600">
                {r.slug} • {r.city} • {r.isReady ? "تحویل فوری" : "نیازمند هماهنگی"} • {r.status}
              </div>
            </div>

            <div className="flex gap-2">
              <Link className="rounded-xl border px-4 py-2 text-sm font-semibold" href={`/admin/used-conex/${r.id}`}>
                ویرایش
              </Link>

              <form action={async () => { "use server"; await deleteUsedConex(r.id); }}>
                <button className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-rose-50">
                  حذف
                </button>
              </form>

              <Link className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                    href={`/used-conex/buy/${r.slug}`}>
                مشاهده
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
