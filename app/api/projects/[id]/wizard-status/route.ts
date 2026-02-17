// app/api/projects/[id]/wizard-status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  try {
    const me = await getMeServer();
    const companyId = me.companyId;
    const projectId = Number(ctx.params.id);

    if (!projectId) {
      return NextResponse.json({ error: "projectId نامعتبر است" }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
      select: { id: true, partyId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "پروژه پیدا نشد" }, { status: 404 });
    }

    const invoiceCount = await prisma.invoice.count({
      where: {
        companyId,
        projectId,
        deletedAt: null,
      },
    });

    const receiveSum = await prisma.treasuryPayment.aggregate({
      where: {
        companyId,
        projectId,
        direction: "IN",
      },
      _sum: { amount: true },
    });

    const purchaseCount = await prisma.accountingVoucher.count({
      where: {
        companyId,
        projectId,
        type: "PURCHASE",
      },
    });

    return NextResponse.json({
      steps: {
        customer: !!project.partyId,
        project: true,
        invoice: invoiceCount > 0,
        receive: Number(receiveSum._sum.amount || 0) > 0,
        purchase: purchaseCount > 0,
        report: true,
      },
      meta: {
        invoiceCount,
        receiveAmount: Number(receiveSum._sum.amount || 0),
        purchaseCount,
      },
    });
  } catch (e: any) {
    console.error("wizard-status error:", e);
    return NextResponse.json(
      { error: e?.message || "خطا در وضعیت ویزارد پروژه" },
      { status: 500 }
    );
  }
}
