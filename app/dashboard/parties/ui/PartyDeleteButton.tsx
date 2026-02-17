"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PartyDeleteButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = confirm(`حذف طرف‌حساب «${name}»؟\nاین عملیات قابل بازگشت نیست.`);
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/parties/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "حذف انجام نشد.");
        return;
      }

      router.refresh();
    } catch (e) {
      alert("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className={[
        "h-9 px-3 rounded-xl text-sm border transition",
        "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      ].join(" ")}
      title="حذف"
    >
      {loading ? "..." : "حذف"}
    </button>
  );
}
