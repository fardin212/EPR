// app/api/crm/leads/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// لیست سرنخ‌ها (اختیاری – فعلاً ساده)
export async function GET() {
  try {
    const leads = await prisma.crmLead.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (err) {
    console.error("GET /api/crm/leads error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت لیست سرنخ‌ها" },
      { status: 500 }
    );
  }
}

// ثبت سرنخ جدید
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = (body.name || "").toString().trim();
    if (!name) {
      return NextResponse.json(
        { error: "نام سرنخ الزامی است." },
        { status: 400 }
      );
    }

    const lead = await prisma.crmLead.create({
      data: {
        name,
        phone: body.phone || null,
        email: body.email || null,
        source: body.source || null,
        status: (body.status || "NEW").toString().toUpperCase(),
        pipelineStage: (body.pipelineStage || "NEW").toString().toUpperCase(),
        note: body.note || null,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/leads error:", err);
    return NextResponse.json(
      { error: "خطا در ثبت سرنخ جدید" },
      { status: 500 }
    );
  }
}
