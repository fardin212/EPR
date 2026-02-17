import { prisma } from "@/lib/db";
import MaterialsTable from "./ui/MaterialsTable";
import { getMeServer } from "@/lib/authMe";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const me = await getMeServer();
  const companyId = me.companyId;

  const rows = await prisma.material.findMany({
    where: { companyId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      unit: true,
      unitPrice: true,
      category: true,
      updatedAt: true,
      _count: { select: { priceHistory: true } },
    },
  });

  const materialsPlain = rows.map((m) => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    unitPrice: Number(m.unitPrice ?? 0),
    category: m.category,
    updatedAt: m.updatedAt.toISOString(),
    _count: { priceHistory: m._count.priceHistory },
  }));

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">مدیریت قیمت مصالح</h1>
          <p className="text-sm text-gray-500 mt-1">
            قیمت روز مصالح را اینجا به‌روزرسانی کن (فاکتور Snapshot می‌شود)
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="/dashboard/materials/daily/pdf"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            دانلود PDF لیست قیمت امروز
          </a>
        </div>
      </div>

      <div className="mt-5">
        <MaterialsTable companyId={companyId} materials={materialsPlain} />
      </div>
    </div>
  );
}
