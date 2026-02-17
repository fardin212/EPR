// app/api/warehouses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const simple = searchParams.get("simple");

    const warehouses = await prisma.warehouse.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "asc" },
    });

    if (simple === "1" || simple === "true") {
      const simpleList = warehouses.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.code,
      }));
      return NextResponse.json(simpleList);
    }

    return NextResponse.json(warehouses);
  } catch (err) {
    console.error("GET /api/warehouses error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت لیست انبارها" },
      { status: 500 },
    );
  }
}
