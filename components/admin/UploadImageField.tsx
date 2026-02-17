"use client";

import { useState } from "react";
import { IMG_RULES, validateDimensions, UploadKind, human } from "@/lib/imageConstraints";

type Props = {
  label?: string;
  name?: string;            // نام فیلد hidden برای ذخیره URL
  kind: UploadKind;
  defaultValue?: string;
  onUploaded?: (url: string) => void;
};

export default function UploadImageField({ label = "آپلود تصویر", name = "imageUrl", kind, defaultValue = "", onUploaded }: Props) {
  const [url, setUrl] = useState<string>(defaultValue);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function getImageSize(file: File): Promise<{w:number; h:number}> {
    const blobUrl = URL.createObjectURL(file);
    try {
      // روش سریع در مرورگرهای مدرن
      // @ts-ignore
      if (window.createImageBitmap) {
        // @ts-ignore
        const bmp = await createImageBitmap(file);
        return { w: bmp.width, h: bmp.height };
      }
      // fallback
      await new Promise<void>((res, rej) => {
        const img = new Image();
        img.onload = () => { res(); };
        img.onerror = rej;
        img.src = blobUrl;
      });
      const imgEl = document.createElement("img");
      imgEl.src = blobUrl;
      await imgEl.decode?.().catch(()=>{});
      return { w: imgEl.naturalWidth, h: imgEl.naturalHeight };
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // فرمت مجاز
    const okMime = ["image/avif","image/webp","image/jpeg","image/png"];
    if (!okMime.includes(file.type)) {
      setErr("فرمت تصویر مجاز نیست. (AVIF / WebP / JPG / PNG)");
      return;
    }

    setLoading(true);
    try {
      const { w, h } = await getImageSize(file);
      const bytes = file.size;
      const rule = IMG_RULES[kind];
      const msg = validateDimensions(rule, w, h, bytes);
      if (msg) { setErr(msg); return; }

      // ارسال به سرور
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "آپلود ناموفق بود.");
        return;
      }
      setUrl(data.url);
      onUploaded?.(data.url);
    } catch (e: any) {
      setErr("خواندن تصویر ناموفق بود.");
    } finally {
      setLoading(false);
      // پاک‌کردن انتخاب فایل برای آپلود مجدد
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full max-w-md rounded-xl border object-cover" />
      ) : (
        <div className="text-xs text-zinc-600">
          قانون: {IMG_RULES[kind].name} — حداقل {IMG_RULES[kind].minW}×{IMG_RULES[kind].minH}
          {IMG_RULES[kind].allow ? ` — نسبت: ${IMG_RULES[kind].allow!.join("، ")}` : ""}
          {" — "}حداکثر حجم: {human(IMG_RULES[kind].maxBytes)}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" onChange={onPick} disabled={loading} />
        {loading && <span className="text-xs text-zinc-500">در حال آپلود…</span>}
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}

      {/* خروجی نهایی برای ذخیره در فرم */}
      <input type="hidden" name={name} value={url || ""} />
    </div>
  );
}
