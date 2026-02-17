type BadgeStatus = "ready" | "minor-fix" | "refurbished" | "temporary";

const badgeMap: Record<
  BadgeStatus,
  { label: string; classes: string; hint: string }
> = {
  ready: {
    label: "🟢 آماده تحویل",
    classes:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    hint: "قابل تحویل فوری (بدون نیاز به تعمیر)",
  },
  "minor-fix": {
    label: "🟡 بازسازی جزئی",
    classes:
      "bg-amber-50 text-amber-800 border-amber-200",
    hint: "تعمیر سبک لازم دارد (تحویل ۳–۵ روزه)",
  },
  refurbished: {
    label: "🔵 بازسازی‌شده",
    classes:
      "bg-sky-50 text-sky-700 border-sky-200",
    hint: "کاملاً بازسازی شده و آماده بهره‌برداری",
  },
  temporary: {
    label: "🔴 پروژه موقت",
    classes:
      "bg-rose-50 text-rose-700 border-rose-200",
    hint: "اقتصادی برای استفاده کوتاه‌مدت",
  },
};

export default function StatusBadge({ status }: { status: BadgeStatus }) {
  const b = badgeMap[status];
  return (
    <span
      title={b.hint}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        b.classes,
      ].join(" ")}
    >
      {b.label}
    </span>
  );
}

export type { BadgeStatus };
