"use client";

import { inputBase, textareaBase, card } from "./ui";

type GuideFormProps = {
  mode: "create" | "edit";
  action: (fd: FormData) => void;
  defaultValues?: {
    slug?: string;
    name?: string;
    keyword?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    summary?: string | null;
    contentHtml?: string | null;
    imageUrl?: string | null;
    faqJson?: any;
    specsJson?: any;
    galleryJson?: any;
  };
};

function prettifyJson(v: any) {
  if (!v) return "";
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
}

export default function GuideForm({ mode, action, defaultValues }: GuideFormProps) {
  const d = defaultValues || {};

  return (
    <form action={action} className="space-y-4">
      <div className={card}>
        <h2 className="font-extrabold text-slate-900 mb-3">
          {mode === "create" ? "ایجاد راهنما" : "ویرایش راهنما"}
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">نام (نمایشی)</label>
            <input name="name" defaultValue={d.name || ""} className={inputBase} placeholder="مثلاً: کانکس" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Slug</label>
            <input name="slug" defaultValue={d.slug || ""} className={inputBase} placeholder="مثلاً: کانکس یا conex" />
            <p className="mt-1 text-[11px] text-slate-500">می‌تونی فارسی هم بذاری. (URL encode می‌شه)</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Keyword (اختیاری)</label>
            <input name="keyword" defaultValue={d.keyword || ""} className={inputBase} placeholder="مثلاً: کانکس" />
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="font-extrabold text-slate-900 mb-3">SEO</h3>
        <div className="grid gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">SEO Title</label>
            <input name="seoTitle" defaultValue={d.seoTitle || ""} className={inputBase} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">SEO Description</label>
            <textarea name="seoDescription" defaultValue={d.seoDescription || ""} className={textareaBase} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Summary (خلاصه Hero)</label>
            <textarea name="summary" defaultValue={d.summary || ""} className={textareaBase} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Image URL (کاور / OG)</label>
            <input name="imageUrl" defaultValue={d.imageUrl || ""} className={inputBase} placeholder="/uploads/... یا https://..." />
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="font-extrabold text-slate-900 mb-3">محتوا</h3>
        <label className="text-xs font-semibold text-slate-600">contentHtml</label>
        <textarea
          name="contentHtml"
          defaultValue={d.contentHtml || ""}
          className={textareaBase}
          style={{ minHeight: 260 }}
          placeholder="<p>...</p>"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={card}>
          <h3 className="font-extrabold text-slate-900 mb-2">FAQ JSON</h3>
          <p className="text-[11px] text-slate-500 mb-2">
            نمونه: [{"{"}"question":"...","answer":"..."{"}"}]
          </p>
          <textarea name="faqJson" defaultValue={prettifyJson(d.faqJson)} className={textareaBase} />
        </div>

        <div className={card}>
          <h3 className="font-extrabold text-slate-900 mb-2">Specs JSON</h3>
          <p className="text-[11px] text-slate-500 mb-2">
            نمونه: [{"{"}"label":"...","value":"..."{"}"}]
          </p>
          <textarea name="specsJson" defaultValue={prettifyJson(d.specsJson)} className={textareaBase} />
        </div>

        <div className={card}>
          <h3 className="font-extrabold text-slate-900 mb-2">Gallery JSON</h3>
          <p className="text-[11px] text-slate-500 mb-2">
            نمونه: ["url1","url2"] یا [{"{"}"url":"...","alt":"..."{"}"}]
          </p>
          <textarea name="galleryJson" defaultValue={prettifyJson(d.galleryJson)} className={textareaBase} />
        </div>
      </div>

      <button
        className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-400"
        type="submit"
      >
        {mode === "create" ? "ایجاد" : "ذخیره تغییرات"}
      </button>
    </form>
  );
}
