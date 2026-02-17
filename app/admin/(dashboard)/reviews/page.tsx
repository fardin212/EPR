import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { deleteReview, setReviewStatus } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "در انتظار تایید",
  approved: "تایید شده",
  rejected: "رد شده",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

function toInt(v: string | string[] | undefined, def = 1) {
  const s = Array.isArray(v) ? v[0] : v;
  const n = parseInt(String(s ?? def), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams?: { status?: string; page?: string };
}) {
  await requireAdmin();

  const status = (searchParams?.status ?? "pending") as
    | "pending"
    | "approved"
    | "rejected";

  const page = toInt(searchParams?.page, 1);
  const take = 20;
  const skip = (page - 1) * take;

  const [rows, total] = await Promise.all([
    prisma.siteReview.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        name: true,
        rating: true,
        tag: true,
        body: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.siteReview.count({ where: { status } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));

  const tabs: Array<{ key: "pending" | "approved" | "rejected"; title: string }> =
    [
      { key: "pending", title: "در انتظار" },
      { key: "approved", title: "تایید شده" },
      { key: "rejected", title: "رد شده" },
    ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900">
            مدیریت نظرات سایت
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            نظرات جدید به‌صورت پیش‌فرض «در انتظار تایید» هستند تا اسپم وارد سایت نشود.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            وضعیت فعلی:{" "}
            <span className="font-semibold text-slate-700">
              {STATUS_LABEL[status]}
            </span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.key === status;
          return (
            <Link
              key={t.key}
              href={`/admin/reviews?status=${t.key}`}
              className={
                "px-4 py-2 rounded-xl border text-sm font-semibold transition " +
                (active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
              }
            >
              {t.title}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-right">
                <th className="p-3 font-bold text-slate-700 w-[70px]">ID</th>
                <th className="p-3 font-bold text-slate-700 w-[160px]">نام</th>
                <th className="p-3 font-bold text-slate-700 w-[120px]">برچسب</th>
                <th className="p-3 font-bold text-slate-700 w-[80px]">امتیاز</th>
                <th className="p-3 font-bold text-slate-700">متن نظر</th>
                <th className="p-3 font-bold text-slate-700 w-[160px]">تاریخ</th>
                <th className="p-3 font-bold text-slate-700 w-[220px]">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-slate-600 text-center"
                  >
                    موردی برای نمایش وجود ندارد.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="p-3 text-slate-700">{r.id}</td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <span
                        className={
                          "inline-flex mt-1 text-xs px-2 py-1 rounded-full border " +
                          (STATUS_BADGE[r.status] ?? "bg-slate-50 border-slate-200 text-slate-600")
                        }
                      >
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>

                    <td className="p-3 text-slate-700">
                      {r.tag ? (
                        <span className="inline-flex text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                          {r.tag}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="p-3 text-slate-700">{r.rating}/5</td>

                    <td className="p-3 text-slate-700">
                      <div className="max-w-[520px] line-clamp-3 leading-6">
                        {r.body}
                      </div>
                    </td>

                    <td className="p-3 text-slate-600">
                      {new Date(r.createdAt).toLocaleString("fa-IR")}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {/* Approve */}
                        <form
                          action={async () => {
                            "use server";
                            await setReviewStatus(r.id, "approved");
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            تایید
                          </button>
                        </form>

                        {/* Reject */}
                        <form
                          action={async () => {
                            "use server";
                            await setReviewStatus(r.id, "rejected");
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-2 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          >
                            رد
                          </button>
                        </form>

                        {/* Pending */}
                        <form
                          action={async () => {
                            "use server";
                            await setReviewStatus(r.id, "pending");
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-2 rounded-xl text-xs font-bold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          >
                            برگردان به انتظار
                          </button>
                        </form>

                        {/* Delete */}
                        <form
                          action={async () => {
                            "use server";
                            await deleteReview(r.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          >
                            حذف
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 text-sm text-slate-600">
          <div>
            {total} مورد • صفحه {page} از {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/reviews?status=${status}&page=${Math.max(1, page - 1)}`}
              className={
                "px-3 py-2 rounded-xl border " +
                (page <= 1
                  ? "pointer-events-none opacity-50 bg-slate-50 border-slate-200"
                  : "bg-white border-slate-200 hover:bg-slate-50")
              }
            >
              قبلی
            </Link>

            <Link
              href={`/admin/reviews?status=${status}&page=${Math.min(totalPages, page + 1)}`}
              className={
                "px-3 py-2 rounded-xl border " +
                (page >= totalPages
                  ? "pointer-events-none opacity-50 bg-slate-50 border-slate-200"
                  : "bg-white border-slate-200 hover:bg-slate-50")
              }
            >
              بعدی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
