// app/api/chat/admin/session/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type ChatStatus = "OPEN" | "CLOSED" | "ARCHIVED" | "SPAM";
type ChatStage = "NEW" | "IN_PROGRESS" | "DONE";

export async function PATCH(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const sessionId = Number(body.sessionId);

    if (!Number.isFinite(sessionId)) {
      return NextResponse.json(
        { ok: false, error: "BAD_SESSION_ID" },
        { status: 400 }
      );
    }

    const data: any = {};

    if (typeof body.status === "string") {
      const st = body.status.toUpperCase() as ChatStatus;
      if (["OPEN", "CLOSED", "ARCHIVED", "SPAM"].includes(st)) {
        data.status = st;
      }
    }

    if (typeof body.stage === "string") {
      const sg = body.stage.toUpperCase() as ChatStage;
      if (["NEW", "IN_PROGRESS", "DONE"].includes(sg)) {
        data.stage = sg;
      }
    }

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { ok: false, error: "NOTHING_TO_UPDATE" },
        { status: 400 }
      );
    }

    data.updatedAt = new Date();

    const updated = await prisma.chatSession.update({
      where: { id: sessionId },
      data,
      select: {
        id: true,
        status: true,
        stage: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, session: updated });
  } catch (e) {
    console.error("ADMIN_SESSION_PATCH_ERROR", e);
    return NextResponse.json(
      { ok: false, error: "FAILED" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const sessionId = Number(body.sessionId);

    if (!Number.isFinite(sessionId)) {
      return NextResponse.json(
        { ok: false, error: "BAD_SESSION_ID" },
        { status: 400 }
      );
    }

    const updated = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        deletedAt: new Date(),
        status: "CLOSED",
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, session: updated });
  } catch (e) {
    console.error("ADMIN_SESSION_DELETE_ERROR", e);
    return NextResponse.json(
      { ok: false, error: "FAILED" },
      { status: 500 }
    );
  }
}
