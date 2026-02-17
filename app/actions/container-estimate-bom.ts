"use server";

import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";
import { EstimateQtyUnit, MaterialPriceBasis } from "@prisma/client";
import { revalidatePath } from "next/cache";

function n(v: any): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function bi(v: any): bigint {
  const x = Math.round(Number(v ?? 0));
  return BigInt(Number.isFinite(x) ? x : 0);
}

async function assertEstimateAccess(estimateId: number, companyId: number) {
  const est = await prisma.containerEstimate.findFirst({
    where: { id: estimateId, companyId },
    select: { id: true },
  });
  if (!est) throw new Error("پیش‌فاکتور پیدا نشد یا دسترسی ندارید");
}

export async function getOrCreateEstimateBom(estimateId: number) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);
  await assertEstimateAccess(estimateId, companyId);

  const bom = await prisma.containerEstimateBom.upsert({
    where: { estimateId },
    update: {},
    create: {
      companyId,
      estimateId,
      status: "DRAFT",
    },
    include: {
      lines: {
        orderBy: { id: "asc" },
        include: {
          material: {
            select: {
              id: true,
              name: true,
              unitPrice: true,
              priceBasis: true,
              kgPerPiece: true,
              kgPerBranch: true,
            },
          },
        },
      },
      estimate: {
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          containerModelId: true,
          sizePresetId: true,
          length: true,
          width: true,
          height: true,
        },
      },
    },
  });

  // Plain numbers
  return {
    ...bom,
    lines: bom.lines.map((l) => ({
      ...l,
      unitPrice: Number(l.unitPrice ?? 0),
      lineTotal: Number(l.lineTotal ?? 0),
      material: {
        ...l.material,
        unitPrice: Number(l.material.unitPrice ?? 0),
        kgPerPiece: l.material.kgPerPiece == null ? null : Number(l.material.kgPerPiece),
        kgPerBranch: l.material.kgPerBranch == null ? null : Number(l.material.kgPerBranch),
      },
    })),
  };
}

