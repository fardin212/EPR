// app/api/projects/[id]/contracts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================== Utils ===================== */

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function toNumber(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

/** قفل/باز کردن پروژه بر اساس DONE شدن همه پیمانکارها */
async function syncProjectLock(projectId: number, companyId: number) {
  const total = await prisma.projectContractor.count({
    where: { projectId, companyId },
  });

  const notDone = await prisma.projectContractor.count({
    where: {
      projectId,
      companyId,
      status: { not: "DONE" },
    },
  });

  // اگر هیچ پیمانکاری ثبت نشده، پروژه را خودکار قفل/باز نکن
  if (total === 0) return;

  const project = await prisma.project.findFirst({
    where: { id: projectId, companyId, deletedAt: null, isDeleted: false },
    select: { id: true, status: true, endDate: true },
  });
  if (!project) return;

  // STOPPED را دست نزن
  if (project.status === "STOPPED") return;

  if (notDone === 0) {
    // همه DONE → قفل پروژه (COMPLETED)
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "COMPLETED",
        endDate: project.endDate ?? new Date(),
      },
    });
  } else {
    // حداقل یکی DONE نیست → باز (IN_PROGRESS) (اگر قبلاً COMPLETED شده بود)
    if (project.status === "COMPLETED") {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "IN_PROGRESS" },
      });
    }
  }
}

/* ===================== GET ===================== */
/**
 * خروجی:
 * {
 *   contracts: [{ id, contractor:{id,name}, totalAmount, paidAmount, remainingAmount, status }],
 *   summary: { totalAmount, paidAmount, remainingAmount, statusCounts }
 * }
 */
export async function GET(req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    const companyId =
      Number((me as any)?.companyId) ||
      Number((me as any)?.company?.id) ||
      Number((me as any)?.user?.companyId) ||
      Number((me as any)?.user?.company?.id);

    if (!companyId) {
      return NextResponse.json({ error: "عدم دسترسی شرکت" }, { status: 401 });
    }

    const { id } = await getParams(ctx);
    const projectId = mustInt(id, "شناسه پروژه");

    // قراردادهای پیمانکار
    const pcs = await prisma.projectContractor.findMany({
      where: { projectId, companyId },
      select: {
        id: true,
        agreedAmount: true,
        status: true,
        contractor: {
          select: {
            id: true,
            partyId: true,
			party: { select: { name: true } },
            // اگر ContractorProfile فیلد partyId دارد، این را هم select کن:
            // partyId: true,
          } as any,
        },
      },
      orderBy: { id: "desc" },
    });

    // اگر contractor.partyId داری:
    const partyIds: number[] = [];
    for (const x of pcs as any[]) {
      const pid = Number(x?.contractor?.partyId);
      if (pid) partyIds.push(pid);
    }

    const paidMap = new Map<number, number>();

    if (partyIds.length > 0) {
      const groups = await prisma.treasuryPayment.groupBy({
        by: ["partyId"],
        where: {
          companyId,
          projectId,
          direction: "OUT",
          partyId: { in: partyIds },
        },
        _sum: { amount: true },
      });

      for (const g of groups) {
        const pid = Number(g.partyId);
        const sum = Number((g as any)._sum?.amount ?? 0);
        if (pid) paidMap.set(pid, sum);
      }
    }

    const contracts = (pcs as any[]).map((x) => {
      const total = Number(x.agreedAmount ?? 0);
      const pid = Number(x?.contractor?.partyId) || 0;
      const paid = pid ? Number(paidMap.get(pid) ?? 0) : 0;
      const remaining = Math.max(0, total - paid);

      const payStatus: "PAID" | "PARTIAL" | "UNPAID" =
        paid <= 0 ? "UNPAID" : paid < total ? "PARTIAL" : "PAID";

      return {
        id: x.id,
        contractor: { id: x.contractor.id, name: x.contractor.party?.name || `#${x.contractor.id}` },
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,
        status: payStatus,
        contractStatus: x.status, // ACTIVE/DONE/CANCELLED
      };
    });

    const summary = {
      totalAmount: contracts.reduce((s, c) => s + c.totalAmount, 0),
      paidAmount: contracts.reduce((s, c) => s + c.paidAmount, 0),
      remainingAmount: contracts.reduce((s, c) => s + c.remainingAmount, 0),
      statusCounts: {
        PAID: contracts.filter((c) => c.status === "PAID").length,
        PARTIAL: contracts.filter((c) => c.status === "PARTIAL").length,
        UNPAID: contracts.filter((c) => c.status === "UNPAID").length,
      },
    };

    return NextResponse.json({ contracts, summary });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "خطا" },
      { status: 400 }
    );
  }
}

