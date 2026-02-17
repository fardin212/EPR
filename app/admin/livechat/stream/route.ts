// app/admin/livechat/stream/route.ts
import { getSubs } from "@/lib/livechat-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const subs = getSubs();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      subs.add(controller);
      const init = `event: open\ndata: ${JSON.stringify({ ok: true })}\n\n`;
      controller.enqueue(new TextEncoder().encode(init));
    },
    cancel() {
      // حذف خودکار با بستن استریم انجام می‌شود
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
