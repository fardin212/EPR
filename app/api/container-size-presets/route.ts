import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getMeServer();
  const companyId = me.companyId;

  const sizes = await prisma.containerSizePreset.findMany({
    where: { companyId, isActive: true },
    orderBy: [{ sort: "asc" }, { id: "asc" }],
    select: {
      id: true,
      title: true,
      length: true,
      width: true,
      height: true,
      containerModelId: true,
    },
  });

  const plain = sizes.map((s) => ({
    id: s.id,
    title: s.title,
    length: Number(s.length),
    width: Number(s.width),
    height: s.height == null ? null : Number(s.height),
    containerModelId: s.containerModelId ?? null,
  }));

  return Response.json(plain);
}
