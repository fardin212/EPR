// app/api/management/contractors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickCompanyId(user: any) {
  return (
    Number(user?.companyId) ||
    Number(user?.company?.id) ||
    Number(user?.user?.companyId) ||
    Number(user?.user?.company?.id)
  );
}

export async function GET(req: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const companyId = pickCompanyId(me);
    if (!companyId) return NextResponse.json({ message: "companyId نامعتبر است." }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") || "").toLowerCase();

    // لیست پروفایل پیمانکارها + party
    const profiles = await prisma.contractorProfile.findMany({
      where: { companyId },
      select: {
        id: true,
        partyId: true,
        party: { select: { name: true } },
      },
      orderBy: [{ id: "desc" }],
    });

    // ✅ حالت مخصوص dropdown
    if (mode === "select") {
      const selectRows = profiles.map((p) => ({
        id: Number(p.id), // contractorProfileId
        partyId: Number(p.partyId),
        name: p.party?.name || `#${p.id}`,
      }));
      return NextResponse.json(selectRows);
    }

    // ---------- گزارش کامل ----------

    // مجموع قراردادها و تعداد پروژه‌های پیمانکار
    const groupedContracts = await prisma.projectContractor.groupBy({
      by: ["contractorId"],
      where: { companyId },
      _sum: { agreedAmount: true },
      _count: { projectId: true },
    });

    const totalByContractor = new Map<number, number>();
    const projectsCountByContractor = new Map<number, number>();
    const contractorIds = new Set<number>();
    const allProjectIds = new Set<number>();

    for (const g of groupedContracts) {
      const contractorId = Number(g.contractorId);
      contractorIds.add(contractorId);
      totalByContractor.set(contractorId, Number((g as any)._sum?.agreedAmount ?? 0));
      projectsCountByContractor.set(contractorId, Number((g as any)._count?.projectId ?? 0));
    }

    // برای گرفتن projectIdها (برای پرداخت‌ها) باید projectContractorها رو هم بخونیم
    if (contractorIds.size) {
      const pcs = await prisma.projectContractor.findMany({
        where: { companyId, contractorId: { in: Array.from(contractorIds) } },
        select: { projectId: true },
      });
      for (const pc of pcs) allProjectIds.add(Number(pc.projectId));
    }

    // مپ contractorId -> partyId / name
    const partyByContractor = new Map<number, number>();
    const contractorName = new Map<number, string>();
    for (const p of profiles) {
      const cid = Number(p.id);
      partyByContractor.set(cid, Number(p.partyId));
      contractorName.set(cid, p.party?.name || `#${p.id}`);
    }

    const partyIds = Array.from(new Set(Array.from(partyByContractor.values()).filter(Boolean)));
    const projectIds = Array.from(allProjectIds);

    // پرداختی‌های مرتبط با پروژه‌ها (OUT) گروه‌بندی بر اساس partyId
    const paidMap = new Map<number, number>(); // partyId => sum paid
    if (partyIds.length && projectIds.length) {
      const groups = await prisma.treasuryPayment.groupBy({
        by: ["partyId"],
        where: {
          companyId,
          direction: "OUT",
          partyId: { in: partyIds },
          projectId: { in: projectIds },
        },
        _sum: { amount: true },
      });

      for (const g of groups) {
        const pid = Number(g.partyId);
        const paid = Number((g as any)._sum?.amount ?? 0);
        if (pid) paidMap.set(pid, paid);
      }
    }

    // ساخت خروجی نهایی: فقط پیمانکارهایی که در contractorProfile هستند
    const result = profiles.map((p) => {
      const contractorId = Number(p.id);
      const partyId = Number(p.partyId);

      const total = Number(totalByContractor.get(contractorId) ?? 0);
      const projectCount = Number(projectsCountByContractor.get(contractorId) ?? 0);
      const paid = Number(paidMap.get(partyId) ?? 0);
      const remaining = Math.max(0, total - paid);

      // سطح هشدار ساده و کاربردی
      const level =
        remaining <= 0 ? "OK" : paid > 0 ? "WARNING" : "CRITICAL";

      return {
        id: contractorId,
        partyId,
        name: contractorName.get(contractorId) || `#${contractorId}`,

        projectsCount: projectCount,
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,

        level,
      };
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "خطای سرور" },
      { status: 500 }
    );
  }
}
