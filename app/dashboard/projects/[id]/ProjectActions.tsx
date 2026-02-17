"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectActions({ projectId }: { projectId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (loading || finishing) return;

    const ok = confirm("این پروژه حذف شود؟ (حذف نرم انجام می‌شود)");
    if (!ok) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });

      let payload: any = null;
      try {
        payload = await res.json();
      } catch {}

      if (!res.ok) {
        if (res.status === 403) setError("شما اجازه حذف این پروژه را ندارید.");
        else setError(payload?.error || "خطا در حذف پروژه");
        return;
      }

      router.replace("/dashboard/projects");
    } finally {
      setLoading(false);
    }
  }

  function onEdit() {
    if (loading || finishing) return;
    router.push(`/dashboard/projects/${projectId}/edit`);
  }

  async function onFinish() {
    if (loading || finishing) return;

    const ok = confirm("پروژه «تکمیل شده» شود؟ تاریخ پایان هم همین الان ثبت می‌شود.");
    if (!ok) return;

    setFinishing(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED", // ✅ مقدار صحیح enum
          endDate: new Date().toISOString(), // ✅ ثبت تاریخ پایان
        }),
      });

      let payload: any = null;
      try {
        payload = await res.json();
      } catch {}

      if (!res.ok) {
        setError(payload?.error || "خطا در اتمام پروژه");
        return;
      }

      // رفرش صفحه تا وضعیت جدید بیاد
      router.refresh();
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          disabled={loading || finishing}
          className="px-3 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60"
        >
          ویرایش
        </button>

        <button
          onClick={onDelete}
          disabled={loading || finishing}
          className="px-3 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white disabled:opacity-60"
        >
          {loading ? "در حال حذف..." : "حذف"}
        </button>

        <button
          onClick={onFinish}
          disabled={loading || finishing}
          className="px-3 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60"
        >
          {finishing ? "در حال اتمام..." : "اتمام پروژه"}
        </button>
      </div>
    </div>
  );
}
