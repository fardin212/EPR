// components/admin/ProjectImageField.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

type Props = {
  label?: string;
  /**
   * نام فیلدی که در FormData به سرور ارسال می‌شود.
   * برای تصویر اصلی پروژه حتماً "imageUrl" باشد.
   */
  name?: string;
  /**
   * آدرس اولیه در حالت ویرایش (مثلاً از دیتابیس)
   */
  defaultUrl?: string;
};

export default function ProjectImageField({
  label = "تصویر اصلی پروژه",
  name = "imageUrl",
  defaultUrl = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState<string>(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    console.log("🟢 [ProjectImageField] defaultUrl changed:", defaultUrl);
    setUrl(defaultUrl || "");
  }, [defaultUrl]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📤 [ProjectImageField] FILE PICKED:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    setLoading(true);
    setErr(null);

    try {
      const fd = new FormData();
      fd.append("file", file); // ✅ با /api/upload هماهنگ

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({} as any));

      console.log("📤 [ProjectImageField] UPLOAD RESPONSE:", {
        status: res.status,
        body: json,
      });

      if (!res.ok || !json?.ok || !json.url) {
        let msg = "آپلود انجام نشد.";
        if (json?.error === "UNAUTHORIZED") msg = "دسترسی ادمین ندارید.";
        if (json?.error === "INVALID_TYPE")
          msg = "فقط فرمت‌های JPG, PNG, WEBP مجاز است.";
        if (json?.error === "TOO_LARGE")
          msg = "حجم فایل بیشتر از ۵ مگابایت است.";
        throw new Error(msg);
      }

      setUrl(json.url as string);
    } catch (e: any) {
      console.error("❌ [ProjectImageField] UPLOAD ERROR:", e);
      setErr(e?.message || "خطا در آپلود. دوباره امتحان کنید.");
      setUrl("");
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-bold text-[var(--text)]">{label}</div>

      {/* ✅ این مقدار در submit فرم به سرور می‌رود */}
      {url && <input type="hidden" name={name} value={url} />}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPickFile}
          className="block w-full text-sm"
        />

        {loading && (
          <span className="text-xs text-[var(--muted)]">
            در حال آپلود...
          </span>
        )}
      </div>

      {err && <div className="text-xs text-rose-600">{err}</div>}

      {url && (
        <div className="mt-2">
          <img
            src={url}
            alt="پیش‌نمایش تصویر"
            className="w-full max-w-md rounded-xl border border-[var(--line)] object-cover"
          />
          <div className="mt-1 text-xs text-[var(--muted)] ltr">{url}</div>
        </div>
      )}
    </div>
  );
}
