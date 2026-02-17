"use client";


import { useState } from "react";

export default function StatusBadge({ value, id }: { value: any; id: number }) {
  const [v, setV] = useState<any>(value);

  async function change(next: any) {
    setV(next);
    try {
      await fetch("/api/admin/chat/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: next === "ARCHIVED" ? "archive" : next === "CLOSED" ? "close" : "reopen",
          ids: [id],
        }),
      });
    } catch {}
  }

  // حالت انتخاب‌شده: طلایی (accent)
  const style =
    v === "OPEN"
      ? "bg-[var(--accent)]/15 text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
      : v === "CLOSED"
      ? "bg-[var(--muted)]/10 text-[var(--muted)]"
      : "bg-[var(--muted)]/15 text-[var(--muted)]";

  return (
    <div className="relative group">
      <span className={`px-2 py-1 rounded-lg text-xs ${style}`}>
        {v === "OPEN" ? "باز" : v === "CLOSED" ? "بسته" : "بایگانی"}
      </span>

      {/* منوی تغییر وضعیت */}
      <div className="absolute top-full mt-1 right-0 hidden group-hover:block rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-lg text-sm overflow-hidden min-w-[140px]">
        <button
          onClick={() => change("OPEN")}
          className="block w-full text-right px-3 py-1.5 hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]"
        >
          باز
        </button>
        <button
          onClick={() => change("CLOSED")}
          className="block w-full text-right px-3 py-1.5 hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]"
        >
          بستن
        </button>
        <button
          onClick={() => change("ARCHIVED")}
          className="block w-full text-right px-3 py-1.5 hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]"
        >
          بایگانی
        </button>
      </div>
    </div>
  );
}
