import { NextResponse } from "next/server";
import { chatBus } from "@/lib/chatBus";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const { id } =
    "then" in (ctx.params as any)
      ? await (ctx.params as Promise<{ id: string }>)
      : (ctx.params as { id: string });

  const sessionId = Number(id);
  if (!Number.isFinite(sessionId)) return new NextResponse("Bad id", { status: 400 });

  let stopped = false;
  let unSub: (() => void) | null = null;
  let hb: any = null;

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();

      const safeEnqueue = (s: string) => {
        if (stopped) return;
        try {
          controller.enqueue(enc.encode(s));
        } catch {
          stop();
        }
      };

      const send = (obj: any) => safeEnqueue(`data: ${JSON.stringify(obj)}\n\n`);

      // hello
      send({ type: "hello", sessionId, ts: Date.now() });

      // subscribe
      unSub = chatBus.subscribe(sessionId, (e) => send({ type: "message", ...e }));

      // heartbeat
      hb = setInterval(() => safeEnqueue(": ping\n\n"), 15000);

      // قطع اتصال از سمت کلاینت/سرور
      const stop = () => {
        if (stopped) return;
        stopped = true;
        try { if (hb) clearInterval(hb); } catch {}
        try { unSub?.(); } catch {}
        try { controller.close(); } catch {}
      };

      // اگر درخواست لغو شد
      // @ts-ignore
      (controller as any)._stop = stop;

      // اگر اتصال از سمت کلاینت بسته شد
      try {
        // @ts-ignore
        req.signal?.addEventListener("abort", stop, { once: true });
      } catch {}
    },
    cancel() {
      // @ts-ignore
      this._stop?.();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
