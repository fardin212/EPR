"use client";

import React, { useEffect, useState } from "react";
import SeoReportModal from "./SeoReportModal"; // مسیر را در صورت نیاز اصلاح کن

/* ───────────────────── انواع داده‌ها ───────────────────── */

type SeoPageItem = {
  id?: number | string; // معمولاً id مدل Category/Project
  title: string;
  url: string;
  type: "category" | "project" | "post" | "static";
  keyword?: string | null; // focus keyword فعلی
  lastScore?: number | null;
  lastAnalyzedAt?: string | null;

  metaTitle?: string | null;
  metaDescription?: string | null;
};

/** وضعیت هر چک در گزارش حرفه‌ای سئو */
type CheckStatus = "good" | "ok" | "bad";

type CheckItem = {
  key: string;
  label: string;
  status: CheckStatus;
  message: string;
  value?: any;
};

type SectionResult = {
  score: number; // 0-100
  status: CheckStatus;
  checks: CheckItem[];
};

type SeoAnalyzeResult = {
  overallScore: number;
  wordCount: number;
  keywordCount: number;
  density: number;
  sections: {
    meta: SectionResult;
    keyword: SectionResult;
    headings: SectionResult;
    content: SectionResult;
    links: SectionResult;
    images: SectionResult;
    readability: SectionResult;
  };
  raw: {
    title: string;
    metaDescription: string;
    h1s: string[];
    url: string;
  };
};

type AnalyzeOkResponse = {
  ok: true;
  result: SeoAnalyzeResult;
};

type AnalyzeErrorResponse = {
  ok: false;
  error: string;
  detail?: string;
};

type AnalyzeResponse = AnalyzeOkResponse | AnalyzeErrorResponse;

type ApiListOk = {
  ok: true;
  pages: SeoPageItem[];
};

type ApiListError = {
  ok: false;
  message?: string;
};

type ApiListResponse = ApiListOk | ApiListError;

/* ───────────────────────── SeoPagesTable ───────────────────────── */

