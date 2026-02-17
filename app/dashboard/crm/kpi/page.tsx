import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CrmKpiPage() {
  const leads = await prisma.crmLead.findMany({
    select: {
      id: true,
      status: true,
      pipelineStage: true,
      createdAt: true,
    },
  });

  const total = leads.length;
  const stages: Record<string, number> = {};
  for (const l of leads) {
    const key = (l.pipelineStage || l.status || "NEW").toUpperCase();
    stages[key] = (stages[key] || 0) + 1;
  }

  const won = stages.WON || 0;
  const lost = stages.LOST || 0;
  const conversion = total ? Math.round((won / total) * 100) : 0;
  const lostRate = total ? Math.round((lost / total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6" dir="rtl">
      <section>
        <p className="text-xs text-slate-400">CRM / KPI</p>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800 mt-1">
          داشبورد KPI CRM
        </h1>
        <p className="text-[11px] text-slate-500 mt-1">
          چند شاخص کلیدی عملکرد برای نمای کلی وضعیت فروش.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="کل سرنخ‌ها" value={total} />
        <KpiCard title="سرنخ‌های برنده (WON)" value={won} />
        <KpiCard title="نرخ تبدیل به مشتری" value={`${conversion}٪`} />
        <KpiCard title="نرخ از دست‌رفته" value={`${lostRate}٪`} />
      </section>
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col gap-1 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className="text-[11px] text-slate-500">{title}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
