// lib/adminEvents.ts — کانال عمومی ادمین‌ها
type Controller = ReadableStreamDefaultController;

const g = globalThis as any;
if (!g.__adminSubs) g.__adminSubs = new Set<Controller>();
const subs: Set<Controller> = g.__adminSubs;

export function adminAdd(ctrl: Controller) { subs.add(ctrl); }
export function adminRemove(ctrl: Controller) { subs.delete(ctrl); }
export function adminBroadcast(evt: any) {
  if (!subs.size) return;
  const enc = new TextEncoder();
  const payload = `event: notify\ndata: ${JSON.stringify(evt)}\n\n`;
  for (const c of subs) { try { c.enqueue(enc.encode(payload)); } catch {} }
}
