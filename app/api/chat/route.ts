import { cookies } from "next/headers";
type MessageRoleLocal = "ADMIN" | "USER" | "SYSTEM";
type ChatStatusLocal = "OPEN" | "CLOSED" | "ARCHIVED";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { chatBus } from "@/lib/chatBus";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body?.text ?? "").trim();
    const name = (body?.name ? String(body.name).trim() : null) || null;
    const phone = (body?.phone ? String(body.phone).trim() : null) || null;
    const clientId = typeof body?.clientId === "string" ? body.clientId : undefined;

    if (!text) return NextResponse.json({ ok: false, error: "EMPTY_TEXT" }, { status: 400 });

    // ⚠️ تغییر مهم: await روی cookies()
    const cookieStore = await cookies();
    const raw = cookieStore.get("chat_session_id")?.value;
    let sessionId = raw ? Number(raw) : 0;

    // اگر کوکی بود ولی سشن وجود نداشت، سشن جدید بسازیم
    if (Number.isFinite(sessionId) && sessionId > 0) {
      const exists = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { id: true },
      });
      if (!exists) sessionId = 0;
    }

    // در صورت نیاز، سشن جدید
    if (!Number.isFinite(sessionId) || sessionId <= 0) {
      const created = await prisma.chatSession.create({
        data: { name, phone, status: "OPEN", lastMessageAt: new Date() },
        select: { id: true },
      });
      sessionId = created.id;

      // ست‌کردن کوکی روی پاسخ
      const res = NextResponse.json({ ok: true, sessionId });
      res.cookies.set("chat_session_id", String(sessionId), {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      const msg = await prisma.message.create({
        data: { sessionId, role: "USER", content: text },
        select: { createdAt: true },
      });
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { lastMessageAt: new Date() },
      });

      chatBus.publish({
        sessionId,
        role: "USER",
        content: text,
        createdAt: msg.createdAt.toISOString(),
        clientId,
      });

      return res;
    }

    // سشن معتبر است → پیام را ثبت کن
    const msg = await prisma.message.create({
      data: { sessionId, role: "USER", content: text },
      select: { createdAt: true },
    });
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { lastMessageAt: new Date() },
    });

    chatBus.publish({
      sessionId,
      role: "USER",
      content: text,
      createdAt: msg.createdAt.toISOString(),
      clientId,
    });

    return NextResponse.json({ ok: true, sessionId });
  } catch (e) {
    console.error("CHAT_POST_ERROR", e);
    return NextResponse.json({ ok: false, error: "INTERNAL" }, { status: 500 });
  }
}
