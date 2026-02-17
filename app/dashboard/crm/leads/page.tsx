import { toJalali } from "@/lib/date";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.crmLead.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusLabel: Record<string, string> = {
    NEW: "جدید",
    IN_PROGRESS: "در حال پیگیری",
    WON: "تبدیل به مشتری",
    LOST: "از دست رفته",
  };

  return (
    <div className="p-4 sm:p-6 space-y-5" dir="rtl">
      <section className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">CRM / سرنخ‌ها</p>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 mt-1">
            سرنخ‌ها
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            لیست سرنخ‌های ورودی از وب‌سایت، تماس‌ها و شبکه‌های اجتماعی.
          </p>
        </div>

        <Link
          href="/dashboard/crm/leads/new"
          className="rounded-xl bg-indigo-600 text-white text-xs px-4 py-2 shadow-sm hover:bg-indigo-700"
        >
          + سرنخ جدید
        </Link>
      </section>

      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full text-[12px] text-right">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">نام</th>
              <th className="px-3 py-2 font-medium">تماس</th>
              <th className="px-3 py-2 font-medium">منبع</th>
              <th className="px-3 py-2 font-medium">وضعیت</th>
              <th className="px-3 py-2 font-medium">ایجاد</th>
              <th className="px-3 py-2 font-medium text-center">جزئیات</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l, i) => (
              <tr
                key={l.id}
                className={`border-b border-slate-100 ${
                  i % 2 === 1 ? "bg-slate-50/50" : ""
                }`}
              >
                <td className="px-3 py-2 text-slate-800">{l.name}</td>
                <td className="px-3 py-2 text-slate-700">
                  {l.phone || "—"}
                  {l.email && (
                    <span className="text-[10px] text-slate-400 block">
                      {l.email}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-700">
                  {l.source || "نامشخص"}
                </td>
                <td className="px-3 py-2">
                  <LeadStatusBadge status={l.status} />
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {toJalali(l.createdAt)}
                </td>
                <td className="px-3 py-2 text-center">
                  <Link
                    href={`/dashboard/crm/leads/${l.id}`}
                    className="inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 text-[11px] hover:bg-slate-800"
                  >
                    مشاهده
                  </Link>
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-[12px] text-slate-500"
                >
                  هنوز هیچ سرنخی ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const key = status?.toUpperCase?.() || "NEW";
  const map: Record<string, { label: string; classes: string }> = {
    NEW: {
      label: "جدید",
      classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    IN_PROGRESS: {
      label: "در حال پیگیری",
      classes: "bg-amber-50 text-amber-700 border-amber-200",
    },
    WON: {
      label: "تبدیل به مشتری",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    LOST: {
      label: "از دست رفته",
      classes: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };
  const cfg = map[key] ?? map.NEW;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}
