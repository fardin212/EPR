import Link from "next/link";
import { prisma } from "@/lib/db";

function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfWeek(d = new Date()) {
  // هفته از شنبه/یکشنبه؟ اینجا ISO (دوشنبه)؛ برای سادگی همین OK
  const day = d.getDay(); // 0 Sunday
  const diff = (day + 6) % 7; // Monday=0
  const s = new Date(d);
  s.setDate(d.getDate() - diff);
  s.setHours(0, 0, 0, 0);
  return s;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function LeadsDashboardPage() {
  const now = new Date();
  const d0 = startOfDay(now);
  const w0 = startOfWeek(now);
  const m0 = startOfMonth(now);

  const [today, week, month, byStatus, topSlugRaw, topCityRaw] = await Promise.all([
    prisma.usedConexLead.count({ where: { createdAt: { gte: d0 } } }),
    prisma.usedConexLead.count({ where: { createdAt: { gte: w0 } } }),
    prisma.usedConexLead.count({ where: { createdAt: { gte: m0 } } }),

    prisma.usedConexLead.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),

    prisma.usedConexLead.groupBy({
      by: ["slug"],
      _count: { _all: true },
      where: { slug: { not: null } },
    }),

    prisma.usedConexLead.groupBy({
      by: ["city"],
      _count: { _all: true },
      where: { city: { not: null } },
    }),
  ]);

  const byStatusSorted = [...byStatus].sort((a, b) => b._count._all - a._count._all);

  const topSlug = [...topSlugRaw]
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 10);

  const topCity = [...topCityRaw]
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 10);

  const closed = byStatusSorted.find((x) => x.status === "closed")?._count._all || 0;
  const total = byStatusSorted.reduce((a, b) => a + b._count._all, 0);
  const conversion = total ? Math.round((closed / total) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">داشبورد لیدهای دست دوم</h1>
        <div className="flex gap-2">
          <Link
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
            href="/admin/used-conex/leads"
          >
            لیست لیدها
          </Link>
          <Link className="rounded-xl border px-4 py-2 text-sm font-semibold" href="/admin/used-conex">
            مدیریت کانکس‌ها
          </Link>
        </div>
      </div>

      {/* KPI */}
      <section className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xs text-gray-600">لیدهای امروز</div>
          <div className="mt-2 text-3xl font-extrabold">{today}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xs text-gray-600">این هفته</div>
          <div className="mt-2 text-3xl font-extrabold">{week}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xs text-gray-600">این ماه</div>
          <div className="mt-2 text-3xl font-extrabold">{month}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xs text-gray-600">نرخ تبدیل (closed)</div>
          <div className="mt-2 text-3xl font-extrabold">{conversion}%</div>
        </div>
      </section>

      {/* Status */}
      <section className="mt-6 rounded-2xl border bg-white p-6">
        <div className="text-lg font-extrabold">تفکیک وضعیت</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {byStatusSorted.map((s) => (
            <div key={s.status} className="rounded-xl border p-4">
              <div className="text-xs text-gray-600">{s.status}</div>
              <div className="mt-2 text-2xl font-extrabold">{s._count._all}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Top */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-lg font-extrabold">Top اسلاگ‌ها</div>
          <div className="mt-4 grid gap-2">
            {topSlug.map((x) => (
              <div key={x.slug || "-"} className="flex items-center justify-between rounded-xl border px-4 py-3">
                <Link className="text-sm font-semibold underline" href={`/used-conex/buy/${x.slug}`} target="_blank">
                  {x.slug}
                </Link>
                <div className="text-sm font-bold">{x._count._all}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="text-lg font-extrabold">Top شهرها</div>
          <div className="mt-4 grid gap-2">
            {topCity.map((x) => (
              <div key={x.city || "-"} className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div className="text-sm font-semibold">{x.city}</div>
                <div className="text-sm font-bold">{x._count._all}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
