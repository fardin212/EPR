// app/api/chat/sessions/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const sid = Number(id);

  if (!Number.isFinite(sid) || sid <= 0) {
    return new NextResponse("bad id", { status: 400 });
  }

  const session = await prisma.chatSession.findUnique({
    where: { id: sid },
  });

  if (!session) {
    return new NextResponse("not found", { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { sessionId: sid },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
    take: 100,
  });

  return NextResponse.json({
    ok: true,
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
}
