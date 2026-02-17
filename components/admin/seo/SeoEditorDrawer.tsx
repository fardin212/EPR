"use client";

import React, { useState, useEffect } from "react";

type SeoEditorProps = {
  page: {
    url: string;
    type: "category" | "project" | "post" | "static";
    title: string;
    focusKeyword?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  };
  onClose: () => void;
  onSaved: (updated: Partial<SeoEditorProps["page"]>) => void;
};

export default function SeoEditorDrawer({ page, onClose, onSaved }: SeoEditorProps) {
  const [focusKeyword, setFocusKeyword] = useState(page.focusKeyword ?? "");
  const [metaTitle, setMetaTitle] = useState(page.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription ?? "");
  const [saving, setSaving] = useState(false);

  const titleLen = metaTitle.trim().length;
  const descLen = metaDescription.trim().length;

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/seo/update-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: page.url,
          type: page.type,
          focusKeyword,
          metaTitle,
          metaDescription,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP_${res.status} ${text}`);
      }

      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "SAVE_FAILED");

      onSaved({
        focusKeyword,
        metaTitle,
        metaDescription,
      });
      onClose();
    } catch (err: any) {
      alert(err?.message || "خطا در ذخیره تنظیمات سئو");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-900/30">
      <div className="w-full max-w-xl h-full bg-white shadow-xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-slate-400">ویرایش سئو صفحه</div>
            <div className="text-sm font-semibold text-slate-800 truncate">
              {page.title}
            </div>
            <div className="text-[11px] text-blue-600 truncate">{page.url}</div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm"
          >
            بستن
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Focus Keyword */}
          <div>
            <label className="block text-xs mb-1 text-slate-500">
              کلمه کلیدی اصلی
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="مثلاً: خرید کانکس ویلایی"
            />
          </div>

          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-slate-500">
                عنوان سئو (Meta Title)
              </label>
              <span className="text-[10px] text-slate-400">
                {titleLen} / 60
              </span>
            </div>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="عنوانی که در نتایج گوگل نمایش داده می‌شود"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-slate-500">
                توضیحات متا (Meta Description)
              </label>
              <span className="text-[10px] text-slate-400">
                {descLen} / 155
              </span>
            </div>
            <textarea
              className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="متنی که زیر عنوان در نتایج گوگل نمایش داده می‌شود"
            />
          </div>

          {/* Snippet Preview ساده */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
            <div className="text-[11px] text-emerald-700">
              پیش‌نمایش نتایج گوگل
            </div>
            <div className="mt-1 text-sm text-blue-700">
              {metaTitle || page.title}
            </div>
            <div className="text-[11px] text-green-700">
              conexnikan.com{page.url}
            </div>
            <div className="mt-1 text-[11px] text-slate-700 line-clamp-2">
              {metaDescription ||
                "در این قسمت پیش‌نمایش توضیحات متای این صفحه نمایش داده می‌شود."}
            </div>
          </div>

          {/* TODO: چک‌لیست رنگی – می‌توانیم بعداً اضافه کنیم */}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs text-slate-600"
          >
            انصراف
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 text-xs disabled:opacity-60"
          >
            {saving ? "در حال ذخیره..." : "ذخیره سئو"}
          </button>
        </div>
      </div>
    </div>
  );
}
