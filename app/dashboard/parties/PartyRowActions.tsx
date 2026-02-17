// app/dashboard/parties/PartyRowActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PartyRowActions({
  id,
  name,
  editHref,
}: {
  id: number | string;
  name: string;
  editHref: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm(`حذف "${name}" انجام شود؟ این عملیات قابل بازگشت نیست.`);
    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/parties/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Delete failed");
      }

      router.refresh();
    } catch (e: any) {
      alert("خطا در حذف طرف‌حساب. لطفاً دوباره تلاش کنید.\n" + (e?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={editHref}
        className="h-8 inline-flex items-center justify-center rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-3 text-[11px] hover:bg-[color:var(--surface-soft)] transition"
      >
        ویرایش
      </a>

      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="h-8 inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 text-[11px] text-red-700 hover:bg-red-100 transition disabled:opacity-60"
        title="حذف"
      >
        {loading ? "..." : "حذف"}
      </button>
    </div>
  );
}
