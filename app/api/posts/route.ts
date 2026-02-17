import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      content,
      coverUrl,
      categoryId,
      // از کلاینت احتمالاً published:boolean می‌فرستی
      published,
    } = body ?? {};

    // نگاشت بولین به status/publishedAt
    const status: string = published ? "published" : "draft";
    const publishedAt = published ? new Date() : null;

    const created = await prisma.post.create({
      data: {
        title,
        slug,
        body: content ?? "",
        coverUrl: coverUrl ?? null,
        category: body.category ?? null, // اگر فیلد category متنی است
        // اگر categoryId رلیشن است و توی اسکیمای شما متفاوت است، مطابق مدل خودت تنظیم کن
        status: status as any,
        publishedAt,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to create post" },
      { status: 400 }
    );
  }
}
