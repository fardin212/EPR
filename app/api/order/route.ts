// app/api/order/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { OrderType, OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// تبدیل امن هر مقدار به string|null
function asString(v: any): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

// تبدیل امن به number|null برای فیلدهای Float
function asNumber(v: any): number | null {
  if (v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// نرمال‌سازی نوع سفارش به enum معتبر Prisma
function normalizeOrderType(v: any): OrderType {
  const s = asString(v)?.toLowerCase();

  if (!s) return "CONEX"; // پیش‌فرض

  if (
    s === "container" ||
    s === "کانتینر" ||
    s === "containar" ||
    s === "کانتینری"
  ) {
    return "CONTAINER";
  }

  if (s === "repair" || s === "تعمیر" || s === "tamir") {
    return "REPAIR";
  }

  // هر چیز دیگر → CONEX
  return "CONEX";
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let data: any = {};

    // فقط یک‌بار بدنه را می‌خوانیم، بر اساس نوع محتوا
    if (contentType.includes("application/json")) {
      data = (await req.json().catch(() => ({}))) ?? {};
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const form = await req.formData();
      form.forEach((value, key) => {
        data[key] = value;
      });
    } else {
      // fallback ساده
      data = (await req.json().catch(() => ({}))) ?? {};
    }

    const {
      name,
      phone,
      city,
      type,
      length,
      width,
      height,
      insulation,
      plumbing,
      notes,
      // نام‌های قدیمی احتمالی از فرم
      electricity,
      electric,
      delivery,
      eta,
      frame,
      facade,
      windows,
      rooms,
      wc,
      size,
      condition,
      doors,
      mods,
    } = data;

    // فیلدهای ضروری
    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "REQUIRED_FIELDS" },
        { status: 400 }
      );
    }

    // enum ها
    const typeValue: OrderType = normalizeOrderType(type);
    const statusValue: OrderStatus = "NEW";

    // سازگاری با نام‌های قدیمی فیلدها
    const electricityVal = electricity ?? electric;
    const deliveryVal = delivery ?? eta;

    // ایجاد سفارش در دیتابیس
    await prisma.order.create({
      data: {
        type: typeValue,
        status: statusValue,
        name: String(name),
        phone: String(phone),
        city: asString(city) || "",
        length: asNumber(length),
        width: asNumber(width),
        height: asNumber(height),
        insulation: asString(insulation),
        electricity: asString(electricityVal),
        plumbing: asString(plumbing),
        delivery: asString(deliveryVal),
        frame: asString(frame),
        facade: asString(facade),
        windows: asString(windows),
        rooms: asString(rooms),
        wc: asString(wc),
        size: asString(size),
        condition: asString(condition),
        doors: asString(doors),
        mods: asString(mods),
        notes: asString(notes),
        // source و ip را نمی‌فرستیم تا مقدار پیش‌فرض Prisma استفاده شود
      },
    });

    // بعد از ثبت موفق → ریدایرکت به صفحه تشکر روی دامنه واقعی
    const proto =
      req.headers.get("x-forwarded-proto") ??
      req.headers.get("x-forwarded-scheme") ??
      "https";

    const host =
      req.headers.get("x-forwarded-host") ??
      req.headers.get("host") ??
      "www.conexnikan.com";

    const thanksUrl = `${proto}://${host}/order/thanks`;

    return NextResponse.redirect(thanksUrl, { status: 303 });
  } catch (err) {
    console.error("ORDER_CREATE_ERROR", err);
    return NextResponse.json(
      { ok: false, error: "INTERNAL" },
      { status: 500 }
    );
  }
}