/* ===================== POST ===================== */
/**
 * body: { contractorId, agreedAmount, role?, note?, startDate?, endDate? }
 */
export async function POST(req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    const companyId =
      Number((me as any)?.companyId) ||
      Number((me as any)?.company?.id) ||
      Number((me as any)?.user?.companyId) ||
      Number((me as any)?.user?.company?.id);

    if (!companyId) {
      return NextResponse.json({ error: "عدم دسترسی شرکت" }, { status: 401 });
    }

    const { id } = await getParams(ctx);
    const projectId = mustInt(id, "شناسه پروژه");

    const body = await req.json().catch(() => ({}));
    const contractorId = mustInt(body.contractorId, "پیمانکار");
    const agreedAmount = toNumber(body.agreedAmount, 0);

    const created = await prisma.projectContractor.create({
      data: {
        companyId,
        projectId,
        contractorId,
        agreedAmount,
        role: body.role || null,
        note: body.note || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "ACTIVE",
      },
      select: { id: true },
    });

    await syncProjectLock(projectId, companyId);

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    const msg = e?.message || "خطا";
    // unique constraint (projectId, contractorId)
    if (msg.toLowerCase().includes("unique") || msg.includes("P2002")) {
      return NextResponse.json(
        { error: "این پیمانکار قبلاً برای این پروژه ثبت شده است." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/* ===================== PATCH ===================== */
/**
 * body: { id, agreedAmount?, role?, note?, startDate?, endDate?, status? }
 */
export async function PATCH(req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    const companyId =
      Number((me as any)?.companyId) ||
      Number((me as any)?.company?.id) ||
      Number((me as any)?.user?.companyId) ||
      Number((me as any)?.user?.company?.id);

    if (!companyId) {
      return NextResponse.json({ error: "عدم دسترسی شرکت" }, { status: 401 });
    }

    const { id } = await getParams(ctx);
    const projectId = mustInt(id, "شناسه پروژه");

    const body = await req.json().catch(() => ({}));
    const pcId = mustInt(body.id, "شناسه قرارداد");

    await prisma.projectContractor.update({
      where: { id: pcId },
      data: {
        agreedAmount:
          body.agreedAmount !== undefined ? toNumber(body.agreedAmount, 0) : undefined,
        role: body.role !== undefined ? (body.role || null) : undefined,
        note: body.note !== undefined ? (body.note || null) : undefined,
        startDate:
          body.startDate !== undefined
            ? (body.startDate ? new Date(body.startDate) : null)
            : undefined,
        endDate:
          body.endDate !== undefined
            ? (body.endDate ? new Date(body.endDate) : null)
            : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
    });

    await syncProjectLock(projectId, companyId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "خطا" },
      { status: 400 }
    );
  }
}

/* ===================== DELETE ===================== */
/**
 * body: { id }
 */
export async function DELETE(req: Request, ctx: any) {
  try {
    const me = await getMeServer();
    const companyId =
      Number((me as any)?.companyId) ||
      Number((me as any)?.company?.id) ||
      Number((me as any)?.user?.companyId) ||
      Number((me as any)?.user?.company?.id);

    if (!companyId) {
      return NextResponse.json({ error: "عدم دسترسی شرکت" }, { status: 401 });
    }

    const { id } = await getParams(ctx);
    const projectId = mustInt(id, "شناسه پروژه");

    const body = await req.json().catch(() => ({}));
    const pcId = mustInt(body.id, "شناسه قرارداد");

    await prisma.projectContractor.delete({ where: { id: pcId } });

    await syncProjectLock(projectId, companyId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "خطا" },
      { status: 400 }
    );
  }
}
