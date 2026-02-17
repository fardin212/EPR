// app/api/crm/leads/[id]/activities/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// لیست پیگیری‌ها (اختیاری – الان UI از props می‌گیرد)
export async function GET(_req: Request, props: RouteParams) {
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

    const activities = await prisma.crmActivity.findMany({
      where: { leadId },
      orderBy: { doneAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (err) {
    console.error("GET /api/crm/leads/[id]/activities error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت پیگیری‌ها" },
      { status: 500 }
    );
  }
}

// ثبت پیگیری جدید
export async function POST(req: Request, props: RouteParams) {
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
        leadId,
        type,
        title,
        detail,
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/leads/[id]/activities error:", err);
    return NextResponse.json(
      { error: "خطا در ثبت پیگیری" },
      { status: 500 }
    );
  }
}
