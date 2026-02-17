import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** دریافت یک دسته */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cid = Number(id);
  if (!cid) return new NextResponse("شناسه نامعتبر", { status: 400 });

  const data = await prisma.category.findUnique({ where: { id: cid } });
  if (!data) return new NextResponse("پیدا نشد", { status: 404 });

  // Prisma خودش همه فیلدها (شامل فیلدهای جدید سئو) را برمی‌گرداند
  return NextResponse.json(data);
}

/** ویرایش دسته (ساختار + چند فیلد ساده سئو) */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cid = Number(id);
    if (!cid) return new NextResponse("شناسه نامعتبر", { status: 400 });

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
    if (parentId && parentId === cid) {
      return new NextResponse("نمی‌توانید والد را خودِ دسته بگذارید", {
        status: 400,
      });
    }

    const duplicate = await prisma.category.findFirst({
      where: { slug, NOT: { id: cid } },
      select: { id: true },
    });
    if (duplicate) return new NextResponse("اسلاگ تکراری است", { status: 409 });

    // فیلدهای اضافه‌ای که اگر در body باشند، ذخیره می‌کنیم:
    const imageUrl =
      body?.imageUrl && String(body.imageUrl).trim().length
        ? String(body.imageUrl).trim()
        : null;

    const seoTitle =
      body?.seoTitle && String(body.seoTitle).trim().length
        ? String(body.seoTitle).trim()
        : null;

    const seoDescription =
      body?.seoDescription && String(body.seoDescription).trim().length
        ? String(body.seoDescription).trim()
        : null;

    // 👇 این‌ها فقط اگر در schema اضافه‌شان کرده‌ای، نگه‌شان دار
    const focusKeyword =
      body?.focusKeyword && String(body.focusKeyword).trim().length
        ? String(body.focusKeyword).trim()
        : null;

    const seoKeywords =
      body?.seoKeywords && String(body.seoKeywords).trim().length
        ? String(body.seoKeywords).trim()
        : null;

    const canonical =
      body?.canonical && String(body.canonical).trim().length
        ? String(body.canonical).trim()
        : null;

    const ogTitle =
      body?.ogTitle && String(body.ogTitle).trim().length
        ? String(body.ogTitle).trim()
        : null;

    const ogImage =
      body?.ogImage && String(body.ogImage).trim().length
        ? String(body.ogImage).trim()
        : null;

    const noindex =
      typeof body?.noindex === "boolean" ? body.noindex : undefined;
    const nofollow =
      typeof body?.nofollow === "boolean" ? body.nofollow : undefined;

    const readMinutesRaw = body?.readMinutes;
    const readMinutes =
      readMinutesRaw === null || readMinutesRaw === "" || readMinutesRaw === undefined
        ? null
        : Number(readMinutesRaw) || null;

    const updated = await prisma.category.update({
      where: { id: cid },
      data: {
        name,
        slug,
        parentId,

        // فیلدهای اختیاری:
        imageUrl,

        seoTitle,
        seoDescription,
        // اگر تو schema داری، نگه‌شان دار:
        focusKeyword,
        seoKeywords,
        canonical,
        ogTitle,
        ogImage,
        ...(typeof noindex !== "undefined" && { noindex }),
        ...(typeof nofollow !== "undefined" && { nofollow }),
        readMinutes,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/categories/[id] error:", e);
    return new NextResponse("خطای سرور", { status: 500 });
  }
}

/**
 * حذف دسته با امکان انتقال:
 * DELETE /api/categories/:id?moveChildrenTo=<catId>&moveProjectsTo=<catId>
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cid = Number(id);
  if (!cid) return new NextResponse("شناسه نامعتبر", { status: 400 });

  const { searchParams } = new URL(req.url);
  const moveChildrenToParam = searchParams.get("moveChildrenTo");
  const moveProjectsToParam = searchParams.get("moveProjectsTo");

  const childrenCount = await prisma.category.count({ where: { parentId: cid } });
  const projectsCount = await prisma.project.count({ where: { categoryId: cid } });

  if ((childrenCount > 0 || projectsCount > 0) && !moveChildrenToParam && !moveProjectsToParam) {
    return new NextResponse("ابتدا زیردسته‌ها را حذف/منتقل کنید", { status: 409 });
  }

  const moveChildrenTo = moveChildrenToParam ? Number(moveChildrenToParam) : null;
  const moveProjectsTo = moveProjectsToParam ? Number(moveProjectsToParam) : null;

  if (moveChildrenTo && moveChildrenTo === cid) {
    return new NextResponse("مقصدِ انتقال زیردسته‌ها نمی‌تواند خودِ دسته باشد", {
      status: 400,
    });
  }
  if (moveProjectsTo && moveProjectsTo === cid) {
    return new NextResponse("مقصدِ انتقال نمونه‌کارها نمی‌تواند خودِ دسته باشد", {
      status: 400,
    });
  }

  if (moveChildrenTo) {
    const exists = await prisma.category.findUnique({ where: { id: moveChildrenTo } });
    if (!exists)
      return new NextResponse("مقصد انتقال زیردسته‌ها یافت نشد", { status: 400 });
  }
  if (moveProjectsTo) {
    const exists = await prisma.category.findUnique({ where: { id: moveProjectsTo } });
    if (!exists)
      return new NextResponse("مقصد انتقال نمونه‌کارها یافت نشد", { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (moveChildrenTo) {
      await tx.category.updateMany({
        where: { parentId: cid },
        data: { parentId: moveChildrenTo },
      });
    }
    if (moveProjectsTo) {
      await tx.project.updateMany({
        where: { categoryId: cid },
        data: { categoryId: moveProjectsTo },
      });
    }
    await tx.category.delete({ where: { id: cid } });
  });

  return NextResponse.json({ ok: true });
}
