import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export async function GET() {
  const me = await getMeServer();
  const companyId = me.companyId;

  // فقط ادمین/مدیر می‌تونه Trash رو ببینه (اختیاری)
  if (me.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const rows = await prisma.invoice.findMany({
    where: { companyId, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    select: {
      id: true,
      docType: true,
      docNo: true,
      customerName: true,
      total: true,
      status: true,
      deletedAt: true,
    },
    take: 200,
  });

  return NextResponse.json(rows);
}
