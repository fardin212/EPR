"use server";

import { sendTelegram } from "@/lib/telegram";

export async function testTelegram(_fd: FormData): Promise<void> {
  await sendTelegram("🧪 تست از پنل ادمین کانکس نیکان ✅");
}
