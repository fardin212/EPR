"use client";

import { useEffect, useRef, useState } from "react";

type ChatMsg = {
  id: string;
  role: "user" | "admin" | "system";
  text: string;
  at: number;
};

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      id: "hi",
      role: "system",
      text: "سلام! هر سوالی دربارهٔ سفارش کانکس، تعمیرات یا قیمت دارید بپرسید.",
      at: Date.now(),
    },
  ]);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open || !boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        // عمداً اینجا بسته نمی‌کنیم
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    const my: ChatMsg = { id: crypto.randomUUID(), role: "user", text, at: Date.now() };
    setMsgs((m) => [...m, my]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/live-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.reply) {
        const bot: ChatMsg = {
          id: crypto.randomUUID(),
          role: "admin",
          text: String(data.reply),
          at: Date.now(),
        };
        setMsgs((m) => [...m, bot]);
      }
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* دکمه‌ی شناور چپ */}
      <button
        aria-label="گفتگوی آنلاین"
        className="chat-fab-left"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M2 5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H9l-5 4v-4H5a3 3 0 0 1-3-3V5z" />
        </svg>
        <span className="hidden sm:inline">چت آنلاین</span>
      </button>

      {/* پنل چت */}
      <div className={`chat-panel-left ${open ? "show" : ""}`} ref={boxRef} role="dialog" aria-modal="false">
        <div className="chat-header bg-[var(--surface)] text-[var(--text)] border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <span className="chat-dot-online" />
            <strong>پشتیبانی نیکان</strong>
          </div>
          <button className="chat-close text-[var(--muted)] hover:text-[var(--text)]" onClick={() => setOpen(false)} aria-label="بستن">×</button>
        </div>

        <div className="chat-body bg-[var(--surface)]">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`chat-bubble ${m.role} ${
                m.role === "user"
                  ? "bg-[var(--brand)] text-white"
                  : m.role === "admin"
                  ? "bg-[var(--surface)] border border-[var(--line)] text-[var(--text)]"
                  : "bg-[var(--surface)] text-[var(--muted)]"
              }`}
            >
              <p className="m-0">{m.text}</p>
              <span className="time text-[10px] text-[var(--muted)]">
                {new Date(m.at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>

        <div className="chat-input bg-[var(--surface)] border-t border-[var(--line)]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="پیام خود را بنویسید…"
            disabled={busy}
            className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="chat-send rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-600)] text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            ارسال
          </button>
        </div>

        {/* شورت‌کات‌ها */}
        <div className="chat-quick">
          <a
            className="chat-quick-btn wa bg-[var(--surface)] border border-[var(--line)] text-[var(--text)] hover:bg-[var(--surface)]/80"
            href="https://wa.me/989124237146"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor"><path d="M19.11 17.34c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.16-.2.3-.77.97-.95 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.14 4.53.72.31 1.28.49 1.72.63.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.2-.58-.35z"/><path d="M26.67 5.33A13.32 13.32 0 1 0 4.1 24.02L3 29l5.08-1.07a13.32 13.32 0 1 0 18.59-22.6zM16 27.33a11.32 11.32 0 0 1-5.76-1.57l-.41-.24-3.04.64.64-2.96-.26-.48a11.34 11.34 0 1 1 8.83 4.61z"/></svg>
          </a>
          <a
            className="chat-quick-btn tg bg-[var(--surface)] border border-[var(--line)] text-[var(--text)] hover:bg-[var(--surface)]/80"
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            title="Telegram"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M9.04 15.29l-.37 5.29c.53 0 .76-.23 1.04-.51l2.5-2.4 5.18 3.78c.95.53 1.62.25 1.88-.88l3.42-15.98h.01c.3-1.4-.5-1.95-1.42-1.6L1.76 9.26C.4 9.8.42 10.6 1.53 10.94l5.67 1.77 13.17-8.3c.62-.38 1.18-.17.72.21"/></svg>
          </a>
        </div>
      </div>
    </>
  );
}
