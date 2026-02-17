import { NextResponse } from "next/server";
type ChatStatusLocal = "OPEN" | "CLOSED" | "ARCHIVED";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

type Action = "archive" | "close" | "reopen" | "delete";

export async function POST(req: Request) {
  try {
    let action: Action | null = null;
    let ids: number[] = [];

    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      action = body?.action as Action;
      ids = Array.isArray(body?.ids) ? body.ids.map((x: any) => Number(x)).filter(Number.isFinite) : [];
    } else {
      const fd = await req.formData();
      action = String(fd.get("action") || "") as Action;
      ids = fd.getAll("ids[]").map((x) => Number(x)).filter(Number.isFinite);
    }

    if (!action || ids.length === 0) {
      return NextResponse.json({ ok: false, error: "BAD_INPUT" }, { status: 400 });
    }

    if (action === "delete") {
      // Message رابطه‌اش onDelete: Cascade است؛ حذف Session کافی است
      await prisma.chatSession.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ ok: true, count: ids.length });
    }

    const status: ChatStatusLocal = action === "archive" ? "ARCHIVED" : action === "close" ? "CLOSED" : "OPEN";
    await prisma.chatSession.updateMany({ where: { id: { in: ids } }, data: { status } });

    return NextResponse.json({ ok: true, count: ids.length, status });
  } catch (e) {
    console.error("ADMIN_BULK_ERROR", e);
    return NextResponse.json({ ok: false, error: "INTERNAL" }, { status: 500 });
  }
}
