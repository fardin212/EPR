"use client";

import { toJalali } from "@/lib/date";
import React, { useEffect, useState } from "react";

type StageImage = {
  id: number;
  url: string;
  caption: string | null;
  createdAt: string;
};

interface StageImagesClientProps {
  stageId: number;
  stageName: string;
}

const StageImagesClient: React.FC<StageImagesClientProps> = ({
  stageId,
  stageName,
}) => {
  const [images, setImages] = useState<StageImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<number | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // -------------------------------------------------------------
  // Load images on mount
  // -------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/project-stages/${stageId}/images`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load stage images:", res.status, text);
          if (!cancelled) {
            setError("خطا در دریافت تصاویر این مرحله");
            setImages([]);
          }
          return;
        }

        const data = (await res.json()) as StageImage[];
        if (!cancelled) {
          setImages(data);
        }
      } catch (e) {
        console.error("Error loading stage images:", e);
        if (!cancelled) {
          setError("خطای ارتباط با سرور");
          setImages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [stageId]);

  // -------------------------------------------------------------
  // Upload multiple files
  // -------------------------------------------------------------
  const handleFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      // همهٔ فایل‌ها زیر کلید "file" ارسال می‌شوند
      Array.from(files).forEach((file) => {
        formData.append("file", file);
      });

      const res = await fetch(`/api/project-stages/${stageId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to upload stage image:", res.status, text);
        setError("خطا در آپلود یکی از تصاویر");
        return;
      }

      const newImages = (await res.json()) as StageImage[];
      // تصاویر تازه آپلود شده را به ابتدای لیست اضافه می‌کنیم
      setImages((prev) => [...newImages, ...prev]);
    } catch (err) {
      console.error("Error uploading stage images:", err);
      setError("خطای ارتباط در آپلود تصویر");
    } finally {
      setUploading(false);
      // ریست کردن input برای اینکه بتوان دوباره همان فایل را انتخاب کرد
      e.target.value = "";
    }
  };

  // -------------------------------------------------------------
  // Delete image
  // -------------------------------------------------------------
  const deleteImage = async (imageId: number) => {
    if (!window.confirm("این تصویر از گالری این مرحله حذف شود؟")) return;

    try {
      setDeletingId(imageId);
      const res = await fetch(`/api/project-stages/${stageId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: imageId }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to delete image:", res.status, text);
        alert("خطا در حذف تصویر");
        return;
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("خطای ارتباط در حذف تصویر");
    } finally {
      setDeletingId(null);
    }
  };

  // -------------------------------------------------------------
  // Caption editing
  // -------------------------------------------------------------
  const startEditCaption = (img: StageImage) => {
    setEditingCaptionId(img.id);
    setCaptionDraft(img.caption || "");
  };

  const cancelEditCaption = () => {
    setEditingCaptionId(null);
    setCaptionDraft("");
  };

  const saveCaption = async (imageId: number) => {
    if (captionDraft.trim().length === 0) {
      if (!window.confirm("کپشن خالی ذخیره شود؟")) return;
    }

    try {
      const res = await fetch(`/api/project-stages/${stageId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: imageId, caption: captionDraft }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to save caption:", res.status, text);
        alert("خطا در ذخیره توضیح تصویر");
        return;
      }

      const updated = (await res.json()) as StageImage;
      setImages((prev) =>
        prev.map((img) => (img.id === updated.id ? updated : img)),
      );
      setEditingCaptionId(null);
      setCaptionDraft("");
    } catch (err) {
      console.error("Error saving caption:", err);
      alert("خطای ارتباط در ذخیره توضیح تصویر");
    }
  };

  // -------------------------------------------------------------
  // UI
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          آپلود چند تصویر برای مرحله «{stageName}»
        </div>

        <label className="relative inline-flex items-center px-3 py-1 text-xs rounded-full bg-emerald-600 hover:bg-emerald-500 cursor-pointer transition">
          <span>{uploading ? "در حال آپلود..." : "آپلود تصویر"}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFilesChange}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-xs text-zinc-400">در حال بارگذاری تصاویر...</div>
      ) : images.length === 0 ? (
        <div className="text-xs text-zinc-500">
          هنوز تصویری برای این مرحله ثبت نشده است.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-zinc-900/60 border border-zinc-700/60 rounded-xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="relative w-full aspect-video bg-black">
                <img
                  src={img.url}
                  alt={img.caption || stageName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3 flex flex-col gap-2 text-xs">
                <div className="text-[10px] text-zinc-500">
                  {toJalali(img.createdAt, true)}
                </div>

                {editingCaptionId === img.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="w-full rounded-lg bg-zinc-950/60 border border-zinc-700/70 px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      rows={2}
                      value={captionDraft}
                      onChange={(e) => setCaptionDraft(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg text-[11px] bg-zinc-800 hover:bg-zinc-700"
                        onClick={cancelEditCaption}
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg text-[11px] bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => saveCaption(img.id)}
                      >
                        ذخیره توضیح
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[11px] text-zinc-200">
                      {img.caption && img.caption.trim().length > 0
                        ? img.caption
                        : "برای این تصویر توضیحی ثبت نشده است."}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg text-[11px] bg-zinc-800 hover:bg-zinc-700"
                        onClick={() => startEditCaption(img)}
                      >
                        ویرایش
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg text-[11px] bg-red-600 hover:bg-red-500 disabled:opacity-50"
                        onClick={() => deleteImage(img.id)}
                        disabled={deletingId === img.id}
                      >
                        {deletingId === img.id ? "حذف..." : "حذف"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StageImagesClient;
