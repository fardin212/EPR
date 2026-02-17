// app/api/admin/seo/update-meta/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

function isAdmin() {
  return cookies().get("admin_auth")?.value === "1";
}

// کمک: از یک URL، فقط slug آخر مسیر را در می‌آوریم
function extractSlug(rawUrl: string): string {
  try {
    // اگر آدرس نسبی باشد (مثلاً /category/xxx)، خودمان یک دامنه فرضی اضافه می‌کنیم
    const url =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? new URL(rawUrl)
        : new URL(rawUrl, "https://example.com");

    const pathname = url.pathname.split("?")[0].split("#")[0];
    const segments = pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || "";
  } catch {
    // اگر هر مشکلی بود، به صورت fallback:
    const path = rawUrl.split("?")[0].split("#")[0];
    const segments = path.split("/").filter(Boolean);
    return segments[segments.length - 1] || "";
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as
      | {
          url?: string;
          type?: string;
          focusKeyword?: string | null;
          metaTitle?: string | null;
          metaDescription?: string | null;
        }
      | null;

    if (!body || !body.url || !body.type) {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const url = body.url.toString().trim();
    const type = body.type.toString().trim();

    const focusKeyword =
      typeof body.focusKeyword === "string"
        ? body.focusKeyword.trim() || null
        : null;

    const metaTitle =
      typeof body.metaTitle === "string"
        ? body.metaTitle.trim() || null
        : null;

    const metaDescription =
      typeof body.metaDescription === "string"
        ? body.metaDescription.trim() || null
        : null;

    if (!url || !type) {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const slug = extractSlug(url);

    // همه کارها را در یک تراکنش انجام می‌دهیم
    const result = await prisma.$transaction(async (tx) => {
      // ۱) SeoPage را بر اساس url upsert می‌کنیم
      const seoPage = await tx.seoPage.upsert({
        where: { url },
        update: {
          type,
          focusKeyword,
          keyword: focusKeyword,
        },
        create: {
          url,
          type,
          focusKeyword,
          keyword: focusKeyword,
        },
      });

      // ۲) بسته به نوع صفحه، مدل اصلی را هم آپدیت می‌کنیم
      if (type === "category") {
        if (slug && (metaTitle || metaDescription)) {
          try {
            await tx.category.update({
              where: { slug },
              data: {
                seoTitle: metaTitle ?? undefined,
                seoDescription: metaDescription ?? undefined,
              },
            });
          } catch (e) {
            console.warn(
              "[SEO_UPDATE_META] Category not found for slug:",
              slug
            );
          }
        }
      } else if (type === "project") {
        if (slug && (metaTitle || metaDescription)) {
          try {
            await tx.project.update({
              where: { slug },
              data: {
                metaTitle: metaTitle ?? undefined,
                metaDesc: metaDescription ?? undefined,
              },
            });
          } catch (e) {
            console.warn(
              "[SEO_UPDATE_META] Project not found for slug:",
              slug
            );
          }
        }
      }

      return { seoPage, slug };
    });

    return NextResponse.json(
      {
        ok: true,
        page: {
          id: result.seoPage.id,
          url: result.seoPage.url,
          type: result.seoPage.type,
          focusKeyword: result.seoPage.focusKeyword,
        },
        slug: result.slug,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("SEO_UPDATE_META_ERROR", err);
    return NextResponse.json(
      {
        ok: false,
        error: "UPDATE_META_FAILED",
        detail: err?.message ?? "",
      },
      { status: 500 }
    );
  }
}
