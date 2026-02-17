// app/api/admin/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pass } = await req.json().catch(() => ({}));
  const key = process.env.ADMIN_KEY || "";

  if (!key) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_KEY_NOT_SET" },
      { status: 500 }
    );
  }

  if (pass !== key) {
    return NextResponse.json(
      { ok: false, error: "INVALID_PASSWORD" },
      { status: 401 }
    );
  }

  const proto = req.headers.get("x-forwarded-proto");
  const isHttps = proto === "https";

  const r = NextResponse.json({ ok: true });

  // ✅ کوکی قدیمی برای صفحات فعلی
  r.cookies.set("admin_key", key, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  // ✅ کوکی جدید برای middleware
  r.cookies.set("admin_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return r;
}
