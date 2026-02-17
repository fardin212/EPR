// components/admin/ImageUploader.tsx
"use client";

import { useState, useRef } from "react";

export default function ImageUploader({
  value,
  onChange,
  label = "انتخاب تصویر",
}: {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setErr(null);
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "UPLOAD_FAILED");
      setPreview(data.url);
      onChange(data.url);
    } catch (e: any) {
      setErr(e?.message || "خطا در آپلود");
    } finally {
      setLoading(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer ${loading ? "opacity-70" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onPick}
        />
        {preview ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="h-24 w-24 object-cover rounded-lg border" />
            <div className="text-sm">
              <div className="font-bold mb-1">تصویر انتخاب شده</div>
              <div className="text-blue-600 break-all">{preview}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-600">
            برای آپلود {label} اینجا کلیک کنید یا فایل را بکشید و رها کنید
          </div>
        )}
      </div>
      {loading && <div className="text-xs text-zinc-500">در حال آپلود...</div>}
      {err && <div className="text-xs text-rose-600">خطا: {err}</div>}
    </div>
  );
}
