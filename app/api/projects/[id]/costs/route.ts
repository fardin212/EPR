import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createProjectVoucher } from "@/lib/accounting";

function serializeVoucher(v: any) {
  if (!v) return null;
  return {
    ...v,
    totalDebit: Number(v.totalDebit),
    totalCredit: Number(v.totalCredit),
  };
}

// GET  /api/projects/:projectId/costs
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  const projectId = Number(params.projectId);
  if (Number.isNaN(projectId)) {
    return NextResponse.json(
      { message: "projectId نامعتبر است." },
      { status: 400 },
    );
  }

  const costs = await prisma.projectCost.findMany({
    where: { projectId },
    orderBy: { date: "desc" },
  });

  const serialized = costs.map((c) => ({
    ...c,
    amount: Number(c.amount),
  }));

  return NextResponse.json({ costs: serialized });
}

// POST  /api/projects/:projectId/costs
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const projectId = Number(params.projectId);
    if (Number.isNaN(projectId)) {
      return NextResponse.json(
        { message: "projectId نامعتبر است." },
        { status: 400 },
      );
    }

    const body = await req.json();
    const {
      companyId,
      amount,
      date,
      description,
      category,
      debitAccountId,
      creditAccountId,
      createdById,
    } = body;

    if (!companyId || !amount || !debitAccountId || !creditAccountId) {
      return NextResponse.json(
        {
          message:
            "companyId، amount، debitAccountId و creditAccountId الزامی هستند.",
        },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { message: "پروژه پیدا نشد." },
        { status: 404 },
      );
    }

    const costDate = date ? new Date(date) : new Date();
    const amountBig = BigInt(amount);

    // ۱) ساخت سند حسابداری مرتبط با پروژه
    const voucher = await createProjectVoucher({
      companyId,
      projectId,
      date: costDate,
      type: "PROJECT_COST",
      description: description ?? null,
      items: [
        {
          accountId: debitAccountId,
          debit: amountBig,
          note: description ?? null,
        },
        {
          accountId: creditAccountId,
          credit: amountBig,
          note: description ?? null,
        },
      ],
    });

    // ۲) ثبت رکورد هزینه پروژه
    const cost = await prisma.projectCost.create({
      data: {
        companyId,
        projectId,
        date: costDate,
        amount: amountBig,
        description: description ?? null,
        category: category ?? null,
        voucherId: voucher.id,
        createdById: createdById ?? null,
      },
    });

    return NextResponse.json(
      {
        cost: {
          ...cost,
          amount: Number(cost.amount),
        },
        voucher: serializeVoucher(voucher),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[projects/:id/costs] POST error", err);
    return NextResponse.json(
      { message: "خطای داخلی سرور." },
      { status: 500 },
    );
  }
}
