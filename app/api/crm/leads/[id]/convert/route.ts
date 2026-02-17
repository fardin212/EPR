// app/api/crm/leads/[id]/convert/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

// POST /api/crm/leads/:id/convert
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "شناسه سرنخ نامعتبر است." },
        { status: 400 }
      );
    }

    const lead = await prisma.crmLead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "سرنخ یافت نشد." },
        { status: 404 }
      );
    }

    // اگر قبلاً تبدیل شده:
    if (lead.customerId) {
      const existingCustomer = await prisma.crmCustomer.findUnique({
        where: { id: lead.customerId },
      });

      return NextResponse.json(
        {
          customer: existingCustomer,
          lead,
          alreadyConverted: true,
        },
        { status: 200 }
      );
    }

    // ایجاد مشتری بر اساس اطلاعات lead
    const customer = await prisma.crmCustomer.create({
      data: {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        type: "حقیقی",
        companyName: null,
        note: lead.note,
      },
    });

    // آپدیت lead → وصل کردن به customer و تغییر status
    const updatedLead = await prisma.crmLead.update({
      where: { id },
      data: {
        customerId: customer.id,
        status: "WON",
        pipelineStage: "WON",
      },
    });

    return NextResponse.json(
      {
        customer,
        lead: updatedLead,
        alreadyConverted: false,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/crm/leads/[id]/convert error:", err);
    return NextResponse.json(
      { error: "خطا در تبدیل سرنخ به مشتری" },
      { status: 500 }
    );
  }
}
