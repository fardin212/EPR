// lib/chatEvents.ts
type Controller = ReadableStreamDefaultController;
type SessionId = number;

const g = globalThis as any;
if (!g.__chatSubs) {
  g.__chatSubs = new Map<SessionId, Set<Controller>>();
}
const subs: Map<SessionId, Set<Controller>> = g.__chatSubs;

export function addSubscriber(id: SessionId, ctrl: Controller) {
  let set = subs.get(id);
  if (!set) { set = new Set(); subs.set(id, set); }
  set.add(ctrl);
}

export function removeSubscriber(id: SessionId, ctrl: Controller) {
  const set = subs.get(id);
  if (!set) return;
  set.delete(ctrl);
  if (set.size === 0) subs.delete(id);
}

export function broadcast(id: SessionId, evt: any) {
  const set = subs.get(id);
  if (!set || set.size === 0) return;
  const payload = `event: message\ndata: ${JSON.stringify(evt)}\n\n`;
  const enc = new TextEncoder();
  for (const c of set) {
    try { c.enqueue(enc.encode(payload)); } catch {}
  }
}
