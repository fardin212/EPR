import { prisma } from "@/lib/db";

export default async function ProjectInvoicesTab({ projectId }: { projectId: number }) {
  const invoices = await prisma.invoice.findMany({
    where: { projectId, deletedAt: null },
    orderBy: { date: "desc" },
  });

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-extrabold">Invoices</div>

        <div className="flex flex-wrap gap-2">
          {/* ✅ دکمه ثبت فاکتور */}
          <a
            href={`/dashboard/invoices/new?projectId=${projectId}`}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            ثبت فاکتور
          </a>

          <a
            href={`/dashboard/invoices?projectId=${projectId}`}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
          >
            مشاهده همه
          </a>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
          فاکتوری برای این پروژه ثبت نشده است.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-zinc-500">
              <tr>
                <th className="py-2 text-right">شماره</th>
                <th className="py-2 text-right">وضعیت</th>
                <th className="py-2 text-right">مبلغ</th>
                <th className="py-2 text-right">تاریخ</th>
                <th className="py-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0">
                  <td className="py-3 font-bold">{inv.docNo}</td>
                  <td className="py-3">{inv.status}</td>
                  <td className="py-3">{inv.total.toLocaleString("fa-IR")}</td>
                  <td className="py-3">
                    {new Date(inv.date).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <a
                        className="rounded-lg border px-3 py-1 hover:bg-zinc-50"
                        href={`/dashboard/invoices/${inv.id}`}
                      >
                        مشاهده
                      </a>
                      <a
                        className="rounded-lg border px-3 py-1 hover:bg-zinc-50"
                        href={`/dashboard/invoices/${inv.id}/edit`}
                      >
                        ویرایش
                      </a>
                      <a
                        className="rounded-lg border px-3 py-1 hover:bg-zinc-50"
                        href={`/dashboard/invoices/${inv.id}/pdf`}
                      >
                        PDF
                      </a>
                    </div>
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
