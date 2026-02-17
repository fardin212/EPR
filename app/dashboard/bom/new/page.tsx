"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

type BomItemInput = {
  productId: string;
  quantity: string;
  quantityPerUnit: string;
  unit: string;
  stageName: string;
  note: string;
};

type ProductOption = { id: number; name: string; sku?: string; unit?: string };
type ProjectTypeOption = { id: number; name: string; code?: string };

const STAGE_OPTIONS = [
  "برش و آماده‌سازی پروفیل",
  "ساخت اسکلت اصلی",
  "نصب کف و زیرسازی",
  "نصب دیواره‌ها",
  "نصب سقف",
  "نصب درب و پنجره",
  "برق‌کاری و تأسیسات",
  "رنگ و نازک‌کاری",
  "کنترل کیفیت نهایی",
];

export default function NewBomPage() {
  const router = useRouter();

  const [items, setItems] = useState<BomItemInput[]>([
    { productId: "", quantity: "", quantityPerUnit: "1", unit: "", stageName: "", note: "" },
  ]);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectTypeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [p, t] = await Promise.all([
          fetch("/api/products?simple=1").then((r) => r.json()).catch(() => []),
          fetch("/api/project-types?simple=1").then((r) => r.json()).catch(() => []),
        ]);
        setProducts(Array.isArray(p) ? p : []);
        setProjectTypes(Array.isArray(t) ? t : []);
      } catch {}
    }
    load();
  }, []);

  function updateItem(i: number, field: keyof BomItemInput, value: string) {
    setItems((prev) => {
      const cp = [...prev];
      cp[i] = { ...cp[i], [field]: value };
      return cp;
    });
  }

  function addRow() {
    setItems((prev) => [...prev, { productId: "", quantity: "", quantityPerUnit: "1", unit: "", stageName: "", note: "" }]);
  }

  function removeRow(i: number) {
    setItems((prev) => prev.filter((_, x) => x !== i));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      title: (fd.get("title") as string) || (fd.get("name") as string),
      description: fd.get("description") || undefined,
      projectTypeId: fd.get("projectTypeId") ? Number(fd.get("projectTypeId")) : undefined,
      isActive: fd.get("isActive") === "on",
      items: items
        .filter((i) => i.productId && i.quantity)
        .map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
          quantityPerUnit: Number(i.quantityPerUnit) || 1,
          unit: i.unit || undefined,
          stageName: i.stageName || undefined,
          note: i.note || undefined,
        })),
    };

    if (!payload.name) return setError("نام داخلی BOM الزامی است.");
    if (payload.items.length === 0) return setError("حداقل یک آیتم BOM لازم است.");

    try {
      const res = await fetch("/api/bom-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "خطا در ذخیره BOM");
      } else {
        setSuccess("BOM با موفقیت ثبت شد 🎉");
        setTimeout(() => router.push("/dashboard/bom"), 900);
      }
    } catch {
      setError("خطای اتصال یا سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6" dir="rtl">

      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">ایجاد BOM جدید</h1>
          <p className="text-[11px] text-slate-500 mt-1">
            لیست استاندارد مواد سازه را تعریف کنید تا در پروژه‌ها قابل استفاده باشد.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/bom")}
          type="button"
          className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-600 hover:text-slate-900 hover:border-slate-400"
        >
          ← بازگشت
        </button>
      </section>

      {/* Form */}
      <form onSubmit={submit} className="space-y-6">

        {/* Basic Info */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="text-xs text-slate-600 mb-1 block">نام داخلی BOM *</label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                placeholder="BOM_VILLA_3X7"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">عنوان نمایشی</label>
              <input
                name="title"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">نوع پروژه</label>
              <select
                name="projectTypeId"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              >
                <option value="">— انتخاب نشده —</option>
                {projectTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.code ? ` (${t.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 mt-6 text-xs text-slate-600">
              <input type="checkbox" name="isActive" defaultChecked />
              BOM فعال باشد
            </label>

            <div className="col-span-2">
              <label className="text-xs text-slate-600 mb-1 block">توضیحات</label>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* BOM Items */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">آیتم‌های BOM</span>
            <div className="text-[11px] rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {items.length} ردیف
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((row, i) => (
              <div key={i} className="rounded-xl bg-slate-50 border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">

                {/* Product */}
                <div className="sm:col-span-4">
                  <label className="text-[11px] text-slate-600 mb-1 block">کالا *</label>
                  <select
                    value={row.productId}
                    onChange={(e) => updateItem(i, "productId", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">انتخاب کالا...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.sku ? ` — ${p.sku}` : ""}
                        {p.unit ? ` (${p.unit})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-600 mb-1 block">مقدار *</label>
                  <input
                    value={row.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="مثلاً 120"
                  />
                </div>

                {/* Unit */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-600 mb-1 block">واحد</label>
                  <input
                    value={row.unit}
                    onChange={(e) => updateItem(i, "unit", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="متر / عدد / کیلو"
                  />
                </div>

                {/* Quantity Per Unit */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-600 mb-1 block">برای هر واحد</label>
                  <input
                    value={row.quantityPerUnit}
                    onChange={(e) => updateItem(i, "quantityPerUnit", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="1"
                  />
                </div>

                {/* Stage */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-600 mb-1 block">مرحله مصرف</label>
                  <select
                    value={row.stageName}
                    onChange={(e) => updateItem(i, "stageName", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">— انتخاب نشده —</option>
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Row Note */}
                <div className="sm:col-span-11">
                  <label className="text-[11px] text-slate-600 mb-1 block">توضیح</label>
                  <textarea
                    rows={1}
                    value={row.note}
                    onChange={(e) => updateItem(i, "note", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                {/* Remove */}
                <div className="flex justify-end sm:col-span-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="rounded-full bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 text-[11px] hover:bg-rose-100"
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Row */}
            <button
              type="button"
              onClick={addRow}
              className="rounded-full border border-indigo-300 text-indigo-600 px-4 py-2 text-xs hover:bg-indigo-50"
            >
              + افزودن ردیف جدید
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-indigo-600 text-white text-sm px-6 py-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "در حال ثبت..." : "ثبت BOM"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/bom")}
            className="rounded-full border border-slate-300 bg-slate-50 text-slate-600 px-5 py-2 text-sm hover:text-slate-900 hover:border-slate-400"
          >
            انصراف
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-[11px] text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-700">
            {success}
          </div>
        )}
      </form>
    </div>
  );
}
