// app/api/inventory/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

function normCode(v: any) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

export async function GET() {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  const cats = await prisma.productCategory.findMany({
    where: { companyId },
    orderBy: { id: "desc" },
    select: { id: true, title: true, code: true, nextSeq: true },
  });

  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);

  try {
    const body = await req.json();
    const title = String(body?.title || "").trim();
    const code = normCode(body?.code);

    if (!title || !code) {
      return NextResponse.json(
        { error: "عنوان دسته و کد دسته (Prefix) الزامی است" },
        { status: 400 }
      );
    }

    const created = await prisma.productCategory.create({
      data: { companyId, title, code, nextSeq: 1 },
      select: { id: true, title: true, code: true, nextSeq: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    // خطای یونیک بودن title/code
    return NextResponse.json(
      { error: "این عنوان یا کد دسته قبلاً ثبت شده است" },
      { status: 409 }
    );
  }
}
