import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const cls = {
  wrap: "max-w-6xl mx-auto px-4 py-6 text-[color:var(--text)]",
  title: "text-xl font-semibold mb-1",
  subtitle: "text-xs text-[color:var(--muted)] mb-4",
  card: "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 mb-4",
  primaryBtn:
    "inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-5 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-soft)] transition",
  linkBtn:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-[11px] text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]",
};

const jalali = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "short",
});

export default async function StockTakingListPage() {
  const sessions = await prisma.stockTakingSession.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: { select: { items: true } },
    } as any,
  });

  return (
    <div className={cls.wrap} dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className={cls.title}>جلسه‌های انبارگردانی</h1>
          <p className={cls.subtitle}>
            مدیریت دوره‌های انبارگردانی، مشاهده وضعیت و دسترسی به گزارش اختلاف موجودی.
          </p>
        </div>

        <a href="/dashboard/inventory/stocktaking/new" className={cls.primaryBtn}>
          + شروع انبارگردانی جدید
        </a>
      </div>

      <div className={cls.card}>
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="px-3 py-2 text-right text-[10px] text-[color:var(--muted)] border-b border-[color:var(--line)]">
                عنوان جلسه
              </th>
              <th className="px-3 py-2 text-right text-[10px] text-[color:var(--muted)] border-b border-[color:var(--line)]">
                تاریخ
              </th>
              <th className="px-3 py-2 text-right text-[10px] text-[color:var(--muted)] border-b border-[color:var(--line)]">
                وضعیت
              </th>
              <th className="px-3 py-2 text-right text-[10px] text-[color:var(--muted)] border-b border-[color:var(--line)]">
                تعداد اقلام
              </th>
              <th className="px-3 py-2 text-right text-[10px] text-[color:var(--muted)] border-b border-[color:var(--line)]">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-2 border-b border-[color:var(--line-soft)]">
                  <div className="flex flex-col">
                    <span className="font-medium text-[13px]">{s.title}</span>
                    <span className="text-[10px] text-[color:var(--muted)]">
                      #{s.id}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 border-b border-[color:var(--line-soft)]">
                  <div className="flex flex-col text-[11px]">
                    <span>{jalali.format(s.date as any)}</span>
                    <span className="text-[10px] text-[color:var(--muted)]">
                      {s.date.toISOString().slice(0, 10)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 border-b border-[color:var(--line-soft)]">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                      s.status === "CLOSED"
                        ? "bg-emerald-500/10 text-emerald-200"
                        : "bg-amber-500/10 text-amber-100"
                    }`}
                  >
                    {s.status === "CLOSED" ? "بسته‌شده" : "باز"}
                  </span>
                </td>
                <td className="px-3 py-2 border-b border-[color:var(--line-soft)]">
                  {((s as any)._count?.items as number) ?? 0}
                </td>
                <td className="px-3 py-2 border-b border-[color:var(--line-soft)]">
                  <div className="flex gap-2">
                    <a
                      href={`/dashboard/inventory/stocktaking/${s.id}`}
                      className={cls.linkBtn}
                    >
                      ثبت شمارش / گزارش
                    </a>
                  </div>
                </td>
              </tr>
            ))}

            {sessions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-[12px] text-[color:var(--muted)]"
                >
                  هنوز جلسه‌ای برای انبارگردانی ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
