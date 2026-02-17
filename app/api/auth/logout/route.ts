// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ success: true });

  // خالی‌کردن کوکی session
  res.cookies.set("session", "", {
    expires: new Date(0),
    path: "/",
  });

  return res;
}
