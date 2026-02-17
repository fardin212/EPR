// lib/livechat-bus.ts
type Ctrl = ReadableStreamDefaultController<Uint8Array>;
type GlobalWithSubs = typeof globalThis & { __adminSubs?: Set<Ctrl> };

function getSubs() {
  const g = globalThis as GlobalWithSubs;
  g.__adminSubs ??= new Set<Ctrl>();
  return g.__adminSubs;
}

export function adminNotify(evt: unknown) {
  const subs = getSubs();
  if (!subs.size) return;
  const enc = new TextEncoder();
  const payload = `event: notify\ndata: ${JSON.stringify(evt)}\n\n`;
  for (const c of subs) {
    try { c.enqueue(enc.encode(payload)); } catch {}
  }
}

export { getSubs };
