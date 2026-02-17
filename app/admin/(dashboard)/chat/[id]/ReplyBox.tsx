"use client";

import { useState } from "react";

type ReplyBoxProps = {
  sessionId: number;
  onSent?: () => void;

  /**
   * قبل از ارسال واقعی، برای optimistic UI صدا زده میشه
   * clientId باید یکتا باشه تا ChatThread بتونه پیام موقت رو track کنه
   */
  onWillSend?: (clientId: string, content: string) => void;
};

export default function ReplyBox({
  sessionId,
  onSent,
  onWillSend,
}: ReplyBoxProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  function makeClientId() {
    // در اکثر runtime ها crypto هست، ولی fallback هم گذاشتیم
    try {
      // @ts-ignore
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        // @ts-ignore
        return crypto.randomUUID();
      }
    } catch {}
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function send() {
    const content = text.trim();
    if (!content || loading) return;

    const clientId = makeClientId();

    // ✅ optimistic hook
    onWillSend?.(clientId, content);

    setLoading(true);
    try {
      const res = await fetch("/api/chat/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content }),
      });

      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "send failed");

      setText("");
      onSent?.(); // اینجا mutate صدا میشه
    } catch (e) {
      // اگر optimistic اضافه شده بود، ChatThread با mutate بعدی sync میشه
      alert("خطا در ارسال پیام");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 items-end">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="پاسخ ادمین..."
        className="flex-1 min-h-[90px] rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]"
        onKeyDown={(e) => {
          // ارسال با Ctrl/Cmd + Enter
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            send();
          }
        }}
      />
      <button
        onClick={send}
        disabled={loading || !text.trim()}
        className="h-[42px] px-4 rounded-xl bg-[var(--brand-blue)] text-white font-bold disabled:opacity-60"
      >
        {loading ? "در حال ارسال..." : "ارسال"}
      </button>
    </div>
  );
}
