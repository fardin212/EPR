// components/admin/seo/SeoAnalyzerClient.tsx
"use client";

import { FormEvent, useState } from "react";

type ChecklistItem = {
  id: string;
  label: string;
  status: "good" | "warning" | "bad";
  message: string;
};

type SeoResult = {
  url: string;
  keyword: string;
  title: string | null;
  description: string | null;
  h1: string | null;
  wordCount: number;
  keywordCount: number;
  densityPercent: number;
  score: number;
  checklist: ChecklistItem[];
};

export default function SeoAnalyzerClient() {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SeoResult | null>(null);

  async function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const cleanKeyword = keyword.trim();

      const res = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), keyword: cleanKeyword }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "خطای ناشناخته در تحلیل سئو");
      } else {
        const seo = data.seo;
        const mapped: SeoResult = {
          url: data.url,
          keyword: data.keyword,
          title: seo.title,
          description: seo.description,
          h1: seo.h1,
          wordCount: seo.wordCount,
          keywordCount: seo.keywordCount,
          densityPercent: seo.densityPercent,
          score: seo.score,
          checklist: seo.checklist,
        };
        setResult(mapped);
      }
    } catch (err) {
      console.error(err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  function statusColor(status: ChecklistItem["status"]) {
    if (status === "good")
      return "bg-green-100 text-green-800 border-green-200";
    if (status === "warning")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  }

  function scoreColor(score: number) {
    if (score >= 80) return "bg-green-600";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
      {/* فرم ورودی */}
      <div className="border rounded-xl p-4 bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold mb-2">تحلیل صفحه جدید</h2>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">آدرس صفحه</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/category/conex-vila یا آدرس کامل صفحه"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              dir="ltr"
            />
            <p className="text-xs text-gray-500">
              می‌توانی فقط مسیر را وارد کنی (مثل{" "}
              <code className="font-mono">/projects</code>) یا آدرس کامل را.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              کلمه کلیدی اصلی (Focus Keyword)
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثلاً: کانکس ساندویچی، کانکس کارگاهی، کانکس ویلایی..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              برای تحلیل چگالی و حضور در عنوان/متا بهتر است این فیلد را پر
              کنی؛ کلمه را خیلی طولانی انتخاب نکن (۲ تا ۴ واژه).
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "در حال تحلیل..." : "تحلیل سئو صفحه"}
          </button>
        </form>

        {!result && (
          <div className="text-xs text-gray-500 border-t pt-3 mt-3">
            🔍 پیشنهاد: برای هر صفحه مهم (صفحه اصلی، دسته‌ها، چند نمونه‌کار
            کلیدی) یک‌بار تحلیل اجرا کن و بر اساس چک‌لیست، عنوان، متا و متن
            را تنظیم کن.
          </div>
        )}
      </div>

      {/* نتیجه تحلیل */}
      <div className="border rounded-xl p-4 bg-white shadow-sm min-h-[200px]">
        {!result && (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            هنوز صفحه‌ای تحلیل نشده است.
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs text-gray-500">آدرس صفحه</div>
                <div className="text-xs text-blue-700 break-all" dir="ltr">
                  {result.url}
                </div>
                {result.keyword && (
                  <div className="text-xs text-gray-600 mt-1">
                    کلمه کلیدی:{" "}
                    <span className="font-semibold">{result.keyword}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="relative inline-flex items-center justify-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold ${scoreColor(
                      result.score
                    )}`}
                  >
                    {result.score}
                  </div>
                </div>
                <div className="text-xs text-gray-500">نمره کلی سئو</div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div className="border rounded-lg p-2">
                <div className="font-medium mb-1">عنوان سئو</div>
                <div className="text-gray-700">
                  {result.title ? result.title : "تعریف نشده"}
                </div>
              </div>
              <div className="border rounded-lg p-2">
                <div className="font-medium mb-1">توضیحات متا</div>
                <div className="text-gray-700">
                  {result.description ? result.description : "پیدا نشد"}
                </div>
              </div>
              <div className="border rounded-lg p-2">
                <div className="font-medium mb-1">H1</div>
                <div className="text-gray-700">
                  {result.h1 ? result.h1 : "هیچ H1 پیدا نشد"}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div className="border rounded-lg p-2">
                <div className="font-medium mb-1">تعداد کلمات محتوا</div>
                <div className="text-gray-800">{result.wordCount}</div>
              </div>
              <div className="border rounded-lg p-2">
                <div className="font-medium mb-1">تعداد تکرار کلمه کلیدی</div>
                <div className="text-gray-800">{result.keywordCount}</div>
              </div>
              <div className="border rounded-lg p-2">
                <div className="font-medium mb-1">چگالی کلمه کلیدی</div>
                <div className="text-gray-800">
                  {result.keyword
                    ? `${result.densityPercent.toFixed(2)}٪`
                    : "کلمه کلیدی تعیین نشده"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-sm">چک‌لیست جزئی</div>
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {result.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg px-3 py-2 text-xs flex flex-col gap-0.5 ${statusColor(
                      item.status
                    )}`}
                  >
                    <div className="font-semibold">{item.label}</div>
                    <div>{item.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
