"use client";

import { useEffect, useRef, useState } from "react";

type Session = { id: number; createdAt: string; userName?: string | null };
type Message = {
  id: number;
  createdAt: string;
  sessionId: number;
  sender: "user" | "admin";
  text: string;
};

export default function ChatAdmin() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const lastIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSessions = async () => {
    const r = await fetch("/api/chat/sessions", { cache: "no-store" });
    const data: Session[] = await r.json();
    setSessions(data);
    if (!selected && data.length) setSelected(data[0]);
  };

  useEffect(() => {
    loadSessions();
    const t = setInterval(loadSessions, 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!selected) return;

    const fetchNew = async () => {
      const r = await fetch(
        `/api/chat/messages?sessionId=${selected.id}&afterId=${lastIdRef.current}`,
        { cache: "no-store" }
      );
      const data: Message[] = await r.json();
      if (data.length) {
        lastIdRef.current = Math.max(lastIdRef.current, ...data.map((m) => m.id));
        setMessages((prev) => {
          const merged = [...prev, ...data];
          const map = new Map<number, Message>();
          for (const m of merged) map.set(m.id, m);
          return Array.from(map.values()).sort((a, b) => a.id - b.id);
        });
      }
    };

    setMessages([]);
    lastIdRef.current = 0;
    fetchNew();

    pollRef.current = setInterval(fetchNew, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selected?.id]);

  const send = async () => {
    const t = text.trim();
    if (!t || !selected) return;
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selected.id, sender: "admin", text: t }),
    });
    setText("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <aside className="lg:col-span-4 xl:col-span-3 card p-3">
        <div className="mb-2 font-semibold">سشن‌ها</div>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={
                "w-full text-right rounded-lg px-3 py-2 border" +
                (selected?.id === s.id
                  ? " bg-brand/5 border-brand text-brand-700"
                  : " bg-white/50 hover:bg-muted")
              }
            >
              <div className="text-sm font-medium">
                #{s.id} {s.userName ? `— ${s.userName}` : ""}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(s.createdAt).toLocaleString("fa-IR")}
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="text-sm text-muted-foreground">سشنی موجود نیست.</div>
          )}
        </div>
      </aside>

      <section className="lg:col-span-8 xl:col-span-9 card p-4">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b hr-soft pb-3 mb-3">
              <div className="font-semibold">
                گفتگو با سشن #{selected.id}
                {selected.userName ? ` — ${selected.userName}` : ""}
              </div>
              <div className="text-xs text-muted-foreground">
                ایجاد: {new Date(selected.createdAt).toLocaleString("fa-IR")}
              </div>
            </div>

            <div className="h-[60vh] overflow-y-auto space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.sender === "admin"
                      ? "chat-bubble chat-bubble-admin"
                      : "chat-bubble chat-bubble-user"
                  }
                  title={new Date(m.createdAt).toLocaleString("fa-IR")}
                >
                  {m.text}
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  پیامی موجود نیست.
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                className="input flex-1"
                dir="rtl"
                value={text}
                placeholder="پاسخ ادمین…"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button className="btn-primary" onClick={send} disabled={!text.trim()}>
                ارسال
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">یک سشن را انتخاب کنید.</div>
        )}
      </section>
    </div>
  );
}
