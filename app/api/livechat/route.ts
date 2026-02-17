// app/api/livechat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/livechat
 * Body: { name?: string, content?: string, text?: string }
 * - یک سشن چت می‌سازد (source=WEB, status=OPEN)
 * - اولین پیام کاربر را در جدول Message ثبت می‌کند (content)
 */
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : null;
  const content = String((body.content ?? body.text) ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  try {
    // سشن جدید (بدون userAgent)
    const session = await prisma.chatSession.create({
      data: {
        name: name || undefined,
        source: "WEB" as any,   // اگر enum دارید، با اسکیمای خودتان هم‌نام است
        status: "OPEN" as any,  // اگر enum دارید، با اسکیمای خودتان هم‌نام است
      },
      select: { id: true, name: true, source: true, status: true, createdAt: true },
    });

    // پیام اول کاربر در جدول Message (مدل پیام این پروژه)
    // در این پروژه Message قبلاً با فیلدهای content و role (enum: USER/ADMIN) استفاده شده
    const msg = await prisma.message.create({
      data: {
        sessionId: session.id,
        content,
        role: "USER" as any,
      },
      select: { id: true, sessionId: true, content: true, role: true, createdAt: true },
    });

    // آپدیت آخرین فعالیت سشن (اگر فیلد وجود دارد)
    try {
      await prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      });
    } catch {
      /* نادیده بگیر */
    }

    return NextResponse.json({ session, message: msg }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Create livechat session failed", detail: e?.message || String(e) },
      { status: 400 }
    );
  }
}
