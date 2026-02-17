// lib/chatBus.ts
type ChatEvent = { sessionId: number; role: "USER" | "ADMIN"; content: string; createdAt: string; clientId?: string };
type Subscriber = (e: ChatEvent) => void;

type Bus = {
  subscribe: (sid: number, fn: Subscriber) => () => void;
  publish: (e: ChatEvent) => void;
};

declare global {
  // eslint-disable-next-line no-var
  var __chat_bus__: Bus | undefined;
}

function createBus(): Bus {
  const map = new Map<number, Set<Subscriber>>();
  return {
    subscribe(sessionId, fn) {
      const set = map.get(sessionId) ?? new Set<Subscriber>();
      set.add(fn);
      map.set(sessionId, set);
      return () => {
        set.delete(fn);
        if (set.size === 0) map.delete(sessionId);
      };
    },
    publish(e) {
      const set = map.get(e.sessionId);
      if (!set) return;
      for (const fn of set) {
        try { fn(e); } catch {}
      }
    },
  };
}

export const chatBus: Bus = globalThis.__chat_bus__ || (globalThis.__chat_bus__ = createBus());
