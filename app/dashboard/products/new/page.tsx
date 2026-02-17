"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; title: string; code: string; nextSeq: number };

type UnitType = "PIECE" | "KG" | "M" | "M2" | "PACK" | "ROLL";

const unitLabels: Record<UnitType, string> = {
  PIECE: "عدد",
  KG: "کیلوگرم",
  M: "متر",
  M2: "مترمربع",
  PACK: "بسته",
  ROLL: "کلاف/رول",
};

const cls = {
  // layout
  page: "min-h-[calc(100vh-80px)] bg-transparent",
  wrap: "max-w-5xl mx-auto px-4 py-6 text-[color:var(--text)]",
  header:
    "mb-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 shadow-sm",
  breadcrumb: "text-[11px] text-[color:var(--muted)]",
  titleRow: "mt-1 flex items-start justify-between gap-4",
  title: "text-lg sm:text-xl font-semibold tracking-tight",
  subtitle: "mt-1 text-xs leading-5 text-[color:var(--muted)] max-w-2xl",
  backBtn:
    "shrink-0 inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-2 text-xs text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition",

  // section
  sectionTitle: "mb-2 text-sm font-semibold text-[color:var(--text)]",
  sectionHint: "mb-4 text-[11px] text-[color:var(--muted)]",
  card:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 sm:p-5 shadow-sm",

  // form
  label: "block text-[11px] mb-1 text-[color:var(--muted)]",
  input:
    "w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]",
  inputStrong:
    "w-full rounded-xl border-2 border-[color:var(--primary-soft)] bg-[color:var(--surface-soft)] px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]",
  textarea:
    "w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] resize-y",
  helper: "mt-1 text-[10px] text-[color:var(--muted)]",

  // badges / pills
  pill:
    "inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-1 text-[11px] text-[color:var(--muted)]",
  badge:
    "inline-flex items-center rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] border border-[color:var(--primary)]/20 px-2.5 py-1 text-[11px] font-semibold",

  // pack box
  packBox:
    "rounded-2xl border border-dashed border-[color:var(--primary)]/50 bg-[color:var(--surface-soft)] p-4",

  // alerts
  alertError:
    "rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100",
  alertSuccess:
    "rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100",

  // sticky actions
  stickyBar:
    "sticky bottom-4 mt-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-3 shadow-lg",
  primaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--primary-soft)] transition shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed",
  secondaryBtn:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-5 py-2.5 text-sm text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition",
};

