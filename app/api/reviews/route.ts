import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

function clampRating(n: number) {
  if (Number.isNaN(n)) return 5;
  return Math.max(1, Math.min(5, n));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });

    // Honeypot ضد بات‌ها (فرم اگر این فیلد پر شد یعنی بات)
    if (body.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const name = String(body.name ?? "").trim();
    const tag = String(body.tag ?? "").trim();
    const text = String(body.text ?? "").trim();
    const rating = clampRating(parseInt(String(body.rating ?? "5"), 10));

    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "نام خیلی کوتاه است" }, { status: 400 });
    }
    if (text.length < 10) {
      return NextResponse.json({ ok: false, error: "متن نظر خیلی کوتاه است" }, { status: 400 });
    }
    if (text.length > 1500) {
      return NextResponse.json({ ok: false, error: "متن نظر خیلی طولانی است" }, { status: 400 });
    }

    // در صورت نیاز بعداً می‌تونی IP را ذخیره کنی (فعلاً فقط می‌خوانیم)
    const h = await headers();
    const ip = h.get("x-forwarded-for") || h.get("x-real-ip") || "";

    await prisma.siteReview.create({
      data: {
        name,
        tag: tag || null,
        body: text,
        rating,
        status: "pending", // ✅ مهم: اول pending، بعد تایید توسط ادمین
      },
    });

    return NextResponse.json({ ok: true, message: "نظر شما ثبت شد و پس از تایید نمایش داده می‌شود." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// (اختیاری) برای گرفتن لیست نظرات تایید شده از کلاینت
export async function GET() {
  const rows = await prisma.siteReview.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, name: true, rating: true, tag: true, body: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, data: rows });
}
