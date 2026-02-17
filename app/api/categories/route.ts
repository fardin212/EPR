import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** لیست دسته‌ها (اختیاری: ?parentId=) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parentIdParam = searchParams.get("parentId");
  const parentId =
    parentIdParam === null || parentIdParam === undefined || parentIdParam === ""
      ? null
      : Number(parentIdParam);

  const data = await prisma.category.findMany({
    where: parentId === null ? { parentId: null } : { parentId },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(data);
}

/** ایجاد دسته */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const slug = String(body?.slug ?? "").trim();

    const parentIdRaw = body?.parentId;
    const parentId =
      parentIdRaw === null || parentIdRaw === undefined || parentIdRaw === ""
        ? null
        : Number(parentIdRaw);

    if (!name || !slug) {
      return new NextResponse("نام و اسلاگ اجباری است", { status: 400 });
    }

    const duplicate = await prisma.category.findUnique({ where: { slug } });
    if (duplicate) return new NextResponse("اسلاگ تکراری است", { status: 409 });

    const created = await prisma.category.create({
      data: { name, slug, parentId },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return new NextResponse("خطای سرور", { status: 500 });
  }
}
