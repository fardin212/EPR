"use client";

import { useTransition } from "react";

export default function DeleteGuideButton({
  onDelete,
}: {
  onDelete: () => Promise<void>;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("راهنما حذف شود؟")) return;
        start(async () => onDelete());
      }}
      disabled={pending}
      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
      type="button"
    >
      {pending ? "در حال حذف..." : "حذف راهنما"}
    </button>
  );
}
