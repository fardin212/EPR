import Link from "next/link";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import EstimateEditForm from "./EstimateEditForm";

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

export default async function ContainerEstimateViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const editMode = String(sp.edit ?? "") === "1";

  const estimateId = Number(id);
  if (!Number.isFinite(estimateId)) {
    redirect("/dashboard/container-estimates");
  }

  const est = await prisma.containerEstimate.findUnique({
    where: { id: estimateId },
    include: {
      containerModel: { select: { title: true } },
      sizePreset: { select: { title: true } },
      displayItems: { orderBy: { sortOrder: "asc" } },
      extras: { orderBy: { id: "asc" } },
    },
  });

  if (!est) redirect("/dashboard/container-estimates");

  const dims = `${est.length}×${est.width}×${est.height}`;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">پیش‌فاکتور #{est.id}</h1>
          <p className="text-sm text-gray-500 mt-1">
            تاریخ: {faDate(est.createdAt)} | مدل: {est.containerModel?.title ?? "—"}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/dashboard/container-estimates"
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            لیست
          </Link>

          <Link
            href={`/dashboard/container-estimates/${est.id}/pdf`}
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            PDF
          </Link>

          <Link
            href={`/dashboard/container-estimates/${est.id}/bom`}
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            BOM
          </Link>

          {!editMode ? (
            <Link
              href={`/dashboard/container-estimates/${est.id}?edit=1`}
              className="rounded-lg border border-blue-500 text-blue-600 px-3 py-2 hover:bg-blue-50"
            >
              ویرایش
            </Link>
          ) : (
            <Link
              href={`/dashboard/container-estimates/${est.id}`}
              className="rounded-lg border border-gray-400 px-3 py-2 hover:bg-gray-50"
            >
              انصراف
            </Link>
          )}

          <Link
            href={`/dashboard/container-estimates/${est.id}/delete`}
            className="rounded-lg border border-red-500 text-red-600 px-3 py-2 hover:bg-red-50"
          >
            حذف
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      {editMode ? (
  <EstimateEditForm
    initial={{
      id: est.id,
      customerName: est.customerName,
      customerPhone: est.customerPhone,
      projectLocation: est.projectLocation,
      usageType: est.usageType,
      deliveryDays: est.deliveryDays,
      paymentTerms: est.paymentTerms,
      warrantyTerms: est.warrantyTerms,
      transportTerms: est.transportTerms,
      notesForCustomer: est.notesForCustomer,
      items: (est.displayItems ?? []).map((x) => ({
        title: x.title,
        amount: String(x.amount ?? "0"),
      })),
    }}
  />
) : (
  // همون View قبلی
  <>
    {/* ... */}
  </>
)}
    </div>
  );
}
