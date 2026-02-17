// app/api/crm/pipeline/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

const VALID_STAGES = [
  "NEW",
  "CONTACTED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
];

// PATCH /api/crm/pipeline/:id
// body: { pipelineStage: "PROPOSAL", status?: "IN_PROGRESS" | "WON" | ... }
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "شناسه سرنخ نامعتبر است." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const newStage = (body.pipelineStage || "").toString().toUpperCase();

    if (!VALID_STAGES.includes(newStage)) {
      return NextResponse.json(
        { error: "مرحله فروش نامعتبر است." },
        { status: 400 }
      );
    }

    const data: any = { pipelineStage: newStage };

    // اگر stage به WON/LOST رفت، می‌تونیم status را هم هماهنگ کنیم
    if (newStage === "WON") data.status = "WON";
    else if (newStage === "LOST") data.status = "LOST";
    else if (body.status) data.status = body.status.toString().toUpperCase();

    const updated = await prisma.crmLead.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/crm/pipeline/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در بروزرسانی مرحله فروش" },
      { status: 500 }
    );
  }
}
