// app/api/livechat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// چک ادمین (Next 15/16: cookies() async)
async function isAdmin() {
  const ck = (await cookies()).get("admin_key")?.value || "";
  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  return !!ADMIN_KEY && ck === ADMIN_KEY;
}

/**
 * GET /api/livechat/messages?sessionId=...&afterId=...
 * تا 100 پیام برای یک سشن؛ اگر afterId باشد (string/uuid)، فقط پیام‌های با id بزرگ‌تر (lexicographic).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const sessionIdParam = searchParams.get("sessionId");
  const afterId = searchParams.get("afterId") || undefined;

  // فیلتر چندحالته (به‌عنوان any تا با هر اسکیمایی سازگار شود)
  const where: any = {};
  if (sessionIdParam != null) {
    const asNumber = Number(sessionIdParam);
    const sid: any = Number.isFinite(asNumber) ? asNumber : String(sessionIdParam);

    // تلاش: هم به‌صورت رابطه، هم فیلدهای اسکالرِ رایج
    where.OR = [
      { session: { id: sid } },       // اگر relation داشته باشید
      { sessionId: sid },             // اگر فیلد sessionId داشته باشید
      { chatSessionId: sid },         // اگر نام متفاوت باشد
      { clientSessionId: sid },       // یک نام رایج دیگر
    ];
  }
  if (afterId) {
    where.id = { gt: afterId };
  }

  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { id: "asc" },
    take: 100,
    // فقط فیلدهای قطعی را انتخاب کن که تایپ‌اسکریپت گیر ندهد
    select: {
      id: true,
      text: true,
      createdAt: true,
    } as any,
  });

  return NextResponse.json(messages);
}

/**
 * POST /api/livechat/messages
 * Body: { sessionId: string|number, content?: string, text?: string }
 */
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sidRaw = body.sessionId;
  if (sidRaw == null || sidRaw === "") {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }
  const sidNum = Number(sidRaw);
  const sid: any = Number.isFinite(sidNum) ? sidNum : String(sidRaw);

  const text = String((body.content ?? body.text) ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Message text is required" }, { status: 400 });
  }

  // چند تلاش پیاپی با امضاهای مختلف اسکیمای محتمل
  const attempts: any[] = [
    // 1) رابطه‌ی session
    { text, session: { connect: { id: sid } } },
    // 2) اسکالرهای رایج
    { text, sessionId: sid },
    { text, chatSessionId: sid },
    { text, clientSessionId: sid },
  ];

  for (const data of attempts) {
    try {
      const msg = await prisma.chatMessage.create({
        data: data as any,
        select: {
          id: true,
          text: true,
          createdAt: true,
        } as any,
      });

      // تلاش برای آپدیت آخرین فعالیت سشن (اگر چنین جدولی/فیلدی دارید)
      try {
        await prisma.chatSession.update({
          where: { id: sid },
          data: { updatedAt: new Date() },
        } as any);
      } catch {
        // اگر مدل متفاوت بود مشکلی نیست
      }

      return NextResponse.json(msg, { status: 201 });
    } catch (e) {
      // می‌رویم سراغ تلاش بعدی
    }
  }

  return NextResponse.json(
    { error: "Create message failed", detail: "No compatible schema (session/sessionId/chatSessionId/clientSessionId) matched." },
    { status: 400 }
  );
}

/**
 * DELETE /api/livechat/messages
 * Body: { id: string }  → فقط ادمین
 */
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = String(body.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    await prisma.chatMessage.delete({ where: { id } } as any);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Delete failed", detail: e?.message || String(e) },
      { status: 400 }
    );
  }
}
