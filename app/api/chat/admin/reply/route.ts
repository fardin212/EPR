import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { chatBus } from "@/lib/chatBus";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const body = rawBody ?? {};

    // پشتیبانی از چند اسم مختلف برای sessionId (برای سازگاری با فرانت‌های مختلف)
    const rawSessionId =
      body.sessionId ?? body.id ?? body.session ?? body.chatSessionId;

    const sessionId = Number(rawSessionId);

    // پشتیبانی از چند اسم مختلف برای متن پیام
    const rawText = body.text ?? body.content ?? body.message ?? "";
    const text =
      typeof rawText === "string" ? rawText.trim() : String(rawText || "").trim();

    const clientId =
      typeof body?.clientId === "string" ? body.clientId : undefined;

    if (!Number.isFinite(sessionId) || !text) {
      return NextResponse.json(
        { ok: false, error: "BAD_INPUT" },
        { status: 400 }
      );
    }

    // مطمئن شو سشن وجود دارد
    const exists = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // ساخت پیام ادمین (اسم مدل طبق کد خودت: message)
    const created = await prisma.message.create({
      data: {
        sessionId,
        role: "ADMIN",
        content: text,
        // اگر در مدل‌ت فیلدی مثل clientId نداریم، این را اضافه نکن
        // clientId,
      },
      select: { createdAt: true },
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { lastMessageAt: new Date() },
    });

    const createdAt = created.createdAt.toISOString();

    // نوتیفای کلاینت‌ها (SSE)
    chatBus.publish({ sessionId, role: "ADMIN", content: text, createdAt, clientId });

    return NextResponse.json({ ok: true, createdAt, clientId });
  } catch (e: any) {
    console.error("ADMIN_REPLY_ERROR", e);
    return NextResponse.json(
      { ok: false, error: "INTERNAL" },
      { status: 500 }
    );
  }
}
