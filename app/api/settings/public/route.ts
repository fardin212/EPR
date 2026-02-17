// app/api/settings/public/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // اگر export default داری: import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    // فعلاً scope را فقط برای سازگاری می‌خوانیم، اما نادیده می‌گیریم
    const setting = await prisma.siteSetting.findUnique({
      where: { id: 1 },
    });

    if (!setting) {
      return NextResponse.json({});
    }

    const payload = {
      // برای ویجت چت:
      whatsappNumber: setting.whatsappNumber,     // شماره واتساپ
      telegramUsername: setting.telegramUsername, // یوزرنیم تلگرام
      supportPhone: setting.supportPhone,         // شماره تماس فوری
      chatEnabled: setting.chatEnabled,           // روشن/خاموش بودن چت
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("PUBLIC_SETTINGS_ERROR", error);
    return NextResponse.json(
      { error: "SETTINGS_FETCH_FAILED" },
      { status: 500 }
    );
  }
}
