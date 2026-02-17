// app/api/inventory/alerts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function n(v: any): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export async function GET() {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  // جمع موجودی هر محصول از جدول Stock
  const sums = await prisma.stock.groupBy({
    by: ["productId"],
    where: { companyId },
    _sum: { quantity: true },
  });

  const totalByProduct = new Map<number, number>(
    sums.map((s) => [s.productId, n(s._sum.quantity)])
  );

  // محصولات + minStock
  const products = await prisma.product.findMany({
    where: { companyId },
    select: {
      id: true,
      sku: true,
      name: true,
      stockUnit: true,
      minStock: true,
      category: { select: { title: true, code: true } },
    },
    orderBy: { id: "desc" },
  });

  const alerts = products
    .map((p) => {
      const totalQty = totalByProduct.get(p.id) ?? 0;
      const min = n(p.minStock);
      return { ...p, totalQty, minStock: min, isLow: totalQty < min };
    })
    .filter((x) => x.isLow);

  return NextResponse.json({
    count: alerts.length,
    items: alerts,
  });
}
