"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type BomItemInput = {
  productId: string;
  quantity: string;
  quantityPerUnit: string;
  unit: string;
  stageName: string;
  note: string;
};

type ProductOption = {
  id: number;
  name: string;
  sku?: string;
  unit?: string;
};

type ProjectTypeOption = {
  id: number;
  name: string;
  code?: string;
};

type BomTemplateResponse = {
  id: number;
  name: string;
  title: string;
  description?: string | null;
  projectTypeId?: number | null;
  isActive: boolean;
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    quantityPerUnit: number;
    unit?: string | null;
    stageName?: string | null;
    note?: string | null;
    product?: {
      id: number;
      name: string;
      sku?: string | null;
      unit?: string | null;
    } | null;
  }>;
};

const STAGE_OPTIONS: string[] = [
  "برش و آماده‌سازی پروفیل",
  "ساخت اسکلت اصلی",
  "نصب کف و زیرسازی",
  "نصب دیواره‌ها",
  "نصب سقف",
  "نصب درب و پنجره",
  "برق‌کاری و تأسیسات داخلی",
  "رنگ و نازک‌کاری",
  "کنترل کیفیت نهایی",
];

const cls = {
  wrap: "max-w-5xl mx-auto px-4 py-6 text-[color:var(--text)]",
  card:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 mb-4",
  title: "text-xl font-semibold mb-1",
  subtitle: "text-xs text-[color:var(--muted)] mb-4",
  label: "block text-[11px] mb-1",
  input:
    "w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)]",
  textarea:
    "w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)] resize-y",
  checkboxRow: "flex items-center gap-2 text-[11px] mt-5",
  sectionTitle:
    "text-xs font-medium mb-2 flex items-center justify-between text-[color:var(--muted)]",
  pill:
    "inline-flex items-center gap-1 rounded-full bg-[color:var(--surface-soft)] px-2 py-0.5 text-[10px] text-[color:var(--muted)]",
  itemRow:
    "grid grid-cols-1 gap-2 md:grid-cols-12 rounded-2xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] p-3",
  itemNote: "md:col-span-11",
  dangerBtn:
    "inline-flex items-center justify-center rounded-full border border-rose-500/60 bg-rose-500/10 px-3 py-1 text-[10px] text-rose-200 hover:bg-rose-500/20 transition",
  ghostBtn:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--primary)]/70 bg-transparent px-3 py-1 text-[10px] text-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 transition",
  primaryBtn:
    "inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-5 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-soft)] transition disabled:opacity-60 disabled:cursor-not-allowed",
  secondaryLink:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-2 text-xs text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition",
  alertError:
    "mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100",
  alertSuccess:
    "mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100",
};

