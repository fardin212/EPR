// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // 👈 از bcryptjs استفاده می‌کنیم

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "ایمیل و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    // ۱) پیدا کردن کاربر بر اساس ایمیل
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "کاربر یافت نشد یا غیرفعال است" },
        { status: 404 }
      );
    }

    // ۲) اعتبارسنجی رمز عبور
    if (!user.password) {
      return NextResponse.json(
        { error: "رمز عبور برای این کاربر تنظیم نشده است" },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // ۳) ساخت سشن ساده بر اساس user.id (کوکی)
    const res = NextResponse.json({ success: true }, { status: 200 });

    res.cookies.set("session", String(user.id), {
      httpOnly: true,
      secure: false, // روی سرور واقعی = true
      maxAge: 60 * 60 * 24, // یک روز
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
