import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AccountingVoucherType, Prisma } from "@prisma/client";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isoToDate(s?: string, fallback: Date) {
  if (!s) return fallback;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export async function GET(req: NextRequest) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const { searchParams } = new URL(req.url);
  const groupBy = (searchParams.get("groupBy") || "project").toLowerCase();
  const from = isoToDate(searchParams.get("from") || undefined, new Date("2000-01-01"));
  const to = isoToDate(searchParams.get("to") || undefined, new Date("2100-01-01"));

  const where: Prisma.AccountingVoucherWhereInput = {
    companyId,
    type: AccountingVoucherType.PURCHASE,
    date: { gte: from, lte: to },
    freightAmount: { gt: new Prisma.Decimal(0) } as any,
  };

  if (groupBy === "warehouse") {
    const rows = await prisma.accountingVoucher.groupBy({
      by: ["warehouseId"],
      where,
      _sum: { freightAmount: true },
      _count: { _all: true },
      orderBy: { warehouseId: "asc" },
    } as any);

    const ids = rows.map((r: any) => r.warehouseId).filter(Boolean);
    const warehouses = await prisma.warehouse.findMany({
      where: { id: { in: ids }, companyId },
      select: { id: true, name: true },
    });

    const map = new Map(warehouses.map((w) => [w.id, w]));
    return NextResponse.json({
      ok: true,
      groupBy: "warehouse",
      items: rows.map((r: any) => ({
        warehouseId: r.warehouseId,
        warehouse: r.warehouseId ? map.get(r.warehouseId) : null,
        vouchersCount: r._count._all,
        freightTotal: String(r._sum.freightAmount || 0),
      })),
    });
  }

  // default: project
  const rows = await prisma.accountingVoucher.groupBy({
    by: ["projectId"],
    where,
    _sum: { freightAmount: true },
    _count: { _all: true },
    orderBy: { projectId: "asc" },
  } as any);

  const ids = rows.map((r: any) => r.projectId).filter(Boolean);
  const projects = await prisma.project.findMany({
    where: { id: { in: ids }, companyId },
    select: { id: true, title: true, code: true },
  });

  const map = new Map(projects.map((p) => [p.id, p]));
  return NextResponse.json({
    ok: true,
    groupBy: "project",
    items: rows.map((r: any) => ({
      projectId: r.projectId,
      project: r.projectId ? map.get(r.projectId) : null,
      vouchersCount: r._count._all,
      freightTotal: String(r._sum.freightAmount || 0),
    })),
  });
}
