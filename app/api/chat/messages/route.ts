// app/api/chat/messages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { chatBus } from "@/lib/chatBus";

export const dynamic = "force-dynamic";

/* GET → لیست پیام‌های یک سشن */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sid = Number(url.searchParams.get("sessionId"));

    if (!Number.isFinite(sid)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_SESSION_ID" },
        { status: 400 }
      );
    }

    const exists = await prisma.chatSession.findUnique({
      where: { id: sid },
    });

    if (!exists) {
      return NextResponse.json(
        { ok: false, error: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { sessionId: sid },
      orderBy: { createdAt: "asc" },
      take: 300,
    });

    return NextResponse.json({
      ok: true,
      messages,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "FAILED" },
      { status: 500 }
    );
  }
}

/* POST → ارسال پیام جدید از کاربر یا ادمین */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) || {};

    const sid = Number(body.sessionId);
    const text = String(body.text ?? body.content ?? "").trim();
    const role = body.role === "ADMIN" ? "ADMIN" : "USER";

    if (!Number.isFinite(sid) || !text) {
      return NextResponse.json(
        { ok: false, error: "BAD_INPUT" },
        { status: 400 }
      );
    }

    // ❗ به‌جای findUniqueOrThrow:
    const existing = await prisma.chatSession.findUnique({
      where: { id: sid },
      select: { id: true },
    });

    if (!existing) {
      // سشن پیدا نشد → برای سمت کلاینت 404 برگردونیم
      return NextResponse.json(
        { ok: false, error: "SESSION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const created = await prisma.message.create({
      data: {
        sessionId: sid,
        content: text,
        role,
      },
    });

    await prisma.chatSession.update({
      where: { id: sid },
      data: { lastMessageAt: new Date() },
    });

    // ارسال رویداد به استریم چت (ChatEvent بدون فیلد type)
    chatBus.publish({
      sessionId: sid,
      role: role === "ADMIN" ? "ADMIN" : "USER",
      content: text,
      createdAt: created.createdAt.toISOString(),
      clientId: body.clientId ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      message: created,
    });
  } catch (e) {
    console.error("MSG_POST_ERROR", e);
    return NextResponse.json(
      { ok: false, error: "FAILED" },
      { status: 500 }
    );
  }
}
