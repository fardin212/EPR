import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { getMeServer } from "@/lib/authMe";
import { DailyPricePdf } from "./DailyPricePdf";

export const runtime = "nodejs";

export async function GET() {
  const me = await getMeServer();
  const companyId = me.companyId;

  const materials = await prisma.material.findMany({
    where: { companyId, isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { name: true, unit: true, unitPrice: true, category: true, updatedAt: true },
  });

  const pdfBuffer = await renderToBuffer(
    DailyPricePdf({
      companyName: "کانکس نیکان",
      date: new Date(),
      materials: materials.map((m) => ({
        name: m.name,
        unit: m.unit,
        unitPrice: m.unitPrice,
        category: m.category || "—",
      })),
    })
  );

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="nikan-daily-price.pdf"`,
    },
  });
}
