"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type CheckStatus = "good" | "ok" | "bad";

type CheckItem = {
  key: string;
  label: string;
  status: CheckStatus;
  message: string;
  value?: any;
};

type SectionResult = {
  score: number; // 0 - 100
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

type Props = {
  open: boolean;
  onClose: () => void;
  result: SeoAnalyzeResult | null;
  isLoading?: boolean;
  pageTitle?: string;
  pageUrl?: string;
  focusKeyword?: string;
};

const sectionOrder: { key: keyof SeoAnalyzeResult["sections"]; label: string }[] =
  [
    { key: "meta", label: "عنوان و توضیحات متا" },
    { key: "keyword", label: "کلمه کلیدی" },
    { key: "headings", label: "تیترها (H1/H2/...)" },
    { key: "content", label: "حجم و ساختار محتوا" },
    { key: "links", label: "لینک‌های داخلی / خارجی" },
    { key: "images", label: "تصاویر و alt" },
    { key: "readability", label: "خوانایی متن" },
  ];

function statusColor(status: CheckStatus) {
  switch (status) {
    case "good":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "ok":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "bad":
      return "bg-rose-100 text-rose-700 border-rose-200";
  }
}

function statusDot(status: CheckStatus) {
  switch (status) {
    case "good":
      return "bg-emerald-500";
    case "ok":
      return "bg-amber-500";
    case "bad":
      return "bg-rose-500";
  }
}

function statusLabel(status: CheckStatus) {
  switch (status) {
    case "good":
      return "عالی";
    case "ok":
      return "متوسط";
    case "bad":
      return "ضعیف";
  }
}

export default function SeoReportModal({
  open,
  onClose,
  result,
  isLoading,
  pageTitle,
  pageUrl,
  focusKeyword,
}: Props) {
  const [activeTab, setActiveTab] =
    React.useState<keyof SeoAnalyzeResult["sections"]>("meta");

  React.useEffect(() => {
    if (open) setActiveTab("meta");
  }, [open]);

  if (!open) return null;

  const section = result ? result.sections[activeTab] : null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl mx-3 my-10 rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-500">
              گزارش سئو برای صفحه:
            </p>
            <h2 className="text-sm md:text-base font-extrabold text-slate-900">
              {pageTitle || result?.raw.title || "بدون عنوان"}
            </h2>
            {pageUrl && (
              <p className="text-[11px] text-slate-500 truncate max-w-[360px]">
                {pageUrl}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Overall score bubble */}
            <div className="flex flex-col items-center justify-center">
              <div
                className="relative w-14 h-14 rounded-full flex items-center justify-center text-xs font-extrabold text-slate-900 shadow-md"
                style={{
                  background: result
                    ? `conic-gradient(#22c55e ${
                        result.overallScore * 3.6
                      }deg, #e5e7eb 0deg)`
                    : "#e5e7eb",
                }}
              >
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                  {isLoading ? (
                    <span className="animate-pulse text-[11px] text-slate-400">
                      ...
                    </span>
                  ) : (
                    <span>{result?.overallScore ?? "--"}</span>
                  )}
                </div>
              </div>
              <span className="mt-1 text-[11px] text-slate-500">
                نمره کلی از ۱۰۰
              </span>
            </div>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 w-8 h-8 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Sidebar tabs */}
          <div className="w-full md:w-60 border-b md:border-b-0 md:border-l border-slate-100 bg-slate-50/60">
            <div className="p-3 space-y-3">
              {/* basic info */}
              {result && (
                <div className="rounded-2xl bg-white border border-slate-100 px-3 py-2.5 text-[11px] space-y-1.5">
                  {focusKeyword && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">کلمه کلیدی:</span>
                      <span className="font-semibold text-slate-800">
                        {focusKeyword}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">تعداد کلمات:</span>
                    <span className="font-semibold text-slate-800">
                      {result.wordCount}
                    </span>
                  </div>
                  {result.density > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        چگالی کلمه کلیدی:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {result.density.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                {sectionOrder.map((s) => {
                  const sec = result?.sections[s.key];
                  const isActive = activeTab === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setActiveTab(s.key)}
                      className={`w-full flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs text-right border transition ${
                        isActive
                          ? "bg-slate-900 text-slate-50 border-slate-900"
                          : "bg-white text-slate-700 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sec ? statusDot(sec.status) : "bg-slate-300"
                          }`}
                        />
                        <span>{s.label}</span>
                      </div>
                      {sec && (
                        <span className="text-[11px] opacity-80">
                          {sec.score}/100
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section details */}
          <div className="flex-1 min-h-[260px] max-h-[480px] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center h-full py-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">
                    در حال تحلیل سئو صفحه...
                  </p>
                </div>
              </div>
            )}

            {!isLoading && result && section && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span>{sectionOrder.find((s) => s.key === activeTab)?.label}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${statusColor(
                        section.status
                      )}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusDot(
                          section.status
                        )}`}
                      />
                      <span>{statusLabel(section.status)}</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    امتیاز این بخش:{" "}
                    <span className="font-semibold text-slate-900">
                      {section.score} / 100
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {section.checks.map((check) => (
                    <div
                      key={check.key}
                      className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800">
                          {check.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] ${statusColor(
                            check.status
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusDot(
                              check.status
                            )}`}
                          />
                          <span>{statusLabel(check.status)}</span>
                        </span>
                      </div>
                      <p className="text-[11px] leading-5 text-slate-600">
                        {check.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !result && (
              <div className="flex items-center justify-center h-full py-10">
                <p className="text-xs text-slate-500">
                  هنوز گزارشی برای نمایش وجود ندارد.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
          <div>
            با اصلاح موارد قرمز و زرد، امتیاز کلی سئو این صفحه به‌صورت
            خودکار به‌روزرسانی می‌شود.
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-50 text-xs font-semibold hover:bg-slate-800"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
