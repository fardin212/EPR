import { prisma } from "@/lib/db";
import BomClient from "./ui/BomClient";

export const dynamic = "force-dynamic";

export default async function EstimateBomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Next.js 16: params is a Promise
  const { id } = await params;

  const estimateId = Number(id);
  if (!Number.isFinite(estimateId) || estimateId <= 0) {
    throw new Error(
      `شناسه پیش‌فاکتور نامعتبر است. آدرس باید مثل /dashboard/container-estimates/123/bom باشد (id=${id})`
    );
  }

  const materials = await prisma.material.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      unit: true,
      unitPrice: true,
      priceBasis: true,
      kgPerPiece: true,
      kgPerBranch: true,
    },
  });

  const bom = await prisma.containerEstimateBom.findFirst({
    where: { estimateId },
    include: {
      estimate: { select: { id: true, customerName: true, customerPhone: true } },
      lines: { orderBy: { id: "asc" }, include: { material: true } },
    },
  });

  return (
    <BomClient
      estimateId={estimateId}
      initialBom={
        bom
          ? {
              id: bom.id,
              status: bom.status,
              finalizedAt: bom.finalizedAt ? bom.finalizedAt.toISOString() : null,
              estimate: bom.estimate,
              lines: bom.lines.map((l) => ({
                id: l.id,
                materialId: l.materialId,
                qty: Number(l.qty),
                qtyUnit: (l.qtyUnit as any) ?? null,
                qtyUnitCustom: l.qtyUnitCustom,
                unitPrice: Number(l.unitPrice ?? 0),
                lineTotal: Number(l.lineTotal ?? 0),
                note: l.note,
                materialName: l.material?.name ?? "",
              })),
            }
          : null
      }
      materials={materials.map((m) => ({
        ...m,
        unitPrice: Number(m.unitPrice ?? 0),
        kgPerPiece: m.kgPerPiece == null ? null : Number(m.kgPerPiece),
        kgPerBranch: m.kgPerBranch == null ? null : Number(m.kgPerBranch),
      }))}
    />
  );
}
