import Link from "next/link";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const dynamic = "force-dynamic";

function faMoney(v: any) {
  return Number(v ?? 0).toLocaleString("fa-IR");
}
function faDateTime(v: any) {
  try {
    return new Date(v).toLocaleString("fa-IR");
  } catch {
    return "—";
  }
}

export default async function MaterialHistoryPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const me = await getMeServer();
  const companyId = me.companyId;

  // ✅ Next 16: params ممکن است Promise باشد
  const params = await Promise.resolve(props.params);
  const id = Number(params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-white p-4">
          <div className="font-semibold">آی‌دی نامعتبر</div>
          <div className="text-sm text-gray-500 mt-1">لینک تاریخچه درست نیست.</div>
          <Link href="/dashboard/materials" className="mt-3 inline-block text-blue-600">
            برگشت به مصالح
          </Link>
        </div>
      </div>
    );
  }

  const material = await prisma.material.findFirst({
    where: { id, companyId },
    select: { id: true, name: true, unit: true, unitPrice: true, category: true },
  });

  if (!material) {
    return (
      <div className="p-6">
        <div className="rounded-lg border bg-white p-4">
          <div className="font-semibold">مصالح یافت نشد</div>
          <div className="text-sm text-gray-500 mt-1">
            یا وجود ندارد، یا متعلق به شرکت شما نیست.
          </div>
          <Link href="/dashboard/materials" className="mt-3 inline-block text-blue-600">
            برگشت به مصالح
          </Link>
        </div>
      </div>
    );
  }

  const history = await prisma.materialPriceHistory.findMany({
    where: { companyId, materialId: id },
    orderBy: { changedAt: "desc" },
    take: 300,
    select: { id: true, price: true, changedAt: true, note: true },
  });

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">تاریخچه قیمت: {material.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            قیمت فعلی:{" "}
            <span className="font-semibold">{faMoney(material.unitPrice)}</span> تومان — واحد:{" "}
            {material.unit}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/materials"
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            ← برگشت
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-right">
              <th className="px-4 py-3 font-semibold">ردیف</th>
              <th className="px-4 py-3 font-semibold">قیمت (تومان)</th>
              <th className="px-4 py-3 font-semibold">زمان تغییر</th>
              <th className="px-4 py-3 font-semibold">یادداشت</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                  هنوز تاریخچه‌ای ثبت نشده است.
                </td>
              </tr>
            ) : (
              history.map((h, idx) => (
                <tr key={h.id} className="border-t">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{faMoney(h.price)}</td>
                  <td className="px-4 py-3">{faDateTime(h.changedAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{h.note || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
