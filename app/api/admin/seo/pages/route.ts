import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function isAdmin() {
  return cookies().get("admin_auth")?.value === "1";
}

type SeoPageItem = {
  id: string;
  refId: number | null;
  type: "category" | "project" | "post" | "static";
  title: string;
  url: string;
  keyword: string | null;
  lastScore: number | null;
  wordCount: number | null;
  lastAnalyzedAt: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type ApiResponse =
  | { ok: true; pages: SeoPageItem[] }
  | { ok: false; message: string };

export async function GET(
  _req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    if (!isAdmin()) {
      return NextResponse.json(
        { ok: false, message: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const [categories, projects, seoPages] = await Promise.all([
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          seoTitle: true,
          seoDescription: true,
        },
      }),
      prisma.project.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          metaTitle: true,
          metaDesc: true,
        },
      }),
      prisma.seoPage.findMany({
        select: {
          id: true,
          url: true,
          type: true,
          keyword: true,
          lastScore: true,
          wordCount: true,
          lastAnalyzed: true,
        },
      }),
    ]);

    const seoByUrl = new Map(
      seoPages.map((p) => [p.url, p])
    );

    // ۱) دسته‌بندی‌ها
    const categoryPages: SeoPageItem[] = categories.map((c) => {
      const url = `/category/${c.slug}`;
      const s = seoByUrl.get(url);

      const title = c.seoTitle || `کانکس ${c.name}`;

      return {
        id: `category-${c.id}`,
        refId: c.id,
        type: "category",
        title,
        url,
        keyword: s?.keyword ?? null,
        lastScore: s?.lastScore ?? null,
        wordCount: s?.wordCount ?? null,
        lastAnalyzedAt: s?.lastAnalyzed
          ? s.lastAnalyzed.toISOString()
          : null,
        metaTitle: c.seoTitle,
        metaDescription: c.seoDescription,
      };
    });

    // ۲) پروژه‌ها / نمونه‌کارها
    const projectPages: SeoPageItem[] = projects.map((p) => {
      const url = `/portfolio/${p.slug}`;
      const s = seoByUrl.get(url);

      const title = p.metaTitle || p.title || `نمونه کار ${p.slug}`;

      return {
        id: `project-${p.id}`,
        refId: p.id,
        type: "project",
        title,
        url,
        keyword: s?.keyword ?? null,
        lastScore: s?.lastScore ?? null,
        wordCount: s?.wordCount ?? null,
        lastAnalyzedAt: s?.lastAnalyzed
          ? s.lastAnalyzed.toISOString()
          : null,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDesc,
      };
    });

    // ۳) صفحات ثابت
    const staticDefs = [
      { id: "static-home", url: "/", title: "صفحه اصلی" },
      { id: "static-categories", url: "/categories", title: "دسته‌بندی‌ها" },
      { id: "static-portfolio", url: "/portfolio", title: "نمونه‌کارها" },
      { id: "static-contact", url: "/contact", title: "تماس با ما" },
    ];

    const staticPages: SeoPageItem[] = staticDefs.map((sp) => {
      const s = seoByUrl.get(sp.url);
      return {
        id: sp.id,
        refId: null,
        type: "static",
        title: sp.title,
        url: sp.url,
        keyword: s?.keyword ?? null,
        lastScore: s?.lastScore ?? null,
        wordCount: s?.wordCount ?? null,
        lastAnalyzedAt: s?.lastAnalyzed
          ? s.lastAnalyzed.toISOString()
          : null,
      };
    });

    const pages: SeoPageItem[] = [
      ...categoryPages,
      ...projectPages,
      ...staticPages,
    ];

    return NextResponse.json(
      { ok: true, pages },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("SEO_PAGE_LIST_FAILED", err);
    return NextResponse.json(
      { ok: false, message: "SEO_PAGE_LIST_FAILED" },
      { status: 500 }
    );
  }
}