export default function EditBomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectTypeId, setProjectTypeId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const [items, setItems] = useState<BomItemInput[]>([]);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectTypeOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // بارگذاری اطلاعات BOM + محصولات + نوع پروژه‌ها
  useEffect(() => {
    async function loadAll() {
      try {
        setError(null);
        setSuccess(null);
        setLoadingInitial(true);

        const [bomRes, prodRes, typeRes] = await Promise.allSettled([
          fetch(`/api/bom-templates/${id}`),
          fetch("/api/products?simple=1"),
          fetch("/api/project-types?simple=1"),
        ]);

        if (bomRes.status === "fulfilled") {
          if (!bomRes.value.ok) {
            const data = await bomRes.value.json().catch(() => null);
            throw new Error(data?.error || "خطا در دریافت اطلاعات BOM");
          }
          const data = (await bomRes.value.json()) as BomTemplateResponse;

          setName(data.name || "");
          setTitle(data.title || "");
          setDescription(data.description || "");
          setProjectTypeId(
            data.projectTypeId ? String(data.projectTypeId) : "",
          );
          setIsActive(data.isActive);

          if (data.items && data.items.length > 0) {
            setItems(
              data.items.map((i) => ({
                productId: String(i.productId),
                quantity: String(i.quantity ?? ""),
                quantityPerUnit: String(
                  i.quantityPerUnit && i.quantityPerUnit !== 0
                    ? i.quantityPerUnit
                    : 1,
                ),
                unit: i.unit ?? i.product?.unit ?? "",
                stageName: i.stageName ?? "",
                note: i.note ?? "",
              })),
            );
          } else {
            setItems([
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
        } else {
          throw new Error("عدم دسترسی به سرور BOM");
        }

        if (prodRes.status === "fulfilled" && prodRes.value.ok) {
          const data = await prodRes.value.json();
          setProducts(
            Array.isArray(data)
              ? data.map((p: any) => ({
                  id: p.id,
                  name: p.name ?? "",
                  sku: p.sku,
                  unit: p.unit,
                }))
              : [],
          );
        }

        if (typeRes.status === "fulfilled" && typeRes.value.ok) {
          const data = await typeRes.value.json();
          setProjectTypes(
            Array.isArray(data)
              ? data.map((t: any) => ({
                  id: t.id,
                  name: t.name ?? "",
                  code: t.code,
                }))
              : [],
          );
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "خطا در بارگذاری اطلاعات BOM");
      } finally {
        setLoadingInitial(false);
      }
    }

    if (id) {
      loadAll();
    }
  }, [id]);

  function updateItem(index: number, field: keyof BomItemInput, value: string) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function addItemRow() {
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

  function removeItemRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const payload = {
      name: name.trim(),
      title: title.trim() || name.trim(),
      description: description.trim() || undefined,
      projectTypeId: projectTypeId ? Number(projectTypeId) : undefined,
      isActive,
      items: items
        .filter((i) => i.productId && i.quantity)
        .map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
          quantityPerUnit: i.quantityPerUnit
            ? Number(i.quantityPerUnit)
            : 1,
          unit: i.unit || undefined,
          stageName: i.stageName || undefined,
          note: i.note || undefined,
        })),
    };

    if (!payload.name) {
      setSaving(false);
      setError("نام داخلی BOM الزامی است.");
      return;
    }
    if (payload.items.length === 0) {
      setSaving(false);
      setError("حداقل یک آیتم BOM باید وارد شود.");
      return;
    }

    try {
      const res = await fetch(`/api/bom-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "خطا در ویرایش BOM");
      } else {
        setSuccess("تغییرات BOM با موفقیت ذخیره شد.");
      }
    } catch (err) {
      console.error(err);
      setError("خطای غیرمنتظره در ذخیره تغییرات.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("آیا از حذف این BOM مطمئن هستید؟ این عملیات قابل بازگشت نیست.")) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`/api/bom-templates/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "خطا در حذف BOM");
      } else {
        router.push("/dashboard/bom");
      }
    } catch (err) {
      console.error(err);
      setError("خطای غیرمنتظره در حذف BOM.");
    } finally {
      setDeleting(false);
    }
  }

  if (!id) {
    return (
      <div className={cls.wrap}>
        <div className={cls.alertError}>شناسه BOM نامعتبر است.</div>
      </div>
    );
  }

  if (loadingInitial) {
    return (
      <div className={cls.wrap}>
        <div className={cls.card}>
          <div className="text-xs text-[color:var(--muted)]">
            در حال بارگذاری اطلاعات BOM...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cls.wrap} dir="rtl">
      {/* هدر */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className={cls.title}>ویرایش BOM</h1>
          <p className={cls.subtitle}>
            اصلاح مقادیر استاندارد مصرف برای این لیست BOM. تغییرات روی پروژه‌های
            آینده اعمال می‌شود.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className={cls.secondaryLink}
            onClick={() => router.push("/dashboard/bom")}
          >
            ← بازگشت به لیست BOM
          </button>
          <button
            type="button"
            className={cls.dangerBtn}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "در حال حذف..." : "حذف BOM"}
          </button>
        </div>
      </div>

      {/* فرم */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* اطلاعات کلی */}
        <div className={cls.card}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={cls.label}>نام داخلی BOM *</label>
              <input
                className={cls.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً BOM_VILLA_3X7"
              />
            </div>

            <div>
              <label className={cls.label}>عنوان نمایشی</label>
              <input
                className={cls.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً BOM استاندارد کانکس ویلایی ۳×۷"
              />
            </div>

            <div>
              <label className={cls.label}>نوع پروژه (اختیاری)</label>
              {projectTypes.length > 0 ? (
                <select
                  className={cls.input}
                  value={projectTypeId}
                  onChange={(e) => setProjectTypeId(e.target.value)}
                >
                  <option value="">— انتخاب نشده —</option>
                  {projectTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.code ? `(${t.code})` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={cls.input}
                  value={projectTypeId}
                  onChange={(e) => setProjectTypeId(e.target.value)}
                  placeholder="در صورت نیاز، شناسه نوع پروژه"
                />
              )}
            </div>

            <div className="flex items-end">
              <label className={cls.checkboxRow}>
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-[color:var(--line-soft)] bg-[color:var(--surface-soft)]"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>این BOM فعال باشد</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className={cls.label}>توضیحات</label>
              <textarea
                rows={2}
                className={cls.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* آیتم‌ها */}
        <div className={cls.card}>
          <div className={cls.sectionTitle}>
            <span>آیتم‌های BOM (مصرف استاندارد)</span>
            <span className={cls.pill}>{items.length} ردیف</span>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div key={index} className={cls.itemRow}>
                {/* کالا */}
                <div className="md:col-span-4">
                  <label className={cls.label}>کالا *</label>
                  {products.length > 0 ? (
                    <select
                      className={cls.input}
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(index, "productId", e.target.value)
                      }
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
                  ) : (
                    <input
                      className={cls.input}
                      placeholder="ID کالا"
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(index, "productId", e.target.value)
                      }
                    />
                  )}
                </div>

                {/* مقدار استاندارد کل */}
                <div className="md:col-span-2">
                  <label className={cls.label}>مقدار استاندارد *</label>
                  <input
                    className={cls.input}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                    placeholder="مثلاً 120"
                  />
                </div>

                {/* واحد */}
                <div className="md:col-span-2">
                  <label className={cls.label}>واحد</label>
                  <input
                    className={cls.input}
                    value={item.unit}
                    onChange={(e) =>
                      updateItem(index, "unit", e.target.value)
                    }
                    placeholder="متر، عدد، کیلو..."
                  />
                </div>

                {/* مقدار برای هر واحد سازه */}
                <div className="md:col-span-2">
                  <label className={cls.label}>مقدار برای هر واحد</label>
                  <input
                    className={cls.input}
                    value={item.quantityPerUnit}
                    onChange={(e) =>
                      updateItem(index, "quantityPerUnit", e.target.value)
                    }
                    placeholder="پیش‌فرض ۱"
                  />
                </div>

                {/* مرحله مصرف */}
                <div className="md:col-span-2">
                  <label className={cls.label}>مرحله مصرف (اختیاری)</label>
                  <select
                    className={cls.input}
                    value={item.stageName}
                    onChange={(e) =>
                      updateItem(index, "stageName", e.target.value)
                    }
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
                <div className={`${cls.itemNote}`}>
                  <label className={cls.label}>توضیح ردیف (اختیاری)</label>
                  <textarea
                    rows={1}
                    className={cls.textarea}
                    value={item.note}
                    onChange={(e) =>
                      updateItem(index, "note", e.target.value)
                    }
                    placeholder="مثلاً برای دیواره‌های طولی سازه، ورق گالوانیزه 0.5..."
                  />
                </div>

                {/* حذف ردیف */}
                <div className="flex items-start justify-end md:col-span-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      className={cls.dangerBtn}
                      onClick={() => removeItemRow(index)}
                    >
                      ✕ حذف
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className={cls.ghostBtn}
              onClick={addItemRow}
            >
              + افزودن ردیف جدید
            </button>
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={cls.primaryBtn}
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <button
            type="button"
            className={cls.secondaryLink}
            onClick={() => router.push("/dashboard/bom")}
          >
            انصراف
          </button>
        </div>

        {error && <div className={cls.alertError}>{error}</div>}
        {success && <div className={cls.alertSuccess}>{success}</div>}
      </form>
    </div>
  );
}
