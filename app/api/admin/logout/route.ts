// app/api/admin/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const r = NextResponse.json({ ok: true });

  r.cookies.set("admin_key", "", {
    path: "/",
    maxAge: 0,
  });

  r.cookies.set("admin_auth", "", {
    path: "/",
    maxAge: 0,
  });

  return r;
}
