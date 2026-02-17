// app/api/admin/livechat/sessions/route.ts

type Ctrl = {
  enqueue: (chunk: Uint8Array) => void;
  close: () => void;
};

declare global {
  // رجیستری مشترک برای کانکشن‌های SSE ادمین
  // eslint-disable-next-line no-var
  var __adminSubs: Set<Ctrl> | undefined;
}

const subs: Set<Ctrl> = globalThis.__adminSubs ?? (globalThis.__adminSubs = new Set());

function notifyAll(evt: unknown) {
  if (!subs.size) return;
  const enc = new TextEncoder();
  const payload = `event: notify\ndata: ${JSON.stringify(evt)}\n\n`;
  for (const c of subs) {
    try {
      c.enqueue(enc.encode(payload));
    } catch {
      // اتصال بسته شده باشد مشکلی نیست
    }
  }
}

export async function GET() {
  let ctrlRef: Ctrl | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      ctrlRef = {
        enqueue: (chunk) => controller.enqueue(chunk),
        close: () => controller.close(),
      };
      subs.add(ctrlRef);

      // پیام اولیه + پینگ‌های سبک (اختیاری)
      controller.enqueue(enc.encode(': connected\n\n'));
      // اگر خواستی پینگ دوره‌ای:
      // const t = setInterval(() => controller.enqueue(enc.encode(': ping\n\n')), 15000);
      // (Cancel cleanup پایین انجام می‌شود)
    },
    cancel() {
      if (ctrlRef) subs.delete(ctrlRef);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    notifyAll({ type: 'admin', ...body });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const runtime = 'nodejs'; // اجباری نیست ولی صریح می‌کنیم تا Edge/WASM درگیر نشود
