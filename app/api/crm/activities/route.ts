import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const acts = await prisma.crmActivity.findMany({
      orderBy: { doneAt: "desc" },
      include: {
        lead: true,
        customer: true,
      },
    });

    return NextResponse.json(acts);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "خطا در دریافت فعالیت‌ها" },
      { status: 500 }
    );
  }
}
