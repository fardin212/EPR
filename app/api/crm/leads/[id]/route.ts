// app/api/crm/leads/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// گرفتن سرنخ به صورت JSON (اختیاری – برای دیباگ/استفاده بعدی)
export async function GET(props: RouteParams) {
  try {
    const { params } = props;
    const { id } = await params;
    const leadId = Number(id);

    if (!leadId) {
      return NextResponse.json(
        { error: "شناسه سرنخ نامعتبر است." },
        { status: 400 }
      );
    }

    const lead = await prisma.crmLead.findUnique({
      where: { id: leadId },
      include: {
        customer: true,
        activities: { orderBy: { doneAt: "desc" } },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "سرنخ یافت نشد." },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (err) {
    console.error("GET /api/crm/leads/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت سرنخ" },
      { status: 500 }
    );
  }
}

// آپدیت سرنخ (اصلی که LeadDetailClient استفاده می‌کند)
export async function PUT(req: Request, props: RouteParams) {
  try {
    const { params } = props;
    const { id } = await params;
    const leadId = Number(id);

    if (!leadId) {
      return NextResponse.json(
        { error: "شناسه سرنخ نامعتبر است." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const data: any = {};

    if (body.status) {
      data.status = body.status.toString().toUpperCase();
    }
    if (body.pipelineStage) {
      data.pipelineStage = body.pipelineStage.toString().toUpperCase();
    }
    if (body.phone !== undefined) {
      data.phone = body.phone || null;
    }
    if (body.email !== undefined) {
      data.email = body.email || null;
    }
    if (body.source !== undefined) {
      data.source = body.source || null;
    }
    if (body.note !== undefined) {
      data.note = body.note || null;
    }
    if (!Object.keys(data).length) {
      return NextResponse.json(
        { error: "فیلدی برای بروزرسانی ارسال نشده است." },
        { status: 400 }
      );
    }

    const updated = await prisma.crmLead.update({
      where: { id: leadId },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/crm/leads/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در بروزرسانی سرنخ" },
      { status: 500 }
    );
  }
}

// حذف سرنخ (اختیاری)
export async function DELETE(_req: Request, props: RouteParams) {
  try {
    const { params } = props;
    const { id } = await params;
    const leadId = Number(id);

    if (!leadId) {
      return NextResponse.json(
        { error: "شناسه سرنخ نامعتبر است." },
        { status: 400 }
      );
    }

    await prisma.crmActivity.deleteMany({ where: { leadId } });
    await prisma.crmLead.delete({ where: { id: leadId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/crm/leads/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در حذف سرنخ" },
      { status: 500 }
    );
  }
}
