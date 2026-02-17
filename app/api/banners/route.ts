// app/api/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/banners  → لیست بنرها (مرتب بر اساس sort سپس id)
export async function GET() {
  const rows = await prisma.banner.findMany({
    orderBy: [{ sort: "asc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      link: true,
      imageUrl: true,
      sort: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(rows);
}

// POST /api/banners  → ساخت بنر جدید
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // نگاشت سازگار با هر دو نام‌گذاری
  const titleRaw = typeof body.title === "string" ? body.title.trim() : "";
  const imageUrlRaw = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const linkRaw =
    typeof body.link === "string"
      ? body.link
      : typeof body.linkUrl === "string"
      ? body.linkUrl
      : "";
  const sortRaw =
    typeof body.sort !== "undefined"
      ? body.sort
      : typeof body.order !== "undefined"
      ? body.order
      : 0;
  const activeRaw =
    typeof body.active !== "undefined" ? Boolean(body.active) : true;

  if (!imageUrlRaw) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const data = {
    title: titleRaw || undefined,            // optional → undefined نه null
    link: linkRaw.trim() || undefined,       // optional
    imageUrl: imageUrlRaw,                   // required
    sort: Number(sortRaw) || 0,
    active: activeRaw,
  };

  try {
    const created = await prisma.banner.create({
      data,
      select: {
        id: true,
        title: true,
        link: true,
        imageUrl: true,
        sort: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Create failed", detail: e?.message || String(e) },
      { status: 400 }
    );
  }
}