function pad(num: number, size = 4) {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

export default function NewProductPage() {
  const router = useRouter();

  const [cats, setCats] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [stockUnit, setStockUnit] = useState<UnitType>("PIECE");

  const [purchaseUnitEnabled, setPurchaseUnitEnabled] = useState(false);
  const [purchaseUnit, setPurchaseUnit] = useState<UnitType>("PACK");
  const [packSize, setPackSize] = useState<string>("");

  const [minStock, setMinStock] = useState<string>("0");
  const [description, setDescription] = useState("");

  const [manualSku, setManualSku] = useState(false);
  const [sku, setSku] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCats(true);
      try {
        const res = await fetch("/api/inventory/categories", { cache: "no-store" });
        const data = await res.json();
        if (!mounted) return;
        setCats(Array.isArray(data) ? data : []);
      } catch {
        if (!mounted) return;
        setCats([]);
      } finally {
        if (mounted) setLoadingCats(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedCat = useMemo(
    () => cats.find((c) => c.id === categoryId) || null,
    [cats, categoryId]
  );

  const autoSkuPreview = useMemo(() => {
    if (!selectedCat) return "";
    return `${selectedCat.code}-${pad(selectedCat.nextSeq || 1, 4)}`;
  }, [selectedCat]);

  useEffect(() => {
    if (!manualSku) setSku(autoSkuPreview);
  }, [autoSkuPreview, manualSku]);

  const needsPackSize = purchaseUnitEnabled;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) return setError("نام کالا الزامی است.");
    if (!categoryId) return setError("دسته‌بندی الزامی است.");
    if (!stockUnit) return setError("واحد مصرف الزامی است.");

    if (purchaseUnitEnabled) {
      const ps = Number(packSize);
      if (!Number.isFinite(ps) || ps <= 0)
        return setError("ضریب تبدیل (packSize) باید بزرگ‌تر از صفر باشد.");
      if (!purchaseUnit) return setError("واحد خرید را انتخاب کنید.");
    }

    const ms = Number(minStock);
    if (!Number.isFinite(ms) || ms < 0) return setError("حداقل موجودی نامعتبر است.");

    setLoading(true);
    try {
      const payload: any = {
        sku: manualSku ? sku.trim() : "",
        name: name.trim(),
        categoryId,
        description: description.trim() || null,
        stockUnit,
        minStock: ms,
      };

      if (purchaseUnitEnabled) {
        payload.purchaseUnit = purchaseUnit;
        payload.packSize = Number(packSize);
      } else {
        payload.purchaseUnit = null;
        payload.packSize = null;
      }

      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "خطا در ثبت کالا");
      } else {
        setSuccess("کالا با موفقیت ثبت شد. در حال انتقال به لیست موجودی...");
        setTimeout(() => router.push("/dashboard/inventory"), 700);
      }
    } catch (err) {
      console.error(err);
      setError("خطای غیرمنتظره در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cls.page} dir="rtl">
      <div className={cls.wrap}>
        {/* Header */}
        <div className={cls.header}>
          <div className={cls.breadcrumb}>انبار و موجودی → کالاها → تعریف کالای جدید</div>

          <div className={cls.titleRow}>
            <div>
              <h1 className={cls.title}>تعریف کالای جدید</h1>
              <p className={cls.subtitle}>
                واحد مصرف (انبار) را انتخاب کنید. اگر خرید شما بسته/کلاف است، واحد خرید و ضریب تبدیل را وارد کنید.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={cls.pill}>
                  <span className="opacity-70">پیش‌نمایش کد:</span>
                  <span className="font-semibold">{autoSkuPreview || "—"}</span>
                </span>
                {selectedCat && (
                  <span className={cls.badge}>
                    {selectedCat.title} ({selectedCat.code})
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              className={cls.backBtn}
              onClick={() => router.push("/dashboard/inventory")}
            >
              ← بازگشت به انبار و موجودی‌ها
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1 */}
          <div>
            <h2 className={cls.sectionTitle}>اطلاعات اصلی کالا</h2>
            <p className={cls.sectionHint}>برای جلوگیری از تداخل در گزارش‌ها، دسته‌بندی و نام را دقیق وارد کنید.</p>

            <div className={cls.card}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* دسته‌بندی */}
                <div>
                  <label className={cls.label}>دسته‌بندی *</label>
                  <select
                    className={cls.inputStrong}
                    value={categoryId ?? ""}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                    disabled={loadingCats}
                  >
                    <option value="">{loadingCats ? "در حال بارگذاری..." : "انتخاب دسته‌بندی"}</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.code})
                      </option>
                    ))}
                  </select>
                  <div className={cls.helper}>این دسته‌بندی برای کدینگ خودکار و فیلترهای گزارش استفاده می‌شود.</div>
                </div>

                {/* SKU */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className={cls.label}>کد کالا (SKU)</label>
                    <label className="text-[11px] flex items-center gap-2 text-[color:var(--muted)] select-none">
                      <input
                        type="checkbox"
                        checked={manualSku}
                        onChange={(e) => setManualSku(e.target.checked)}
                      />
                      دستی وارد کنم
                    </label>
                  </div>

                  <input
                    className={cls.input}
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="مثلاً STL-0001"
                    disabled={!manualSku}
                  />

                  {!manualSku && (
                    <div className={cls.helper}>
                      کد اتومات: <span className="font-semibold">{autoSkuPreview || "—"}</span>
                    </div>
                  )}
                </div>

                {/* نام */}
                <div className="sm:col-span-2">
                  <label className={cls.label}>نام کالا *</label>
                  <input
                    className={cls.inputStrong}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً هالوژن صبا لایت ۷ وات"
                  />
                  <div className={cls.helper}>پیشنهاد: نوع + مشخصه + سایز/مدل</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className={cls.sectionTitle}>واحدها و موجودی</h2>
            <p className={cls.sectionHint}>
              موجودی انبار بر اساس «واحد مصرف» نگهداری می‌شود. اگر خرید شما بسته/کلاف است، تبدیل را تعریف کنید.
            </p>

            <div className={cls.card}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* واحد مصرف */}
                <div>
                  <label className={cls.label}>واحد مصرف / انبار (مرجع) *</label>
                  <select
                    className={cls.input}
                    value={stockUnit}
                    onChange={(e) => setStockUnit(e.target.value as UnitType)}
                  >
                    {(["PIECE", "KG", "M", "M2"] as UnitType[]).map((u) => (
                      <option key={u} value={u}>
                        {unitLabels[u]}
                      </option>
                    ))}
                  </select>
                  <div className={cls.helper}>موجودی انبار همیشه بر اساس این واحد نگهداری می‌شود.</div>
                </div>

                {/* حداقل موجودی */}
                <div>
                  <label className={cls.label}>حداقل موجودی (هشدار)</label>
                  <input
                    className={cls.input}
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="مثلاً 20"
                    inputMode="decimal"
                  />
                  <div className={cls.helper}>برای کالاهای مصرفی مقدار هشدار تنظیم کنید.</div>
                </div>

                {/* واحد خرید */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs font-semibold">واحد خرید و ضریب تبدیل</div>
                      <div className="text-[11px] text-[color:var(--muted)]">
                        فقط وقتی لازم است که خرید شما بسته/کلاف باشد.
                      </div>
                    </div>

                    <label className="text-[11px] flex items-center gap-2 text-[color:var(--muted)] select-none">
                      <input
                        type="checkbox"
                        checked={purchaseUnitEnabled}
                        onChange={(e) => {
                          setPurchaseUnitEnabled(e.target.checked);
                          if (!e.target.checked) setPackSize("");
                        }}
                      />
                      خرید بسته/کلاف دارم
                    </label>
                  </div>

                  {purchaseUnitEnabled ? (
                    <div className={cls.packBox}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={cls.label}>واحد خرید</label>
                          <select
                            className={cls.input}
                            value={purchaseUnit}
                            onChange={(e) => setPurchaseUnit(e.target.value as UnitType)}
                          >
                            {(["PACK", "ROLL", "KG", "PIECE", "M", "M2"] as UnitType[]).map((u) => (
                              <option key={u} value={u}>
                                {unitLabels[u]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={cls.label}>ضریب تبدیل خرید → مصرف (packSize)</label>
                          <input
                            className={cls.input}
                            value={packSize}
                            onChange={(e) => setPackSize(e.target.value)}
                            placeholder="مثلاً 10 (هر بسته 10 عدد) یا 100 (هر کلاف 100 متر)"
                            inputMode="decimal"
                          />
                          <div className={cls.helper}>
                            مثال: اگر واحد مصرف «عدد» است و هر بسته ۱۰ عدد دارد → packSize=10
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-[11px] text-[color:var(--muted)]">
                        پیش‌نمایش تبدیل:{" "}
                        <span className="font-semibold">
                          ۱ {unitLabels[purchaseUnit]} ≈ {packSize || "…"} {unitLabels[stockUnit]}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[color:var(--muted)]">
                      اگر کالا را مستقیم بر اساس واحد مصرف وارد می‌کنید، این بخش لازم نیست.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className={cls.sectionTitle}>توضیحات و ثبت</h2>
            <p className={cls.sectionHint}>مشخصات فنی، برند، مدل یا نکات مهم را اینجا ثبت کنید.</p>

            <div className={cls.card}>
              <label className={cls.label}>توضیحات</label>
              <textarea
                className={cls.textarea}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثل سایز، برند، مشخصات فنی..."
              />
              <div className={cls.helper}>این متن در گزارش‌ها و جستجو کمک‌کننده است.</div>
            </div>
          </div>

          {/* Sticky actions */}
          <div className={cls.stickyBar}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  className={cls.primaryBtn}
                  type="submit"
                  disabled={loading || (needsPackSize && !packSize)}
                >
                  {loading ? "در حال ثبت کالا..." : "ثبت و افزودن به انبار"}
                </button>

                <button
                  type="button"
                  className={cls.secondaryBtn}
                  onClick={() => router.push("/dashboard/inventory")}
                >
                  انصراف
                </button>
              </div>

              <div className="space-y-2">
                {error && <div className={cls.alertError}>{error}</div>}
                {success && <div className={cls.alertSuccess}>{success}</div>}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
