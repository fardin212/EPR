import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type LeadLite = {
  id: number;
  status: string | null;
  pipelineStage: string | null;
  createdAt: Date;
  source: string | null;
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CrmAnalyticsPage(props: Props) {
  const sp = await props.searchParams;

  const fromStr = typeof sp.from === "string" ? sp.from : undefined;
  const toStr = typeof sp.to === "string" ? sp.to : undefined;
  const sourceFilter = typeof sp.source === "string" ? sp.source : undefined;

  const fromDate = fromStr ? new Date(fromStr) : null;
  const toDate = toStr ? endOfDay(new Date(toStr)) : null;

  const where: any = {};
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lte = toDate;
  }
  if (sourceFilter && sourceFilter !== "ALL") {
    where.source = sourceFilter;
  }

  const [leads, distinctSources] = await Promise.all([
    prisma.crmLead.findMany({
      where,
      select: {
        id: true,
        status: true,
        pipelineStage: true,
        createdAt: true,
        source: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.crmLead.findMany({
      where: { source: { not: null } },
      select: { source: true },
      distinct: ["source"],
    }),
  ]);

  const sources = distinctSources
    .map((x) => x.source)
    .filter((x): x is string => !!x);

  const total = leads.length;

  const stageCounts = countByStage(leads);
  const wonCount = stageCounts.WON || 0;
  const lostCount = stageCounts.LOST || 0;

  const conversionRate = total ? Math.round((wonCount / total) * 100) : 0;
  const lostRate = total ? Math.round((lostCount / total) * 100) : 0;

  const monthly = monthlyCounts(leads, 6);
  const maxMonthly = monthly.reduce((m, x) => Math.max(m, x.count), 0) || 1;

  const hasFilter = !!fromStr || !!toStr || (sourceFilter && sourceFilter !== "ALL");

  return (
    <div className="p-4 sm:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <section className="space-y-3">
        <div>
          <p className="text-xs text-slate-400">CRM / گزارش تحلیلی فروش</p>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 mt-1">
            گزارش تحلیلی سرنخ‌ها و فروش
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 max-w-2xl leading-5">
            خلاصه‌ای از وضعیت سرنخ‌ها در مراحل مختلف، نرخ تبدیل به مشتری، و روند
            سرنخ‌های ثبت‌شده در ماه‌های اخیر. می‌توانید بر اساس بازه زمانی و منبع
            سرنخ فیلتر کنید.
          </p>
        </div>

        {/* Filter Bar */}
        <form
          method="get"
          className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-end text-[12px]"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-500">از تاریخ</label>
            <input
              type="date"
              name="from"
              defaultValue={fromStr}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-[12px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-500">تا تاریخ</label>
            <input
              type="date"
              name="to"
              defaultValue={toStr}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-[12px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-500">منبع سرنخ</label>
            <select
              name="source"
              defaultValue={sourceFilter || "ALL"}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-[12px]"
            >
              <option value="ALL">همه منابع</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              type="submit"
              className="rounded-full bg-indigo-600 text-white text-[12px] px-5 py-1.5 hover:bg-indigo-700"
            >
              اعمال فیلتر
            </button>
            {hasFilter && (
              <a
                href="/dashboard/crm/analytics"
                className="rounded-full border border-slate-300 bg-slate-50 text-[12px] text-slate-600 px-4 py-1.5"
              >
                حذف فیلترها
              </a>
            )}
          </div>
        </form>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="تعداد کل سرنخ‌ها"
          value={total}
          subtitle="بر اساس فیلترهای فعلی"
        />
        <KpiCard
          title="سرنخ‌های برنده (WON)"
          value={wonCount}
          subtitle="تبدیل‌شده به مشتری / قرارداد"
        />
        <KpiCard
          title="نرخ تبدیل به مشتری"
          value={`${conversionRate}٪`}
          subtitle="از کل سرنخ‌های فیلتر شده"
        />
        <KpiCard
          title="نرخ از دست‌رفته"
          value={`${lostRate}٪`}
          subtitle="سرنخ‌هایی که به LOST رسیده‌اند"
        />
      </section>

      {/* Stage Distribution */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        <h2 className="text-[13px] sm:text-sm font-semibold text-slate-800">
          توزیع سرنخ‌ها در مراحل فروش
        </h2>
        <div className="space-y-2 text-[12px]">
          {["NEW", "CONTACTED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"].map(
            (stage) => {
              const count = stageCounts[stage] || 0;
              const percent = total ? Math.round((+count / total) * 100) : 0;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {stageLabel(stage)} ({count})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {percent}٪
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* Monthly trend */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        <h2 className="text-[13px] sm:text-sm font-semibold text-slate-800">
          روند ثبت سرنخ‌ها در ماه‌های اخیر
        </h2>
        <div className="space-y-3 text-[12px]">
          {monthly.map((m) => {
            const width = `${Math.round((m.count / maxMonthly) * 100)}%`;
            return (
              <div key={m.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{m.label}</span>
                  <span className="text-[11px] text-slate-400">
                    {m.count} سرنخ
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}

          {monthly.length === 0 && (
            <p className="text-[12px] text-slate-500">
              هنوز سرنخی در سیستم ثبت نشده است.
            </p>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          * در حال حاضر نمودار فقط تعداد سرنخ‌ها را نمایش می‌دهد؛ بعداً می‌توانیم
          مبلغ پیش‌فاکتورها و قراردادها را هم اضافه کنیم.
        </p>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function endOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col gap-1">
      <div className="text-[11px] text-slate-500">{title}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      {subtitle && (
        <div className="text-[11px] text-slate-400">{subtitle}</div>
      )}
    </div>
  );
}

function countByStage(leads: LeadLite[]) {
  const result: Record<string, number> = {};
  for (const l of leads) {
    const key = (l.pipelineStage || l.status || "NEW").toUpperCase();
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}

function monthlyCounts(leads: LeadLite[], monthsBack: number) {
  if (!leads.length) return [];

  const now = new Date();
  const result: { key: string; label: string; count: number }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;

    const count = leads.filter((l) => {
      const ld = new Date(l.createdAt);
      return ld.getFullYear() === y && ld.getMonth() === m;
    }).length;

    const label = d.toLocaleDateString("fa-IR", {
      year: "2-digit",
      month: "2-digit",
    });

    result.push({ key, label, count });
  }

  return result;
}

function stageLabel(stage: string) {
  switch (stage) {
    case "NEW":
      return "ورود سرنخ";
    case "CONTACTED":
      return "اولین تماس";
    case "PROPOSAL":
      return "ارسال پیش‌فاکتور";
    case "NEGOTIATION":
      return "مذاکره";
    case "WON":
      return "قرارداد نهایی / مشتری";
    case "LOST":
      return "از دست رفته";
    default:
      return stage;
  }
}
