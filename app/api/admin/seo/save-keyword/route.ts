import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

function isAdmin() {
  return cookies().get("admin_auth")?.value === "1";
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
          type?: "category" | "project" | "post" | "static";
          keyword?: string;
        }
      | null;

    if (!body?.url || !body?.type) {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const keyword = body.keyword ? body.keyword.trim() || null : null;

    // ثبت / بروزرسانی بر اساس URL
    const page = await prisma.seoPage.upsert({
      where: { url: body.url },
      update: {
        type: body.type,
        keyword,
      },
      create: {
        url: body.url,
        type: body.type,
        keyword,
      },
      select: {
        id: true,
        url: true,
        type: true,
        keyword: true,
      },
    });

    return NextResponse.json(
      { ok: true, page },
      { status: 200 }
    );
  } catch (err) {
    console.error("SEO_SAVE_KEYWORD_ERROR", err);
    return NextResponse.json(
      { ok: false, error: "SAVE_KEYWORD_FAILED" },
      { status: 500 }
    );
  }
}
