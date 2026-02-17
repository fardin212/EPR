"use client";

import { useMemo, useState } from "react";

type Props = {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
};

export default function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "قبل",
  afterLabel = "بعد",
}: Props) {
  const [p, setP] = useState(55);

  const clip = useMemo(() => {
    const v = Math.max(0, Math.min(100, p));
    return `inset(0 ${100 - v}% 0 0)`;
  }, [p]);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white">
      <div className="relative aspect-[16/7]">
        {/* AFTER (زیر) */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* BEFORE (رو) */}
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: clip }}
        />

        {/* Labels */}
        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          {beforeLabel}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          {afterLabel}
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 h-full w-[2px] bg-white/60 shadow"
          style={{ left: `${p}%` }}
        />

        {/* Range */}
        <input
          aria-label="Before After slider"
          type="range"
          min={0}
          max={100}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-ew-resize"
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-gray-600">
        <span>قبل</span>
        <span>بکشید ↔</span>
        <span>بعد</span>
      </div>
    </div>
  );
}
