import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getMeServer();
  const companyId = me.companyId;

  const models = await prisma.containerModel.findMany({
    where: { companyId },
    orderBy: [{ id: "asc" }],
    select: { id: true, title: true },
  });

  return Response.json(
    models.map((m) => ({
      id: m.id,
      name: m.title, // برای اینکه UI ساده بماند
    }))
  );
}
