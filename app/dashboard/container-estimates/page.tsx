import Link from "next/link";
import { prisma } from "@/lib/db";
import FilterBar from "./ui/FilterBar";
import DeleteEstimateButton from "./DeleteEstimateButton";

export const dynamic = "force-dynamic";

function faMoneyBig(v: bigint | number | null | undefined) {
  if (v == null) return "0";
  const n = typeof v === "bigint" ? Number(v) : Number(v);
  return (Number.isFinite(n) ? n : 0).toLocaleString("fa-IR");
}

function faDate(v: any) {
  try {
    return new Date(v).toLocaleDateString("fa-IR");
  } catch {
    return "—";
  }
}

function numOrNull(v: string | undefined) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseDateStart(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateEnd(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ContainerEstimatesPage({
  searchParams,
}: {
  // ✅ Next.js 16: searchParams is Promise
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const modelId = typeof sp.modelId === "string" ? numOrNull(sp.modelId) : null;

  const from = typeof sp.from === "string" ? parseDateStart(sp.from) : null;
  const to = typeof sp.to === "string" ? parseDateEnd(sp.to) : null;

  const minFinal = typeof sp.minFinal === "string" ? numOrNull(sp.minFinal) : null;
  const maxFinal = typeof sp.maxFinal === "string" ? numOrNull(sp.maxFinal) : null;

  // فقط برای dropdown مدل‌ها
  const models = await prisma.containerModel.findMany({
    orderBy: { id: "desc" },
    take: 200,
    select: { id: true, title: true },
  });

  // FilterBar قبلی parties می‌خواست؛ اینجا خالی می‌دیم که صفحه نشکنه
  const parties: { id: number; name: string }[] = [];

  // Build where for ContainerEstimate
  const where: any = { AND: [] as any[] };

  if (modelId) where.AND.push({ containerModelId: modelId });

  if (from || to) {
    where.AND.push({
      createdAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    });
  }

  // finalPrice در ContainerEstimate از نوع BigInt است
  if (minFinal !== null || maxFinal !== null) {
    where.AND.push({
      finalPrice: {
        ...(minFinal !== null ? { gte: BigInt(minFinal) } : {}),
        ...(maxFinal !== null ? { lte: BigInt(maxFinal) } : {}),
      },
    });
  }

  if (q) {
    const qNum = Number(q);
    where.AND.push({
      OR: [
        ...(Number.isFinite(qNum) ? [{ id: qNum }] : []),
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { containerModel: { title: { contains: q } } },
      ],
    });
  }

  if (where.AND.length === 0) delete where.AND;

  const estimates = await prisma.containerEstimate.findMany({
    where,
    orderBy: { id: "desc" },
    take: 200,
    include: {
      containerModel: { select: { id: true, title: true } },
      sizePreset: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">پیش‌فاکتورهای کانکس</h1>
          <p className="text-sm text-gray-500 mt-1">لیست پیش‌فاکتورهای مشتری (ContainerEstimate)</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/container-estimates/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + ایجاد پیش‌فاکتور جدید
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5">
        <FilterBar
          parties={parties}
          models={models}
          initial={{
            q,
            partyId: "", // در ContainerEstimate نداریم
            modelId: modelId ? String(modelId) : "",
            from: typeof sp.from === "string" ? sp.from : "",
            to: typeof sp.to === "string" ? sp.to : "",
            minFinal: typeof sp.minFinal === "string" ? sp.minFinal : "",
            maxFinal: typeof sp.maxFinal === "string" ? sp.maxFinal : "",
            minBase: "", // در ContainerEstimate نداریم
            maxBase: "", // در ContainerEstimate نداریم
          }}
          count={estimates.length}
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-right">
              <th className="px-4 py-3 font-semibold">شماره</th>
              <th className="px-4 py-3 font-semibold">تاریخ</th>
              <th className="px-4 py-3 font-semibold">مشتری</th>
              <th className="px-4 py-3 font-semibold">تماس</th>
              <th className="px-4 py-3 font-semibold">مدل</th>
              <th className="px-4 py-3 font-semibold">سایز</th>
              <th className="px-4 py-3 font-semibold">ابعاد</th>
              <th className="px-4 py-3 font-semibold">مبلغ نهایی</th>
              <th className="px-4 py-3 font-semibold">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {estimates.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={9}>
                  هنوز پیش‌فاکتوری ثبت نشده (یا فیلترها خیلی محدودند).
                </td>
              </tr>
            ) : (
              estimates.map((e) => {
                const dims = `${Number(e.length)}×${Number(e.width)}×${Number(e.height)}`;
                return (
                  <tr key={e.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{e.id}</td>
                    <td className="px-4 py-3">{faDate(e.createdAt)}</td>
                    <td className="px-4 py-3">{e.customerName}</td>
                    <td className="px-4 py-3">{e.customerPhone}</td>
                    <td className="px-4 py-3">{e.containerModel?.title ?? "—"}</td>
                    <td className="px-4 py-3">{e.sizePreset?.title ?? "—"}</td>
                    <td className="px-4 py-3">{dims}</td>
                    <td className="px-4 py-3 font-semibold">{faMoneyBig(e.finalPrice)} تومان</td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/container-estimates/${e.id}`}
                          className="rounded-lg border px-3 py-1 hover:bg-gray-50"
                        >
                          مشاهده
                        </Link>

                        <Link
                          href={`/dashboard/container-estimates/${e.id}/pdf`}
                          className="rounded-lg border px-3 py-1 hover:bg-gray-50"
                          target="_blank"
                        >
                          PDF
                        </Link>

                        <Link
                          href={`/dashboard/container-estimates/${e.id}/bom`}
                          className="rounded-lg border px-3 py-1 hover:bg-gray-50"
                        >
                          BOM
                        </Link>

                        {/* ✅ ویرایش */}
                        <Link
                          href={`/dashboard/container-estimates/${e.id}/edit`}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 hover:bg-amber-100 text-amber-700"
                        >
                          ویرایش
                        </Link>

                        {/* ✅ حذف */}
                        <DeleteEstimateButton id={e.id} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        نکته: این صفحه 200 رکورد آخر را نشان می‌دهد.
      </div>
    </div>
  );
}
