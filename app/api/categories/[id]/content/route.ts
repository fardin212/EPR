// app/api/categories/[id]/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// چک ساده‌ی ادمین (مثل seo/analyze-api)
function isAdmin() {
  return cookies().get("admin_auth")?.value === "1";
}

type RouteContext = {
  params: { id: string };
};

// ───────────────────── GET ─────────────────────
// دریافت محتوای سئویی دسته برای فرم ادمین
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_ID" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,

        // سئو محتوا
        seoTitle: category.seoTitle ?? "",
        seoDescription: category.seoDescription ?? "",
        focusKeyword: (category as any).focusKeyword ?? "", // اگر طبق پیشنهاد، این فیلد را اضافه کرده‌ای

        summary: category.summary ?? "",
        contentHtml: category.contentHtml ?? "",

        // JSON ها
        faqJson: category.faqJson ?? [],
        specsJson: category.specsJson ?? [],
        galleryJson: category.galleryJson ?? [],

        // زمان مطالعه اگر در مدل اضافه شده
        readMinutes: (category as any).readMinutes ?? null,
      },
    });
  } catch (err: any) {
    console.error("GET /api/categories/[id]/content error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

// ───────────────────── PUT ─────────────────────
// ذخیره محتوای سئویی دسته از فرم ادمین
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      seoTitle,
      seoDescription,
      focusKeyword,
      summary,
      contentHtml,
      faqJson,
      specsJson,
      galleryJson,
      readMinutes,
    } = body || {};

    // یک کم ولیدیشن نرم
    if (!summary && !contentHtml) {
      // اجازه می‌دهیم خالی باشد، ولی می‌تونیم اگر خواستی خطا بدیم
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        seoTitle: seoTitle?.toString().trim() || null,
        seoDescription: seoDescription?.toString().trim() || null,
        // اگر فیلد focusKeyword را طبق اسکیما جدید اضافه کرده‌ای:
        ...(typeof focusKeyword !== "undefined" && {
          focusKeyword:
            focusKeyword && String(focusKeyword).trim().length
              ? String(focusKeyword).trim()
              : null,
        }),

        summary: summary?.toString() || null,
        contentHtml: contentHtml?.toString() || null,

        faqJson: Array.isArray(faqJson) ? faqJson : [],
        specsJson: Array.isArray(specsJson) ? specsJson : [],
        galleryJson: Array.isArray(galleryJson) ? galleryJson : [],

        // اگر readMinutes در مدل Category اضافه شده:
        ...(typeof readMinutes !== "undefined" && {
          readMinutes:
            readMinutes === null || readMinutes === ""
              ? null
              : Number(readMinutes) || null,
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      categoryId: updated.id,
    });
  } catch (err: any) {
    console.error("PUT /api/categories/[id]/content error:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
