import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: { id: string } };

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "شناسه مشتری نامعتبر است." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const type = (body.type || "NOTE").toString().toUpperCase();
    const title = (body.title || "").toString().trim();
    const detail = body.detail ? body.detail.toString() : null;

    if (!title) {
      return NextResponse.json(
        { error: "عنوان فعالیت الزامی است." },
        { status: 400 }
      );
    }

    const activity = await prisma.crmActivity.create({
      data: {
        customerId: id,
        type,
        title,
        detail,
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/customers/[id]/activities error:", err);
    return NextResponse.json(
      { error: "خطا در ثبت پیگیری" },
      { status: 500 }
    );
  }
}
