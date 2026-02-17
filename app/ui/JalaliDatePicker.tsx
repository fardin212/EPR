"use client";

import React, { useMemo } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type Props = {
  /** تاریخ ISO میلادی: YYYY-MM-DD */
  value?: string | null;

  /** ✅ نام جدید پیشنهادی */
  onChange?: (iso: string) => void;

  /** ✅ سازگاری با نسخه قبلی پروژه (اگر جایی استفاده شده باشد) */
  onIsoChange?: (iso: string) => void;

  className?: string;
  disabled?: boolean;
};

function toIsoDate(d: Date) {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

export default function JalaliDatePicker({
  value,
  onChange,
  onIsoChange,
  className,
  disabled,
}: Props) {
  const current = useMemo(() => {
    if (!value) return null;
    // value مثل 2026-01-03
    const d = new Date(value + "T00:00:00");
    if (Number.isNaN(d.getTime())) return null;

    // تبدیل تاریخ میلادی به DateObject با نمایش شمسی
    return new DateObject(d).convert(persian);
  }, [value]);

  return (
    <DatePicker
      value={current as any}
      disabled={disabled}
      className={className}
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      onChange={(v) => {
        // اگر کاربر پاک کرد
        if (!v) return;

        // v یک DateObject شمسی است؛ به Date (میلادی) تبدیل می‌کنیم
        const g = (v as DateObject).convert("gregorian").toDate();

        const cb = onIsoChange ?? onChange; // ✅ این خط کل مشکل تو رو حل می‌کنه
        if (typeof cb === "function") cb(toIsoDate(g));
      }}
    />
  );
}