export async function finalizeEstimateBom(bomId: number) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const bom = await prisma.containerEstimateBom.findFirst({
    where: { id: bomId, companyId },
    select: { id: true, estimateId: true },
  });
  if (!bom) throw new Error("BOM پیدا نشد یا دسترسی ندارید");

  await prisma.containerEstimateBom.update({
    where: { id: bomId },
    data: {
      status: "FINAL",
      finalizedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/container-estimates/${bom.estimateId}/bom`);
  return { ok: true };
}

export async function unfinalizeEstimateBom(bomId: number) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const bom = await prisma.containerEstimateBom.findFirst({
    where: { id: bomId, companyId },
    select: { id: true, estimateId: true },
  });
  if (!bom) throw new Error("BOM پیدا نشد یا دسترسی ندارید");

  await prisma.containerEstimateBom.update({
    where: { id: bomId },
    data: {
      status: "DRAFT",
      finalizedAt: null,
    },
  });

  revalidatePath(`/dashboard/container-estimates/${bom.estimateId}/bom`);
  return { ok: true };
}

type UpsertLineInput = {
  bomId: number;
  lineId?: number;

  materialId: number;
  qty: number;

  qtyUnit?: EstimateQtyUnit | null;
  qtyUnitCustom?: string | null;

  // اگر کاربر خواست دستی بزند:
  unitPrice?: number | null;

  note?: string | null;
};

function calcLineTotal(opts: {
  qty: number;
  qtyUnit?: EstimateQtyUnit | null;
  qtyUnitCustom?: string | null;
  priceBasis: MaterialPriceBasis;
  unitPrice: number;
  kgPerPiece?: number | null;
  kgPerBranch?: number | null;
}) {
  const qty = n(opts.qty);
  const unitPrice = n(opts.unitPrice);

  // اگر واحد سفارشی است، تبدیل خاصی نداریم (کاربر خودش qty را مطابق واحدش می‌زند)
  if (opts.qtyUnitCustom && opts.qtyUnitCustom.trim()) {
    return qty * unitPrice;
  }

  const u = opts.qtyUnit;

  if (opts.priceBasis === MaterialPriceBasis.PER_KG) {
    if (u === EstimateQtyUnit.KG) return qty * unitPrice;
    if (u === EstimateQtyUnit.PIECE && opts.kgPerPiece != null) return qty * n(opts.kgPerPiece) * unitPrice;
    if (u === EstimateQtyUnit.BRANCH && opts.kgPerBranch != null) return qty * n(opts.kgPerBranch) * unitPrice;
    return qty * unitPrice;
  }

  // سایر حالت‌ها: qty * unitPrice
  return qty * unitPrice;
}

export async function upsertEstimateBomLine(input: UpsertLineInput) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const bom = await prisma.containerEstimateBom.findFirst({
    where: { id: input.bomId, companyId },
    select: { id: true, estimateId: true },
  });
  if (!bom) throw new Error("BOM پیدا نشد یا دسترسی ندارید");

  const mat = await prisma.material.findFirst({
    where: { id: input.materialId, companyId },
    select: {
      id: true,
      unitPrice: true,
      priceBasis: true,
      kgPerPiece: true,
      kgPerBranch: true,
    },
  });
  if (!mat) throw new Error("مصالح نامعتبر است");

  // قیمت: اگر دستی نفرستادند، قیمت روز متریال
  const unitPrice = input.unitPrice == null ? Number(mat.unitPrice ?? 0) : n(input.unitPrice);

  const lineTotal = calcLineTotal({
    qty: input.qty,
    qtyUnit: input.qtyUnit ?? null,
    qtyUnitCustom: input.qtyUnitCustom ?? null,
    priceBasis: mat.priceBasis,
    unitPrice,
    kgPerPiece: mat.kgPerPiece == null ? null : Number(mat.kgPerPiece),
    kgPerBranch: mat.kgPerBranch == null ? null : Number(mat.kgPerBranch),
  });

  const data = {
    bomId: bom.id,
    materialId: mat.id,
    qty: n(input.qty),
    qtyUnit: input.qtyUnit ?? null,
    qtyUnitCustom: (input.qtyUnitCustom ?? "").trim() || null,
    unitPrice: bi(unitPrice),
    lineTotal: bi(lineTotal),
    note: (input.note ?? "").trim() || null,
  };

  if (input.lineId) {
    await prisma.containerEstimateBomLine.update({
      where: { id: input.lineId },
      data,
    });
  } else {
    await prisma.containerEstimateBomLine.create({ data });
  }

  revalidatePath(`/dashboard/container-estimates/${bom.estimateId}/bom`);
  return { ok: true };
}

export async function deleteEstimateBomLine(bomId: number, lineId: number) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const bom = await prisma.containerEstimateBom.findFirst({
    where: { id: bomId, companyId },
    select: { id: true, estimateId: true },
  });
  if (!bom) throw new Error("BOM پیدا نشد یا دسترسی ندارید");

  await prisma.containerEstimateBomLine.delete({
    where: { id: lineId },
  });

  revalidatePath(`/dashboard/container-estimates/${bom.estimateId}/bom`);
  return { ok: true };
}

export async function refreshBomPricesFromMaterials(bomId: number) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const bom = await prisma.containerEstimateBom.findFirst({
    where: { id: bomId, companyId },
    select: { id: true, estimateId: true },
  });
  if (!bom) throw new Error("BOM پیدا نشد یا دسترسی ندارید");

  const lines = await prisma.containerEstimateBomLine.findMany({
    where: { bomId },
    include: {
      material: { select: { unitPrice: true, priceBasis: true, kgPerPiece: true, kgPerBranch: true } },
    },
  });

  for (const l of lines) {
    // اگر واحد سفارشی دارد، برای آپدیت اتوماتیک قیمت مشکلی ندارد: unitPrice جدید می‌آید و lineTotal مجدد حساب می‌شود
    const unitPrice = Number(l.material.unitPrice ?? 0);

    const lineTotal = calcLineTotal({
      qty: Number(l.qty),
      qtyUnit: l.qtyUnit ?? null,
      qtyUnitCustom: l.qtyUnitCustom ?? null,
      priceBasis: l.material.priceBasis,
      unitPrice,
      kgPerPiece: l.material.kgPerPiece == null ? null : Number(l.material.kgPerPiece),
      kgPerBranch: l.material.kgPerBranch == null ? null : Number(l.material.kgPerBranch),
    });

    await prisma.containerEstimateBomLine.update({
      where: { id: l.id },
      data: { unitPrice: bi(unitPrice), lineTotal: bi(lineTotal) },
    });
  }

  revalidatePath(`/dashboard/container-estimates/${bom.estimateId}/bom`);
  return { ok: true };
}
