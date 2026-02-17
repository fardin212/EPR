// app/api/chat/sessions/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SID_COOKIE = "chat_sid";

export async function GET(req: Request) {
  try {
    const jar = cookies();
    const url = new URL(req.url);
    const search = url.searchParams;

    // 1) اگر ?id= داشت، بر اساس همان بخوان
    // 2) وگرنه از روی کوکی سعی کن سشن را پیدا کنی
    let sidRaw: string | null = search.get("id");
    if (!sidRaw) {
      sidRaw = jar.get(SID_COOKIE)?.value ?? null;
    }

    let session =
      sidRaw && Number(sidRaw)
        ? await prisma.chatSession
            .findUnique({
              where: { id: Number(sidRaw) },
            })
            .catch(() => null)
        : null;

    // اگر سشن پیدا نشد و کاربر id مشخص نکرده بود → سشن جدید بساز
    if (!session && !search.get("id")) {
      session = await prisma.chatSession.create({
        data: {
          status: "OPEN",
          source: "ONLINE",
          lastMessageAt: null,
          name: null,
          phone: null,
        },
      });

      sidRaw = String(session.id);
      jar.set(SID_COOKIE, sidRaw, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 روز
      });
    }

    if (!session) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true, createdAt: true },
      take: 100,
    });

    return NextResponse.json({
      ok: true,
      // این فیلد برای سازگاری با فرانت: json.id
      id: session.id,
      session: {
        id: session.id,
        name: session.name || "",
        phone: session.phone || "",
        source: session.source || "ONLINE",
        status: session.status,
        updatedAt: session.updatedAt,
        messages,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "FAILED" },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;

    const name =
      typeof body?.name === "string" && body.name.trim()
        ? body.name.trim()
        : null;
    const phone =
      typeof body?.phone === "string" && body.phone.trim()
        ? body.phone.trim()
        : null;
    const source =
      typeof body?.source === "string" && body.source.trim()
        ? body.source.trim()
        : "ONLINE";

    const session = await prisma.chatSession.create({
      data: {
        name,
        phone,
        source,
        status: "OPEN",
        lastMessageAt: null,
      },
    });

    cookies().set(SID_COOKIE, String(session.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({
      ok: true,
      // برای فرانت: json.id
      id: session.id,
      session: {
        id: session.id,
        name: session.name || "",
        phone: session.phone || "",
        source: session.source || "ONLINE",
        status: session.status,
        updatedAt: session.updatedAt,
        messages: [] as any[],
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "FAILED" },
      { status: 400 }
    );
  }
}
