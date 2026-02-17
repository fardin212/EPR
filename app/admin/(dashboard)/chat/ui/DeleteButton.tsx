// app/admin/(dashboard)/chat/ui/DeleteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("حذف این گفت‌وگو؟ این کار قابل بازگشت نیست.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat/admin/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete", ids: [id] }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/chat");
      router.refresh();
    } catch {
      alert("حذف انجام نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-2 rounded-xl border border-[var(--line)] text-rose-600 hover:bg-rose-50 text-sm disabled:opacity-50"
    >
      {loading ? "در حال حذف…" : "حذف"}
    </button>
  );
}
