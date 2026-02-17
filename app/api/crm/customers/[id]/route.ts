// app/api/crm/customers/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

// GET /api/crm/customers/:id
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "شناسه مشتری نامعتبر است." },
        { status: 400 }
      );
    }

    const customer = await prisma.crmCustomer.findUnique({
      where: { id },
      include: {
        leads: true,
        activities: { orderBy: { doneAt: "desc" } },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "مشتری یافت نشد." },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (err) {
    console.error("GET /api/crm/customers/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت مشتری" },
      { status: 500 }
    );
  }
}

// PUT /api/crm/customers/:id
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "شناسه مشتری نامعتبر است." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data: any = {};

    if (body.name !== undefined) data.name = body.name || "";
    if (body.type !== undefined) data.type = body.type || null;
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.companyName !== undefined)
      data.companyName = body.companyName || null;
    if (body.lastDealAt !== undefined)
      data.lastDealAt = body.lastDealAt ? new Date(body.lastDealAt) : null;
    if (body.note !== undefined) data.note = body.note || null;

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { error: "فیلدی برای بروزرسانی ارسال نشده است." },
        { status: 400 }
      );
    }

    const updated = await prisma.crmCustomer.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/crm/customers/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در بروزرسانی مشتری" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/customers/:id
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "شناسه مشتری نامعتبر است." },
        { status: 400 }
      );
    }

    // توجه: اینجا ساده حذف می‌کنیم؛
    // اگر نخواستی مشتری حذف شود و فقط غیرفعال شود، می‌توانیم isActive اضافه کنیم.
    await prisma.crmActivity.deleteMany({ where: { customerId: id } });

    await prisma.crmLead.updateMany({
      where: { customerId: id },
      data: { customerId: null },
    });

    await prisma.crmCustomer.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/crm/customers/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در حذف مشتری" },
      { status: 500 }
    );
  }
}
