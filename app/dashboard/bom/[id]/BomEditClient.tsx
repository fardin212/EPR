"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type BomEditClientProps = {
  template: any;
  products: any[];
  projectTypes: any[];
};

type BomItemInput = {
  id?: number;
  productId: string;
  quantity: string;
  quantityPerUnit: string;
  unit: string;
  stageName: string;
  note: string;
};

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

export default function BomEditClient({
  template,
  products,
  projectTypes,
}: BomEditClientProps) {
  const router = useRouter();

  if (!template) {
    return (
      <div className="text-sm text-red-500" dir="rtl">
        داده‌ای برای این BOM دریافت نشد.
      </div>
    );
  }

  const [name, setName] = useState<string>(template.name || "");
  const [title, setTitle] = useState<string>(template.title || "");
  const [description, setDescription] = useState<string>(
    template.description || ""
  );
  const [projectTypeId, setProjectTypeId] = useState<string>(
    template.projectTypeId ? String(template.projectTypeId) : ""
  );
  const [isActive, setIsActive] = useState<boolean>(!!template.isActive);

  const initialItems: BomItemInput[] =
    (template.items || []).map((it: any) => ({
      id: it.id,
      productId: it.productId ? String(it.productId) : "",
      quantity: it.quantity != null ? String(it.quantity) : "",
      quantityPerUnit:
        it.quantityPerUnit != null ? String(it.quantityPerUnit) : "1",
      unit: it.unit || it.product?.unit || "",
      stageName: it.stageName || "",
      note: it.note || "",
    })) || [];

  const [items, setItems] = useState<BomItemInput[]>(
    initialItems.length
      ? initialItems
      : [
          {
            productId: "",
            quantity: "",
            quantityPerUnit: "1",
            unit: "",
            stageName: "",
            note: "",
          },
        ]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateItem(index: number, field: keyof BomItemInput, value: string) {
    setItems((prev) => {
      const cp = [...prev];
      cp[index] = { ...cp[index], [field]: value };
      return cp;
    });
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        quantity: "",
        quantityPerUnit: "1",
        unit: "",
        stageName: "",
        note: "",
      },
    ]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!name.trim()) {
      setError("نام داخلی BOM الزامی است.");
      setLoading(false);
      return;
    }

    const cleanedItems = items
      .filter((i) => i.productId && i.quantity)
      .map((i) => ({
        id: i.id,
        productId: Number(i.productId),
        quantity: Number(i.quantity),
        quantityPerUnit: Number(i.quantityPerUnit) || 1,
        unit: i.unit || undefined,
        stageName: i.stageName || undefined,
        note: i.note || undefined,
      }));

    if (cleanedItems.length === 0) {
      setError("حداقل یک آیتم BOM لازم است.");
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      title: title.trim() || name.trim(),
      description: description.trim() || undefined,
      projectTypeId: projectTypeId ? Number(projectTypeId) : undefined,
      isActive,
      items: cleanedItems,
    };

    try {
      const res = await fetch(`/api/bom-templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "خطا در بروزرسانی BOM");
      } else {
        setSuccess("BOM با موفقیت بروزرسانی شد 🎉");
        setTimeout(() => {
          router.push("/dashboard/bom");
        }, 900);
      }
    } catch (err) {
      console.error(err);
      setError("خطای اتصال یا سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
      {/* هدر صفحه */}
      <section className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">ویرایش BOM</p>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
            {template.title || template.name || "BOM بدون عنوان"}
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            می‌توانید لیست مواد، واحدها، مراحل مصرف و وضعیت BOM را اصلاح کنید.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/bom")}
          className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-600 hover:border-slate-400 hover:text-slate-900"
        >
          ← بازگشت به لیست
        </button>
      </section>

      {/* فرم */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات پایه */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 mb-1 block">
                نام داخلی BOM *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">
                عنوان نمایشی
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 mb-1 block">
                نوع پروژه
              </label>
              <select
                value={projectTypeId}
                onChange={(e) => setProjectTypeId(e.target.value)}
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
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              BOM فعال باشد
            </label>

            <div className="sm:col-span-2">
              <label className="text-xs text-slate-600 mb-1 block">
                توضیحات
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* آیتم‌های BOM */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              آیتم‌های BOM
            </span>
            <span className="text-[11px] rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {items.length} ردیف
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {items.map((row, index) => (
              <div
                key={row.id ?? index}
                className="rounded-xl bg-slate-50 border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-12 gap-3"
              >
                {/* کالا */}
                <div className="sm:col-span-4">
                  <label className="text-[11px] text-slate-600 mb-1 block">
                    کالا *
                  </label>
                  <select
                    value={row.productId}
                    onChange={(e) =>
                      updateItem(index, "productId", e.target.value)
                    }
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

                {/* مقدار */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-600 mb-1 block">
                    مقدار *
                  </label>
                  <input
                    value={row.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="مثلاً 120"
                  />
                </div>

                {/* واحد */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-600 mb-1 block">
                    واحد
                  </label>
                  <input
                    value={row.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="متر / عدد / کیلو"
                  />
                </div>

                {/* برای هر واحد */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-600 mb-1 block">
                    برای هر واحد
                  </label>
                  <input
                    value={row.quantityPerUnit}
                    onChange={(e) =>
                      updateItem(index, "quantityPerUnit", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="1"
                  />
                </div>

                {/* مرحله مصرف */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-600 mb-1 block">
                    مرحله مصرف
                  </label>
                  <select
                    value={row.stageName}
                    onChange={(e) =>
                      updateItem(index, "stageName", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">— انتخاب نشده —</option>
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* توضیح ردیف */}
                <div className="sm:col-span-11">
                  <label className="text-[11px] text-slate-600 mb-1 block">
                    توضیح
                  </label>
                  <textarea
                    rows={1}
                    value={row.note}
                    onChange={(e) => updateItem(index, "note", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                {/* حذف ردیف */}
                <div className="flex justify-end sm:col-span-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="rounded-full bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 text-[11px] hover:bg-rose-100"
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* دکمه افزودن ردیف */}
            <button
              type="button"
              onClick={addRow}
              className="rounded-full border border-indigo-300 text-indigo-600 px-4 py-2 text-xs hover:bg-indigo-50"
            >
              + افزودن ردیف جدید
            </button>
          </div>
        </div>

        {/* دکمه‌های پایین فرم */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-indigo-600 text-white text-sm px-6 py-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/bom")}
            className="rounded-full border border-slate-300 bg-slate-50 text-slate-600 px-5 py-2 text-sm hover:text-slate-900 hover:border-slate-400"
          >
            انصراف
          </button>
        </div>

        {/* پیام‌های خطا / موفقیت */}
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
