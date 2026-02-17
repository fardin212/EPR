import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const guides = await prisma.guide.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, slug: true, seoTitle: true, updatedAt: true },
    take: 200,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-extrabold text-slate-900">راهنماها (Guides)</h1>
        <Link
          href="/admin/guides/new"
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-400"
        >
          ایجاد راهنما
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 px-4 py-3 text-xs font-extrabold text-slate-600">
          <div className="col-span-4">نام</div>
          <div className="col-span-4">Slug</div>
          <div className="col-span-3">آخرین بروزرسانی</div>
          <div className="col-span-1 text-left">عملیات</div>
        </div>

        {guides.map((g) => (
          <div key={g.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-slate-100">
            <div className="col-span-4 font-semibold text-slate-900">
              {g.name}
              {g.seoTitle ? <div className="text-[11px] text-slate-500 line-clamp-1">{g.seoTitle}</div> : null}
            </div>
            <div className="col-span-4 text-slate-700">{g.slug}</div>
            <div className="col-span-3 text-slate-600 text-xs">
              {new Date(g.updatedAt).toLocaleString("fa-IR")}
            </div>
            <div className="col-span-1 text-left">
              <Link className="text-emerald-600 font-extrabold hover:underline" href={`/admin/guides/${g.id}`}>
                ویرایش
              </Link>
            </div>
          </div>
        ))}

        {guides.length === 0 && (
          <div className="px-4 py-6 text-sm text-slate-500">هیچ راهنمایی ثبت نشده است.</div>
        )}
      </div>
    </main>
  );
}
