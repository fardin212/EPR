"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "admin_auth";

export async function adminLogin(formData: FormData) {
  // اسم فیلد فرم: "password"
  const password = formData.get("password")?.toString() || "";

  // پسورد واقعی از ENV
  const realPassword = process.env.ADMIN_KEY || ""; // 👈 با .env هماهنگ شد

  // اگر ENV خالی است یا رمز اشتباه است
  if (!realPassword || password !== realPassword) {
    redirect("/admin/login?error=wrong");
  }

  // ست کردن کوکی لاگین برای کل دامنه
  cookies().set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    secure: false,          // چون سایت http است، باید false باشد
    path: "/",              // روی همه‌ی مسیرها از جمله /admin/*
    maxAge: 60 * 60 * 8,    // ۸ ساعت
  });

  redirect("/admin");
}
