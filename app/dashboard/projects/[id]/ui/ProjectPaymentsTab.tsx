import { prisma } from "@/lib/db";

export default async function ProjectPaymentsTab({ projectId }: { projectId: number }) {
  const payments = await prisma.treasuryPayment.findMany({
    where: { projectId },
    orderBy: { date: "desc" },
    include: { party: true },
  });

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-extrabold">Payments</div>

        <div className="flex flex-wrap gap-2">
          {/* ✅ دکمه ثبت پرداخت: می‌بریم خزانه‌داری با projectId */}
          <a
            href={`/dashboard/treasury?projectId=${projectId}&new=payment`}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            ثبت پرداخت / دریافت
          </a>

          <a
            href={`/dashboard/treasury?projectId=${projectId}`}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
          >
            مشاهده در خزانه‌داری
          </a>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
          پرداختی یا دریافتی برای این پروژه ثبت نشده است.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-zinc-500">
              <tr>
                <th className="py-2 text-right">نوع</th>
                <th className="py-2 text-right">روش</th>
                <th className="py-2 text-right">مبلغ</th>
                <th className="py-2 text-right">طرف حساب</th>
                <th className="py-2 text-right">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3">{p.direction}</td>
                  <td className="py-3">{p.method}</td>
                  <td className="py-3">{p.amount.toLocaleString("fa-IR")}</td>
                  <td className="py-3">{p.party?.name ?? "—"}</td>
                  <td className="py-3">
                    {new Date(p.date).toLocaleDateString("fa-IR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
