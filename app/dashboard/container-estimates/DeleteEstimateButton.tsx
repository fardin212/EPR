"use client";

import { useTransition } from "react";
import { deleteContainerEstimateAction } from "./actions";

export default function DeleteEstimateButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        const ok = confirm("این پیش‌فاکتور و اطلاعات BOM آن حذف شود؟");
        if (!ok) return;

        startTransition(async () => {
          await deleteContainerEstimateAction(fd);
        });
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {pending ? "در حال حذف..." : "حذف"}
      </button>
    </form>
  );
}