export default function SeoPagesTable() {
  const [pages, setPages] = useState<SeoPageItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // کلید یکتا = url
  const [keywordDrafts, setKeywordDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null);
  const [analyzeErrors, setAnalyzeErrors] = useState<
    Record<string, string | null>
  >({});

  // نتیجه کامل تحلیل حرفه‌ای برای هر صفحه
  const [results, setResults] = useState<
    Record<string, SeoAnalyzeResult | null>
  >({});

  // دراور ویرایش سئو
  const [editingPage, setEditingPage] = useState<SeoPageItem | null>(null);

  // مودال گزارش سئو
  const [reportOpen, setReportOpen] = useState(false);
  const [reportPageKey, setReportPageKey] = useState<string | null>(null);

  /* ───────── لیست صفحات ───────── */

  useEffect(() => {
    let cancelled = false;

    async function loadPages() {
      try {
        setLoadingList(true);
        setListError(null);

        const res = await fetch("/api/admin/seo/pages", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP_${res.status} ${text || ""}`);
        }

        const json = (await res.json()) as ApiListResponse;

        if (!json.ok) {
          throw new Error(json.message || "LIST_FAILED");
        }

        if (cancelled) return;

        const list = json.pages || [];
        setPages(list);

        const drafts: Record<string, string> = {};
        list.forEach((p) => {
          drafts[p.url] = p.keyword ?? "";
        });
        setKeywordDrafts(drafts);
      } catch (err: any) {
        if (cancelled) return;
        setListError(err?.message || "خطا در دریافت لیست صفحات");
      } finally {
        if (!cancelled) {
          setLoadingList(false);
        }
      }
    }

    loadPages();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ───────── ذخیره کلمه کلیدی ───────── */

  async function handleSaveKeyword(page: SeoPageItem) {
    const key = page.url;
    const keyword = (keywordDrafts[key] ?? "").trim();
    if (!keyword) {
      alert("لطفاً اول کلمه کلیدی را وارد کن.");
      return;
    }

    try {
      setSavingKey(key);

      const res = await fetch("/api/admin/seo/save-keyword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: page.url,
          type: page.type,
          keyword,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP_${res.status} ${text || ""}`);
      }

      const json = await res
        .json()
        .catch(() => ({ ok: false, message: "INVALID_JSON" }));
      if (!json.ok) {
        throw new Error(json.message || "SAVE_FAILED");
      }

      setPages((prev) =>
        prev.map((p) => (p.url === page.url ? { ...p, keyword } : p))
      );
    } catch (err: any) {
      alert(err?.message || "خطا در ذخیره کلمه کلیدی");
    } finally {
      setSavingKey(null);
    }
  }

  /* ───────── تحلیل حرفه‌ای صفحه ───────── */

  async function handleAnalyze(page: SeoPageItem) {
    const key = page.url;

    try {
      setAnalyzingKey(key);
      setAnalyzeErrors((prev) => ({ ...prev, [key]: null }));

      const keyword = (keywordDrafts[key] ?? page.keyword ?? "").trim();

      let absoluteUrl = page.url;
      if (typeof window !== "undefined") {
        if (
          page.url.startsWith("http://") ||
          page.url.startsWith("https://")
        ) {
          absoluteUrl = page.url;
        } else {
          absoluteUrl = `${window.location.origin}${page.url}`;
        }
      }

      const res = await fetch("/api/admin/seo/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: absoluteUrl,
          type: page.type,
          refId: typeof page.id === "number" ? page.id : null,
          focusKeyword: keyword || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP_${res.status} ${text || ""}`);
      }

      const json = (await res.json().catch(() => null)) as AnalyzeResponse | null;
      if (!json || !json.ok) {
        throw new Error(
          (json as AnalyzeErrorResponse)?.error || "ANALYZE_FAILED"
        );
      }

      const result = json.result;

      // ذخیره نتیجه در state
      setResults((prev) => ({ ...prev, [key]: result }));
      setAnalyzeErrors((prev) => ({ ...prev, [key]: null }));

      // بروزرسانی نمره آخر در لیست
      setPages((prev) =>
        prev.map((p) =>
          p.url === page.url
            ? {
                ...p,
                lastScore: result.overallScore,
                lastAnalyzedAt: new Date().toISOString(),
                keyword,
              }
            : p
        )
      );

      // باز کردن مودال گزارش
      setReportPageKey(key);
      setReportOpen(true);
    } catch (err: any) {
      console.error("Analyze error", err);
      setAnalyzeErrors((prev) => ({
        ...prev,
        [key]: err?.message || "خطا در تحلیل این صفحه",
      }));
      setResults((prev) => ({ ...prev, [key]: null }));
    } finally {
      setAnalyzingKey(null);
    }
  }

  /* ───────── رندر وضعیت کلی ───────── */

  if (loadingList) {
    return (
      <div className="py-10 text-center text-slate-500 text-sm">
        در حال بارگذاری لیست صفحات...
      </div>
    );
  }

  if (listError) {
    return (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
        خطا در دریافت لیست صفحات:
        <span className="font-semibold mr-1">{listError}</span>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="py-10 text-center text-slate-500 text-sm">
        صفحه‌ای برای تحلیل سئو پیدا نشد.
      </div>
    );
  }

  /* ───────── JSX جدول ───────── */

  return (
    <div className="space-y-6">
      <div className="text-xs text-slate-500">
        از این جدول می‌توانی همه‌ی دسته‌بندی‌ها، نمونه‌کارها، مقالات و
        صفحات مهم سایت را ببینی، برای هر صفحه کلمه‌ی کلیدی ثبت کنی، تحلیل
        حرفه‌ای سئو بگیری و سریع تنظیمات سئو (عنوان و توضیحات متا) را ویرایش
        کنی.
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="py-3 px-4 text-right">صفحه</th>
              <th className="py-3 px-4 text-right">نوع</th>
              <th className="py-3 px-4 text-right">آدرس</th>
              <th className="py-3 px-4 text-right w-72">کلمه کلیدی</th>
              <th className="py-3 px-4 text-center w-32">نمره آخر</th>
              <th className="py-3 px-4 text-center w-56">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const key = page.url;
              const errorMsg = analyzeErrors[key] || null;
              const result = results[key] || null;

              return (
                <React.Fragment key={key}>
                  <tr className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 text-xs md:text-sm">
                        {page.title}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {page.type}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={page.url}
                        target="_blank"
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {page.url}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 items-center">
                        <input
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          placeholder="مثلاً: خرید کانکس ویلایی"
                          value={keywordDrafts[key] ?? ""}
                          onChange={(e) =>
                            setKeywordDrafts((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveKeyword(page)}
                          disabled={savingKey === key}
                          className="whitespace-nowrap rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 disabled:opacity-60"
                        >
                          {savingKey === key ? "در حال ثبت..." : "ذخیره کلمه"}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      {page.lastScore != null ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-900 text-slate-50 px-3 py-1 text-[11px]">
                          {page.lastScore} / 100
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAnalyze(page)}
                          disabled={analyzingKey === key}
                          className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs px-3 py-1.5 disabled:opacity-60"
                        >
                          {analyzingKey === key
                            ? "در حال تحلیل..."
                            : "تحلیل سئو"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingPage(page)}
                          className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs px-3 py-1.5"
                        >
                          ویرایش سئو
                        </button>

                        <a
                          href={page.url}
                          target="_blank"
                          className="rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-3 py-1.5"
                        >
                          مشاهده صفحه
                        </a>
                      </div>
                    </td>
                  </tr>

                  {(result || errorMsg) && (
                    <tr className="border-t border-slate-100 bg-slate-50/60">
                      <td colSpan={6} className="px-4 pb-4 pt-2">
                        {errorMsg ? (
                          <div className="mt-2 rounded-xl bg-red-50 text-red-700 text-xs px-3 py-2">
                            خطا در تحلیل این صفحه، بعداً دوباره تلاش کن.
                            <span className="mr-1 font-medium">
                              ({errorMsg})
                            </span>
                          </div>
                        ) : result ? (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                            <div className="rounded-xl bg-slate-900 text-slate-50 px-3 py-3 flex flex-col gap-1">
                              <div className="text-[11px] text-slate-300">
                                نمره کلی صفحه
                              </div>
                              <div className="text-lg font-semibold">
                                {result.overallScore} / 100
                              </div>
                              <div className="text-[11px] text-slate-300 mt-1">
                                کلمات: {result.wordCount} – چگالی کیورد:{" "}
                                {result.density.toFixed(2)}%
                              </div>
                            </div>
                            <div className="rounded-xl bg-white shadow-sm px-3 py-3 border border-slate-200 flex flex-col gap-1">
                              <div className="text-[11px] text-slate-400">
                                عنوان و متا
                              </div>
                              <div className="text-sm font-medium text-slate-800">
                                {result.sections.meta.score} / 100
                              </div>
                            </div>
                            <div className="rounded-xl bg-white shadow-sm px-3 py-3 border border-slate-200 flex flex-col gap-1">
                              <div className="text-[11px] text-slate-400">
                                کلمه کلیدی
                              </div>
                              <div className="text-sm font-medium text-slate-800">
                                {result.sections.keyword.score} / 100
                              </div>
                            </div>
                            <div className="rounded-xl bg-white shadow-sm px-3 py-3 border border-slate-200 flex flex-col gap-1">
                              <div className="text-[11px] text-slate-400">
                                محتوا و ساختار
                              </div>
                              <div className="text-sm font-medium text-slate-800">
                                {result.sections.content.score} / 100
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* دراور ویرایش سئو شبیه Yoast */}
      {editingPage && (
        <SeoEditorDrawer
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSaved={(updated) => {
            setPages((prev) =>
              prev.map((p) =>
                p.url === updated.url ? { ...p, ...updated } : p
              )
            );
            // اگر کلمه کلیدی در دراور عوض شد، پیش‌نویس input هم sync شود
            if (updated.keyword != null) {
              setKeywordDrafts((prev) => ({
                ...prev,
                [updated.url]: updated.keyword as string,
              }));
            }
          }}
        />
      )}

      {/* مودال گزارش سئو حرفه‌ای */}
      {reportPageKey && (
        <SeoReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          result={results[reportPageKey] || null}
          isLoading={!!analyzingKey && analyzingKey === reportPageKey}
          pageTitle={
            pages.find((p) => p.url === reportPageKey)?.title || undefined
          }
          pageUrl={reportPageKey}
          focusKeyword={keywordDrafts[reportPageKey]}
        />
      )}
    </div>
  );
}

/* ───────────────────── SeoEditorDrawer (ویرایش سئو) ───────────────────── */

type SeoEditorDrawerProps = {
  page: SeoPageItem;
  onClose: () => void;
  onSaved: (updated: { url: string } & Partial<SeoPageItem>) => void;
};

function SeoEditorDrawer({ page, onClose, onSaved }: SeoEditorDrawerProps) {
  const [focusKeyword, setFocusKeyword] = useState(page.keyword ?? "");
  const [metaTitle, setMetaTitle] = useState(page.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page.metaDescription ?? ""
  );
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
        throw new Error(`HTTP_${res.status} ${text || ""}`);
      }

      const json = await res
        .json()
        .catch(() => ({ ok: false, message: "INVALID_JSON" }));

      if (!json.ok) {
        throw new Error(json.message || "SAVE_FAILED");
      }

      onSaved({
        url: page.url,
        keyword: focusKeyword,
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30">
      <div className="w-full max-w-xl h-full bg-white shadow-xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-slate-400">ویرایش سئو صفحه</div>
            <div className="text-sm font-semibold text-slate-800 truncate">
              {page.title}
            </div>
            <div className="text-[11px] text-blue-600 truncate">
              {page.url}
            </div>
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

          {/* Snippet Preview */}
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
