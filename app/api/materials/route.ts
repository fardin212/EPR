import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getMeServer();
  const companyId = me.companyId;

  const materials = await prisma.material.findMany({
    where: { companyId },
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

  // ✅ Plain objects برای کلاینت
  const plain = materials.map((m) => ({
    ...m,
    unitPrice: Number(m.unitPrice ?? 0),
    kgPerPiece: m.kgPerPiece == null ? null : Number(m.kgPerPiece),
    kgPerBranch: m.kgPerBranch == null ? null : Number(m.kgPerBranch),
  }));

  return Response.json(plain);
}
