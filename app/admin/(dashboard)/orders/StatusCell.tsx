// app/admin/(dashboard)/orders/StatusCell.tsx
"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "./actions";

// لیبل فارسی برای همه وضعیت‌های ممکن
export const STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  NEW: "جدید",
  SEEN: "دیده‌شده",
  QUOTED: "قیمت‌دادیم",
  WON: "قطعی",
  LOST: "لغو/از دست‌رفته",
  DONE: "انجام‌شده",
  IN_PROGRESS: "در حال انجام",
  NOT_DONE: "انجام‌نشده",
  ARCHIVED: "آرشیو شده",
};

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  SEEN: "bg-slate-100 text-slate-700 border-slate-200",
  QUOTED: "bg-amber-100 text-amber-800 border-amber-200",
  WON: "bg-emerald-100 text-emerald-800 border-emerald-200",
  LOST: "bg-rose-100 text-rose-800 border-rose-200",
  DONE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-800 border-indigo-200",
  NOT_DONE: "bg-gray-100 text-gray-700 border-gray-200",
  ARCHIVED: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

// وضعیت‌هایی که از داخل dropdown قابل انتخاب هستند
const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "NEW", label: "جدید" },
  { value: "SEEN", label: "دیده‌شده" },
  { value: "QUOTED", label: "قیمت‌دادیم" },
  { value: "WON", label: "قطعی" },
  { value: "LOST", label: "لغو/از دست‌رفته" },
];

export function StatusCell({
  orderId,
  status,
}: {
  orderId: number;
  status: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();

  const label = STATUS_LABELS[status] ?? status;
  const colorClass =
    STATUS_COLORS[status] ??
    "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
          colorClass,
        ].join(" ")}
      >
        {label}
      </span>

      <select
        className="text-[11px] rounded-lg border border-[var(--line)] bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
        value={status}
        disabled={isPending}
        onChange={(e) => {
          const value = e.target.value as OrderStatus;
          startTransition(async () => {
            try {
              await updateOrderStatus(orderId, value);
            } catch (err) {
              console.error("ORDER_STATUS_UPDATE_ERROR", err);
              alert("در بروزرسانی وضعیت سفارش مشکلی پیش آمد.");
            }
          });
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
