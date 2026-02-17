// app/admin/(dashboard)/seo/analyze-api/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// چک ساده‌ی ادمین
function isAdmin() {
  return cookies().get("admin_auth")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") || "/";

  // بعداً اینجا آنالیز واقعی صفحه رو اضافه می‌کنیم
  return NextResponse.json({
    ok: true,
    url,
    message:
      "سرویس آنالیز سئو فعلاً در حالت تست است. اتصال به آنالیز واقعی را بعداً اضافه می‌کنیم.",
    seo: {
      score: null,
      title: null,
      description: null,
      h1: null,
      wordCount: null,
    },
  });
}
