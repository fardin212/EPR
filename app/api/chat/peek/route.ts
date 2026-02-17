import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // ⚠️ این هم باید await شود
  const cookieStore = await cookies();
  const id = cookieStore.get("chat_session_id")?.value;
  const sessionId = id ? Number(id) : null;
  return NextResponse.json({
    ok: true,
    sessionId: Number.isFinite(sessionId || NaN) ? sessionId : null,
  });
}
