"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { notifyTelegram } from "@/lib/notify";

function s(fd: FormData, k: string) {
  return String(fd.get(k) || "").trim();
}

function digitsOnly(v: string) {
  return (v || "").replace(/[^\d]/g, "");
}

// برای اینکه HTML تلگرام با متن کاربر خراب نشه
function escHtml(v: string) {
  return (v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * ✅ Server Action برای فرم جزئیات خرید کانکس دست دوم
 * نکته: برای سازگاری کامل با <form action={...}> بهتره void برگردونه.
 */
export async function createUsedConexLead(slug: string, fd: FormData): Promise<void> {
  const rawPhone = s(fd, "phone");
  const phone = digitsOnly(rawPhone);

  // اعتبارسنجی مینیمال
  if (!phone || phone.length < 10) {
    // اگر می‌خوای پیام خطا به UI برگردونی باید روش UI رو تغییر بدی (مثلاً useFormState)
    // فعلاً با throw جلوی ذخیره لید رو می‌گیریم.
    throw new Error("شماره تماس معتبر نیست");
  }

  const name = s(fd, "name") || null;
  const cityFromForm = s(fd, "city") || null;
  const message = s(fd, "message") || null;

  // آیتم مربوطه
  const item = await prisma.usedConex.findUnique({
    where: { slug },
    select: { id: true, city: true, title: true, type: true, size: true, price: true },
  });

  // ✅ 1) ذخیره لید
  const lead = await prisma.usedConexLead.create({
    data: {
      usedId: item?.id || null,
      slug,
      name,
      phone,
      city: cityFromForm || item?.city || null,
      message,
      source: "used_conex",
      status: "new",
    },
    select: { id: true },
  });

  // ✅ 2) ساخت پیام تلگرام
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://conexnikan.com";
  const msg = [
    `🆕 <b>لید جدید کانکس دست دوم</b>`,
    `• کد لید: <code>${lead.id}</code>`,
    `• اسلاگ: <code>${escHtml(slug)}</code>`,
    item?.title ? `• عنوان: ${escHtml(item.title)}` : null,
    `• نام: ${escHtml(name || "-")}`,
    `• تلفن: <code>${escHtml(phone)}</code>`,
    `• شهر: ${escHtml((cityFromForm || item?.city) || "-")}`,
    `• پیام: ${escHtml(message || "-")}`,
    `• لینک: ${siteUrl}/used-conex/buy/${escHtml(slug)}`,
  ]
    .filter(Boolean)
    .join("\n");

  // ✅ 3) ضداسپم 10 دقیقه‌ای + ارسال تلگرام (بدون fail کردن فرم)
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);

  const alreadyNotified = await prisma.leadNotifyLog.findFirst({
    where: {
      phone,
      createdAt: { gte: tenMinAgo },
    },
    select: { id: true },
  });

  if (!alreadyNotified) {
    try {
      await notifyTelegram(msg);
    } catch (e) {
      console.log("[TG_FAIL][used_conex_lead]", e);
      // مهم: لید ذخیره شده؛ شکست تلگرام نباید UX رو خراب کنه
    }

    // لاگ ارسال نوتیف
    await prisma.leadNotifyLog.create({
      data: { phone, slug },
    });
  }

  // ✅ 4) ری‌ولیدیت
  revalidatePath(`/used-conex/buy/${slug}`);
  revalidatePath(`/used-conex/buy`);
}
