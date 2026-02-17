// app/api/chat/admin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = (url.searchParams.get("status") || "OPEN").toUpperCase();

    const where: any = {
      deletedAt: null,
    };

    if (["OPEN", "CLOSED", "ARCHIVED", "SPAM"].includes(statusParam)) {
      where.status = statusParam;
    }

    const sessions = await prisma.chatSession.findMany({
      where,
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, content: true, role: true, createdAt: true },
        },
      },
      take: 200,
    });

    const rows = sessions.map((s) => ({
      id: s.id,
      status: s.status,
      stage: s.stage,
      lastActive: (s.lastMessageAt || s.updatedAt).toISOString(),
      lastMessage: s.messages[0]
        ? {
            id: s.messages[0].id,
            content: s.messages[0].content,
            role: s.messages[0].role,
            createdAt: s.messages[0].createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({ ok: true, sessions: rows });
  } catch (e) {
    console.error("ADMIN_SESSIONS_ERROR", e);
    return NextResponse.json(
      { ok: false, error: "FAILED" },
      { status: 500 }
    );
  }
}
