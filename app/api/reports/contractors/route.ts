// app/api/reports/contractors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/reports/contractors
 *
 * Query:
 * - from=YYYY-MM-DD (optional)
 * - to=YYYY-MM-DD (optional)
 * - contractorId=number (optional)
 * - projectId=number (optional)
 * - alerts=1 (optional) -> فقط هشدارها
 * - limit=number (optional) -> محدودیت هشدارها (default 8)
 *
 * خروجی:
 * - summary
 * - contractors (تجمیعی)
 * - alerts (مانده نزدیک سررسید / گذشته از سررسید)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const contractorId = Number(searchParams.get("contractorId") || 0) || null;
    const projectId = Number(searchParams.get("projectId") || 0) || null;

    const alertsOnly = searchParams.get("alerts") === "1";
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 8) || 8, 1),
      50
    );

    const prismaAny = prisma as any;

    // -------------------------------------------
    // 1) خواندن قراردادها (ProjectContract)
    // فرض فیلدها:
    // - id, projectId, contractorPartyId, amount, startDate, endDate, note, createdAt
    // و رلیشن‌ها:
    // - project { id, title }
    // - contractorParty { id, name, mobile }
    // -------------------------------------------
    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (contractorId) where.contractorPartyId = contractorId;

    // بازه زمانی روی createdAt یا startDate (هرچی دارید)
    // اینجا روی createdAt فیلتر می‌کنیم تا گزارش مدیریتی قابل استفاده باشد
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const contracts = await prismaAny.projectContract.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        project: { select: { id: true, title: true } },
        contractorParty: { select: { id: true, name: true, mobile: true } },
      },
    });

    // -------------------------------------------
    // 2) جمع پرداخت‌ها برای هر قرارداد (TreasuryPayment)
    // فرض:
    // - TreasuryPayment: amount, contractId
    // اگر شما پرداخت را با contractId ندارید و با projectId/partyId لینک می‌کنید،
    // باید همین قسمت را مطابق ساختار خودتان تغییر دهید.
    // -------------------------------------------
    const contractIds = contracts.map((c: any) => c.id);

    let paidByContractId = new Map<number, number>();
    if (contractIds.length > 0) {
      const payments = await prismaAny.treasuryPayment.findMany({
        where: { contractId: { in: contractIds } },
        select: { contractId: true, amount: true },
      });

      for (const p of payments as any[]) {
        const id = Number(p.contractId);
        const prev = paidByContractId.get(id) || 0;
        paidByContractId.set(id, prev + Number(p.amount || 0));
      }
    }

    // -------------------------------------------
    // 3) ساخت ردیف‌ها + محاسبه مانده
    // -------------------------------------------
    const rows = contracts.map((c: any) => {
      const total = Number(c.amount || 0);
      const paid = Number(paidByContractId.get(Number(c.id)) || 0);
      const remaining = Math.max(total - paid, 0);

      const endDate = c.endDate ? new Date(c.endDate) : null;
      const now = new Date();
      const daysToDue =
        endDate && !Number.isNaN(endDate.getTime())
          ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

      let dueStatus: "OK" | "DUE_SOON" | "OVERDUE" | "NO_DUE" = "NO_DUE";
      if (!endDate) dueStatus = "NO_DUE";
      else if (remaining <= 0) dueStatus = "OK";
      else if (daysToDue !== null && daysToDue < 0) dueStatus = "OVERDUE";
      else if (daysToDue !== null && daysToDue <= 7) dueStatus = "DUE_SOON";
      else dueStatus = "OK";

      return {
        contractId: Number(c.id),
        project: c.project
          ? { id: Number(c.project.id), title: String(c.project.title || "") }
          : null,
        contractor: c.contractorParty
          ? {
              id: Number(c.contractorParty.id),
              name: String(c.contractorParty.name || ""),
              mobile: c.contractorParty.mobile ? String(c.contractorParty.mobile) : null,
            }
          : null,
        total,
        paid,
        remaining,
        startDate: c.startDate || null,
        endDate: c.endDate || null,
        note: c.note || null,
        dueStatus,
        daysToDue,
      };
    });

    // -------------------------------------------
    // 4) هشدارها (مانده > 0 و نزدیک سررسید یا گذشته)
    // -------------------------------------------
    const alerts = rows
      .filter((r) => r.remaining > 0 && (r.dueStatus === "OVERDUE" || r.dueStatus === "DUE_SOON"))
      .sort((a, b) => {
        // اول overdue، بعد dueSoon، سپس نزدیک‌ترها
        const rank = (s: string) => (s === "OVERDUE" ? 0 : s === "DUE_SOON" ? 1 : 2);
        const ra = rank(a.dueStatus);
        const rb = rank(b.dueStatus);
        if (ra !== rb) return ra - rb;
        const da = a.daysToDue ?? 999999;
        const db = b.daysToDue ?? 999999;
        return da - db;
      })
      .slice(0, limit);

    if (alertsOnly) {
      return NextResponse.json({
        alerts,
        meta: { count: alerts.length, limit },
      });
    }

    // -------------------------------------------
    // 5) تجمیع پیمانکاران
    // -------------------------------------------
    const byContractor = new Map<number, any>();

    for (const r of rows) {
      if (!r.contractor?.id) continue;
      const cid = r.contractor.id;
      const cur =
        byContractor.get(cid) ||
        ({
          contractor: r.contractor,
          contractsCount: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalRemaining: 0,
          projects: new Map<number, any>(),
        } as any);

      cur.contractsCount += 1;
      cur.totalAmount += r.total;
      cur.totalPaid += r.paid;
      cur.totalRemaining += r.remaining;

      if (r.project?.id) {
        const pid = r.project.id;
        const pcur =
          cur.projects.get(pid) ||
          ({
            projectId: pid,
            projectTitle: r.project.title,
            totalAmount: 0,
            totalPaid: 0,
            totalRemaining: 0,
            contracts: [],
          } as any);

        pcur.totalAmount += r.total;
        pcur.totalPaid += r.paid;
        pcur.totalRemaining += r.remaining;
        pcur.contracts.push(r);

        cur.projects.set(pid, pcur);
      }

      byContractor.set(cid, cur);
    }

    const contractors = Array.from(byContractor.values())
      .map((x: any) => ({
        contractor: x.contractor,
        contractsCount: x.contractsCount,
        totalAmount: x.totalAmount,
        totalPaid: x.totalPaid,
        totalRemaining: x.totalRemaining,
        projects: Array.from(x.projects.values()).sort(
          (a: any, b: any) => b.totalRemaining - a.totalRemaining
        ),
      }))
      .sort((a: any, b: any) => b.totalRemaining - a.totalRemaining);

    const summary = {
      contractorsCount: contractors.length,
      contractsCount: rows.length,
      totalAmount: contractors.reduce((s: number, c: any) => s + c.totalAmount, 0),
      totalPaid: contractors.reduce((s: number, c: any) => s + c.totalPaid, 0),
      totalRemaining: contractors.reduce((s: number, c: any) => s + c.totalRemaining, 0),
      alertsCount: alerts.length,
    };

    return NextResponse.json({
      summary,
      contractors,
      alerts,
    });
  } catch (e: any) {
    console.error("GET /api/reports/contractors error:", e);
    return NextResponse.json(
      { error: e?.message || "خطا در گزارش پیمانکاران" },
      { status: 500 }
    );
  }
}
