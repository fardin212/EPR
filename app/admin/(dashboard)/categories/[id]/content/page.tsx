"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type FaqItem = { question: string; answer: string };
type SpecItem = { label: string; value: string };

export default function CategoryContentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 اطلاعات کلی دسته برای نمایش
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // 🔹 سئو + محتوا
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState(""); // کلیدواژه اصلی
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);

  // ───────────────── load data ─────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/categories/${params.id}/content`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "خطا در دریافت داده");

        const c = data.category;
        setName(c.name || "");
        setSlug(c.slug || "");
        setSeoTitle(c.seoTitle || "");
        setSeoDescription(c.seoDescription || "");
        setFocusKeyword(c.focusKeyword || ""); // از مدل Category
        setSummary(c.summary || "");
        setContentHtml(c.contentHtml || "");
        setFaq(c.faqJson || []);
        setSpecs(c.specsJson || []);
        setGallery(c.galleryJson || []);
      } catch (e: any) {
        setError(e.message || "خطای ناشناخته");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  // ───────────────── SEO helpers ─────────────────
  const seoTitleLength = seoTitle.trim().length;
  const seoDescLength = seoDescription.trim().length;

  const plainText = useMemo(() => {
    // حذف تگ‌های HTML برای محاسبه کلمات
    const html = `${summary}\n${contentHtml}`;
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }, [summary, contentHtml]);

  const totalWords = useMemo(() => {
    if (!plainText) return 0;
    return plainText.split(" ").filter(Boolean).length;
  }, [plainText]);

  const summaryWords = useMemo(() => {
    const t = summary
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!t) return 0;
    return t.split(" ").filter(Boolean).length;
  }, [summary]);

  const focusKeywordCount = useMemo(() => {
    if (!focusKeyword.trim() || !plainText) return 0;
    const kw = focusKeyword.trim().toLowerCase();
    const text = plainText.toLowerCase();
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }, [focusKeyword, plainText]);

  const keywordDensity = useMemo(() => {
    if (!totalWords || !focusKeywordCount) return 0;
    return (focusKeywordCount / totalWords) * 100;
  }, [focusKeywordCount, totalWords]);

  const estimatedReadMinutes = useMemo(() => {
    if (!totalWords) return 0;
    // ~200 کلمه در دقیقه
    return Math.max(1, Math.round(totalWords / 200));
  }, [totalWords]);

  const densityLabel = (() => {
    if (!focusKeyword.trim() || !totalWords) return "—";
    if (keywordDensity < 0.8) return "کم";
    if (keywordDensity <= 2.8) return "ایده‌آل";
    if (keywordDensity <= 4) return "کمی بالا";
    return "زیاد";
  })();

  // ───────────────── save ─────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${params.id}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seoTitle,
          seoDescription,
          focusKeyword: focusKeyword.trim() || null,
          summary,
          contentHtml,
          faqJson: faq,
          specsJson: specs,
          galleryJson: gallery,
          // 🔹 زمان مطالعه تخمینی را هم به API می‌فرستیم (اگر route هندل کند)
          readMinutes: estimatedReadMinutes || null,
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "خطا در ذخیره");

      router.refresh();
    } catch (e: any) {
      setError(e.message || "خطای ناشناخته");
    } finally {
      setSaving(false);
    }
  };

  // ───────────────── list handlers ─────────────────
  const addFaq = () => setFaq((prev) => [...prev, { question: "", answer: "" }]);
  const removeFaq = (i: number) => setFaq((prev) => prev.filter((_, idx) => idx !== i));

  const addSpec = () => setSpecs((prev) => [...prev, { label: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));

  const addGalleryItem = () => setGallery((prev) => [...prev, ""]);
  const removeGalleryItem = (i: number) =>
    setGallery((prev) => prev.filter((_, idx) => idx !== i));

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="mb-2">
        <h1 className="text-2xl font-bold mb-1">
          محتوای دسته‌بندی: {name || "—"}{" "}
          <span className="text-sm text-gray-500">({slug})</span>
        </h1>
        <p className="text-xs text-gray-500">
          این صفحه مخصوص متن سئو، FAQ، جدول مشخصات و گالری همین دسته است.
        </p>
      </header>

      {/* پانل خلاصه وضعیت سئو */}
      <section className="border rounded-lg p-4 bg-gray-50 grid md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="font-semibold mb-1">طول عنوان سئو</div>
          <div
            className={
              "inline-flex items-center px-2 py-1 rounded-full " +
              (seoTitleLength === 0
                ? "bg-gray-200 text-gray-700"
                : seoTitleLength >= 45 && seoTitleLength <= 65
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700")
            }
          >
            {seoTitleLength} کاراکتر
          </div>
          <p className="mt-1 text-[10px] text-gray-500">بازه ایده‌آل: 45 تا 65 کاراکتر</p>
        </div>

        <div>
          <div className="font-semibold mb-1">طول توضیحات متا</div>
          <div
            className={
              "inline-flex items-center px-2 py-1 rounded-full " +
              (seoDescLength === 0
                ? "bg-gray-200 text-gray-700"
                : seoDescLength >= 120 && seoDescLength <= 170
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700")
            }
          >
            {seoDescLength} کاراکتر
          </div>
          <p className="mt-1 text-[10px] text-gray-500">بازه پیشنهادی: 120 تا 170 کاراکتر</p>
        </div>

        <div>
          <div className="font-semibold mb-1">تعداد کلمات متن</div>
          <div
            className={
              "inline-flex items-center px-2 py-1 rounded-full " +
              (totalWords === 0
                ? "bg-gray-200 text-gray-700"
                : totalWords >= 1200 && totalWords <= 2500
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700")
            }
          >
            {totalWords.toLocaleString("fa-IR")} کلمه
          </div>
          <p className="mt-1 text-[10px] text-gray-500">
            برای دسته‌بندی: هدف 1500–2000 کلمه (الان حدود {estimatedReadMinutes} دقیقه مطالعه)
          </p>
        </div>

        <div>
          <div className="font-semibold mb-1">چگالی کلیدواژه</div>
          <div
            className={
              "inline-flex items-center px-2 py-1 rounded-full " +
              (!focusKeyword.trim()
                ? "bg-gray-200 text-gray-700"
                : keywordDensity >= 1.2 && keywordDensity <= 2.8
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700")
            }
          >
            {focusKeyword.trim() && totalWords
              ? `${keywordDensity.toFixed(2)}٪ — ${densityLabel}`
              : "—"}
          </div>
          <p className="mt-1 text-[10px] text-gray-500">
            بازه ایده‌آل معمولاً 1.2٪ تا 2.8٪ است.
          </p>
        </div>
      </section>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded text-sm">{error}</div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SEO */}
        <section className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-lg mb-1">تنظیمات سئو این دسته</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">عنوان سئو</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
              <p className="mt-1 text-[10px] text-gray-500">
                بهتر است عنوان شامل نام دسته + یک مزیت (قیمت، خرید، مدل‌های جدید و ... ) باشد.
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1">توضیحات متا</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
              <p className="mt-1 text-[10px] text-gray-500">
                در ۱–۲ جمله، خلاصه کنید کاربر چه چیزی در این دسته پیدا می‌کند.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm mb-1">کلیدواژه اصلی این دسته</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="مثلاً: کانکس ویلایی"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                این همان عبارتی است که قرار است این دسته برایش در گوگل دیده شود.
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1">تعداد کلمات خلاصه</label>
              <div className="border rounded px-3 py-2 text-xs bg-gray-50">
                {summaryWords.toLocaleString("fa-IR")} کلمه در بخش خلاصه
              </div>
              <p className="mt-1 text-[10px] text-gray-500">
                سعی کن خلاصه ۲–۳ پاراگراف جذاب و دعوت‌کننده باشد.
              </p>
            </div>
          </div>
        </section>

        {/* خلاصه و محتوا */}
        <section className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-lg mb-1">متن صفحه دسته‌بندی</h2>
          <div>
            <label className="block text-sm mb-1">خلاصه (۲–۳ پاراگراف اول)</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              محتوای کامل (HTML / متن فرمت‌شده)
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 font-mono text-xs"
              rows={14}
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              placeholder="<h2>عنوان بخش</h2>\n<p>متن ...</p>"
            />
            <p className="text-xs text-gray-500 mt-1">
              می‌تونی از ادیتورهای HTML آنلاین استفاده کنی و خروجی را اینجا پیست کنی. در آینده
              می‌تونیم ادیتور رچ‌تکست اضافه کنیم.
            </p>
          </div>
        </section>

        {/* مشخصات فنی */}
        <section className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">جدول مشخصات فنی</h2>
            <button
              type="button"
              onClick={addSpec}
              className="text-sm px-3 py-1 border rounded"
            >
              + ردیف جدید
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((row, idx) => (
              <div
                key={idx}
                className="grid md:grid-cols-[1fr,2fr,auto] gap-2 items-center"
              >
                <input
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="برچسب"
                  value={row.label}
                  onChange={(e) => {
                    const copy = [...specs];
                    copy[idx].label = e.target.value;
                    setSpecs(copy);
                  }}
                />
                <input
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="مقدار"
                  value={row.value}
                  onChange={(e) => {
                    const copy = [...specs];
                    copy[idx].value = e.target.value;
                    setSpecs(copy);
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="text-xs text-red-600"
                >
                  حذف
                </button>
              </div>
            ))}
            {specs.length === 0 && (
              <p className="text-xs text-gray-500">فعلاً مشخصاتی ثبت نشده است.</p>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">سوالات متداول</h2>
            <button
              type="button"
              onClick={addFaq}
              className="text-sm px-3 py-1 border rounded"
            >
              + سوال جدید
            </button>
          </div>
          <div className="space-y-3">
            {faq.map((item, idx) => (
              <div
                key={idx}
                className="border rounded p-3 space-y-2 bg-gray-50"
              >
                <div>
                  <label className="block text-xs mb-1">سوال</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={item.question}
                    onChange={(e) => {
                      const copy = [...faq];
                      copy[idx].question = e.target.value;
                      setFaq(copy);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">پاسخ</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm"
                    rows={3}
                    value={item.answer}
                    onChange={(e) => {
                      const copy = [...faq];
                      copy[idx].answer = e.target.value;
                      setFaq(copy);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFaq(idx)}
                  className="text-xs text-red-600"
                >
                  حذف سوال
                </button>
              </div>
            ))}
            {faq.length === 0 && (
              <p className="text-xs text-gray-500">فعلاً سوالی ثبت نشده است.</p>
            )}
          </div>
        </section>

        {/* گالری */}
        <section className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">گالری تصاویر (URL)</h2>
            <button
              type="button"
              onClick={addGalleryItem}
              className="text-sm px-3 py-1 border rounded"
            >
              + تصویر جدید
            </button>
          </div>
          <div className="space-y-2">
            {gallery.map((url, idx) => (
              <div
                key={idx}
                className="grid md:grid-cols-[1fr,auto] gap-2 items-center"
              >
                <input
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => {
                    const copy = [...gallery];
                    copy[idx] = e.target.value;
                    setGallery(copy);
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryItem(idx)}
                  className="text-xs text-red-600"
                >
                  حذف
                </button>
              </div>
            ))}
            {gallery.length === 0 && (
              <p className="text-xs text-gray-500">
                می‌تونی URL تصاویر آپلودشده در سایت را اینجا وارد کنی.
              </p>
            )}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
