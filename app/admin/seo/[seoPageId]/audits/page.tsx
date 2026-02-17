// app/admin/seo/[seoPageId]/audits/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type Props = {
  params: { seoPageId: string };
};

export const dynamic = "force-dynamic";

export default async function SeoAuditHistoryPage({ params }: Props) {
  const id = Number(params.seoPageId);
  if (!id || Number.isNaN(id)) notFound();

  const seoPage = await prisma.seoPage.findUnique({
    where: { id },
    include: {
      audits: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!seoPage) notFound();

  return (
    <main className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">تاریخچه سئو صفحه</p>
            <h1 className="text-lg font-extrabold text-slate-900">
              {seoPage.url}
            </h1>
            {seoPage.focusKeyword && (
              <p className="text-xs text-slate-500 mt-1">
                کلمه کلیدی:{" "}
                <span className="font-semibold text-slate-800">
                  {seoPage.focusKeyword}
                </span>
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-slate-900 text-slate-50 px-4 py-3 text-xs flex flex-col gap-1 min-w-[160px]">
            <div className="flex items-center justify-between">
              <span>آخرین نمره:</span>
              <span className="text-base font-extrabold">
                {seoPage.lastScore ?? "--"}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>آخرین تحلیل:</span>
              <span>
                {seoPage.lastAnalyzed
                  ? new Intl.DateTimeFormat("fa-IR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(seoPage.lastAnalyzed as any)
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>تعداد تحلیل‌ها:</span>
              <span>{seoPage.audits.length}</span>
            </div>
          </div>
        </header>

        {/* جدول تاریخچه */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              لیست تحلیل‌های انجام‌شده
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-right">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-600">
                    تاریخ
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-600">
                    نمره
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-600">
                    کلمات
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-600">
                    تعداد کیورد
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-600">
                    چگالی کیورد
                  </th>
                </tr>
              </thead>
              <tbody>
                {seoPage.audits.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      هنوز هیچ تحلیلی برای این صفحه ذخیره نشده است.
                    </td>
                  </tr>
                )}

                {seoPage.audits.map((audit) => (
                  <tr
                    key={audit.id}
                    className="border-b border-slate-50 hover:bg-slate-50/80"
                  >
                    <td className="px-3 py-2">
                      {new Intl.DateTimeFormat("fa-IR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(audit.createdAt as any)}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-900">
                      {audit.score}/100
                    </td>
                    <td className="px-3 py-2">{audit.wordCount}</td>
                    <td className="px-3 py-2">{audit.keywordCount}</td>
                    <td className="px-3 py-2">
                      {audit.density != null
                        ? `${audit.density.toFixed(2)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-[11px] text-slate-500">
          نکته: هر بار در پنل روی «تحلیل» کلیک می‌کنی، یک ردیف جدید در این
          جدول ثبت می‌شود. می‌تونی بر اساس تاریخ، روند بهبود سئو صفحه را
          ببینی و اگر نمره افت کرد، سریع متوجه شوی.
        </p>
      </div>
    </main>
  );
}
