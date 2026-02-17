// app/api/crm/pipeline/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PIPELINE_STAGES = ["NEW", "CONTACTED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

export async function GET() {
  try {
    const leads = await prisma.crmLead.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        pipelineStage: true,
        status: true,
        createdAt: true,
        phone: true,
        source: true,
        // اگر خواستی می‌تونی field مبلغ تقریبی هم به مدل اضافه کنی
      },
    });

    const grouped: Record<string, any[]> = {};
    for (const s of PIPELINE_STAGES) grouped[s] = [];

    for (const l of leads) {
      const key = (l.pipelineStage || "NEW").toUpperCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(l);
    }

    return NextResponse.json({ stages: PIPELINE_STAGES, grouped });
  } catch (err) {
    console.error("GET /api/crm/pipeline error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت داده‌های کانبان" },
      { status: 500 }
    );
  }
}
