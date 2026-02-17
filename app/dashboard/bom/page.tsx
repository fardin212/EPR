// app/dashboard/bom/page.tsx
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BomDashboardPage() {
  const templates = await prisma.bomTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      projectType: true,
      _count: { select: { items: true, projects: true } },
    },
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-400">Material Standards</p>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
            BOM — لیست مواد استاندارد سازه‌ها
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 max-w-xl leading-5">
            از این بخش می‌توانید BOM استاندارد هر نوع سازه را تعریف کنید تا
            هنگام ساخت پروژه‌ها بتوانید مصرف واقعی را با مصرف استاندارد مقایسه کنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/dashboard/projects"
            className="text-[11px] text-slate-500 hover:text-slate-700"
          >
            ← مشاهده پروژه‌ها
          </a>
          <a
            href="/dashboard/bom/new"
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <span>➕</span> تعریف BOM جدید
          </a>
        </div>
      </section>

      {/* Table / Empty */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5">
        {templates.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center gap-3">
            <div className="text-4xl mb-1">📦</div>
            <div className="text-sm font-medium text-slate-700">
              هنوز BOM استاندارد تعریف نشده است.
            </div>
            <div className="text-[11px] text-slate-500 max-w-md leading-5">
              می‌توانید برای سازه‌هایی مانند ویلایی، نگهبانی، کارگاهی یا ساندویچ‌پنلی،
              یک BOM استاندارد تعریف کنید تا مصرف واقعی پروژه‌ها را مدیریت و تحلیل کنید.
            </div>
            <a
              href="/dashboard/bom/new"
              className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-medium hover:bg-indigo-700"
            >
              شروع تعریف اولین BOM
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px] text-right">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">عنوان BOM</th>
                  <th className="px-3 py-2 font-medium">نام داخلی</th>
                  <th className="px-3 py-2 font-medium">نوع سازه</th>
                  <th className="px-3 py-2 font-medium">تعداد آیتم‌ها</th>
                  <th className="px-3 py-2 font-medium">پروژه‌های متصل</th>
                  <th className="px-3 py-2 font-medium">وضعیت</th>
                  <th className="px-3 py-2 font-medium">ایجاد</th>
                </tr>
              </thead>

              <tbody>
                {templates.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-b border-slate-100 ${
                      i % 2 === 1 ? "bg-slate-50/50" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <a
                          href={`/dashboard/bom/${t.id}`}
                          className="text-[13px] font-medium text-slate-800 hover:text-indigo-600"
                        >
                          {t.title}
                        </a>
                        <span className="text-[10px] text-slate-400">
                          #{t.id}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-slate-700">{t.name}</td>

                    <td className="px-3 py-3 text-slate-700">
                      {t.projectType?.name || "عمومی"}
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 text-[10px]">
                        {t._count.items} آیتم
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 text-[10px]">
                        {t._count.projects} پروژه
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {t.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 text-[10px]">
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 text-[10px]">
                          غیرفعال
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-slate-600">
                      {t.createdAt.toISOString().split("T")[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
