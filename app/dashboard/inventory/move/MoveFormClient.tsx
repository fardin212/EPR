"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type WarehouseDto = {
  id: number;
  name: string;
  code: string;
};

type ProductDto = {
  id: number;
  name: string;
  sku: string;
  unit: string;
};

type Props = {
  warehouses: WarehouseDto[];
  products: ProductDto[];
};

type Direction = "IN" | "OUT";

type LineState = {
  id: number;
  warehouseId: string;
  productId: string;
  qty: string;
  note: string;
};

const cls = {
  shell: "space-y-4",
  card:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3",
  label: "block text-[11px] mb-1",
  input:
    "w-full rounded-md border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)]",
  select:
    "w-full rounded-md border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)]",
  textarea:
    "w-full rounded-md border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)] resize-y",
  primaryBtn:
    "inline-flex items-center justify-center rounded-md bg-[color:var(--primary)] px-4 py-1.5 text-xs font-medium text-white hover:bg-[color:var(--primary-soft)] transition disabled:opacity-60 disabled:cursor-not-allowed",
  secondaryBtn:
    "inline-flex items-center justify-center rounded-md border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-xs text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]",
  toolbarTitle: "text-sm font-semibold",
  toolbarSub: "text-[11px] text-[color:var(--muted)]",
  chip:
    "inline-flex items-center rounded-full border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-2 py-0.5 text-[10px] text-[color:var(--muted)]",
  alertError:
    "mt-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100",
  alertSuccess:
    "mt-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100",
};

const jalaliFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "short",
});

export default function MoveFormClient({ warehouses, products }: Props) {
  const router = useRouter();

  const [direction, setDirection] = useState<Direction>("IN");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");

  const [lines, setLines] = useState<LineState[]>([
    { id: 1, warehouseId: "", productId: "", qty: "", note: "" },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const jalaliDate = useMemo(() => {
    if (!date) return "";
    try {
      return jalaliFormatter.format(new Date(date));
    } catch {
      return "";
    }
  }, [date]);

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        warehouseId: "",
        productId: "",
        qty: "",
        note: "",
      },
    ]);
  }

  function removeLine(id: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  function updateLine(
    id: number,
    patch: Partial<Pick<LineState, "warehouseId" | "productId" | "qty" | "note">>,
  ) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanedLines = lines
      .map((l) => ({
        warehouseId: Number(l.warehouseId),
        productId: Number(l.productId),
        qty: Number(l.qty),
        note: l.note.trim() || undefined,
      }))
      .filter(
        (l) =>
          !Number.isNaN(l.warehouseId) &&
          !Number.isNaN(l.productId) &&
          l.qty > 0,
      );

    if (cleanedLines.length === 0) {
      setError("حداقل یک ردیف کالای معتبر (کالا + انبار + مقدار) وارد کنید.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/inventory/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction,
          date,
          reference: reference.trim() || undefined,
          description: description.trim() || undefined,
          lines: cleanedLines,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "خطا در ثبت حرکت انبار.");
      } else {
        setSuccess(`حرکت انبار با ${data?.count ?? cleanedLines.length} ردیف ثبت شد.`);
        setLines([{ id: 1, warehouseId: "", productId: "", qty: "", note: "" }]);
        setReference("");
        setDescription("");
      }
    } catch (err) {
      console.error(err);
      setError("خطای غیرمنتظره در ارتباط با سرور.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cls.shell} dir="rtl">
      {/* نوار ابزار شبیه SAP */}
      <div className="flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 shadow-sm">
        <div>
          <div className={cls.toolbarTitle}>سند حرکت موجودی</div>
          <div className={cls.toolbarSub}>
            ثبت چند ردیف کالا در یک سند انبار با کنترل تاریخ و نوع عملیات.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={cls.chip}>
            نوع عملیات:{" "}
            {direction === "IN" ? "ورود به انبار" : "خروج از انبار"}
          </span>
          {jalaliDate && (
            <span className={cls.chip}>تاریخ شمسی: {jalaliDate}</span>
          )}

          <button type="submit" className={cls.primaryBtn} disabled={saving}>
            {saving ? "در حال ثبت..." : "ثبت سند"}
          </button>
          <button
            type="button"
            className={cls.secondaryBtn}
            onClick={() => router.push("/dashboard/inventory")}
          >
            انصراف
          </button>
        </div>
      </div>

      {/* اطلاعات کلی سند */}
      <div className={cls.card}>
        <div className="grid gap-4 md:grid-cols-3">
          {/* نوع عملیات */}
          <div>
            <div className={cls.label}>نوع عملیات *</div>
            <div className="flex items-center gap-4 text-[11px]">
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value="IN"
                  checked={direction === "IN"}
                  onChange={() => setDirection("IN")}
                  className="h-3 w-3"
                />
                ورود به انبار
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="direction"
                  value="OUT"
                  checked={direction === "OUT"}
                  onChange={() => setDirection("OUT")}
                  className="h-3 w-3"
                />
                خروج از انبار
              </label>
            </div>
          </div>

          {/* تاریخ سند */}
          <div>
            <label className={cls.label}>تاریخ سند</label>
            <input
              type="date"
              className={cls.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {jalaliDate && (
              <div className="mt-1 text-[10px] text-[color:var(--muted)]">
                معادل شمسی: {jalaliDate}
              </div>
            )}
          </div>

          {/* شماره مرجع */}
          <div>
            <label className={cls.label}>شماره مرجع (فاکتور / حواله)</label>
            <input
              className={cls.input}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="مثلاً شماره فاکتور، حواله، رسید..."
            />
          </div>
        </div>

        <div className="mt-3">
          <label className={cls.label}>توضیحات کلی سند</label>
          <textarea
            className={cls.textarea}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="هر توضیح کلی در مورد این عملیات (مثلاً انتقال بین انبارها، مرجوعی از مشتری و ...)"
          />
        </div>
      </div>

      {/* ردیف‌های کالا به سبک جدول SAP */}
      <div className={cls.card}>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold">ردیف‌های کالا</div>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center rounded-md border border-[color:var(--primary)] px-3 py-1 text-[11px] text-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white transition"
          >
            + افزودن ردیف
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)]">
          <table className="min-w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-[color:var(--surface)] text-[color:var(--muted)]">
                <th className="border-b border-[color:var(--line-soft)] px-2 py-2 text-center w-10">
                  #
                </th>
                <th className="border-b border-[color:var(--line-soft)] px-2 py-2 text-right">
                  انبار
                </th>
                <th className="border-b border-[color:var(--line-soft)] px-2 py-2 text-right">
                  کالا
                </th>
                <th className="border-b border-[color:var(--line-soft)] px-2 py-2 text-center w-40">
                  مقدار / واحد
                </th>
                <th className="border-b border-[color:var(--line-soft)] px-2 py-2 text-right">
                  توضیح ردیف
                </th>
                <th className="border-b border-[color:var(--line-soft)] px-2 py-2 text-center w-10">
                  حذف
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => {
                const selectedProduct = products.find(
                  (p) => p.id === Number(line.productId),
                );

                return (
                  <tr
                    key={line.id}
                    className={
                      idx % 2 === 0
                        ? "bg-[color:var(--surface-soft)]"
                        : "bg-[color:var(--surface)]"
                    }
                  >
                    {/* شماره ردیف */}
                    <td className="border-t border-[color:var(--line-soft)] px-2 py-2 text-center">
                      {idx + 1}
                    </td>

                    {/* انبار */}
                    <td className="border-t border-[color:var(--line-soft)] px-2 py-2">
                      <select
                        className={cls.select}
                        value={line.warehouseId}
                        onChange={(e) =>
                          updateLine(line.id, { warehouseId: e.target.value })
                        }
                      >
                        <option value="">انتخاب انبار...</option>
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.code})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* کالا */}
                    <td className="border-t border-[color:var(--line-soft)] px-2 py-2">
                      <select
                        className={cls.select}
                        value={line.productId}
                        onChange={(e) =>
                          updateLine(line.id, { productId: e.target.value })
                        }
                      >
                        <option value="">انتخاب کالا...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.sku}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* مقدار + واحد */}
                    <td className="border-t border-[color:var(--line-soft)] px-2 py-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="h-6 w-6 flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-xs hover:bg-[color:var(--primary)] hover:text-white transition"
                          onClick={() =>
                            updateLine(line.id, {
                              qty: String(
                                Math.max(0, Number(line.qty || 0) - 1),
                              ),
                            })
                          }
                        >
                          -
                        </button>

                        <input
                          className={`${cls.input} w-20 text-center`}
                          value={line.qty}
                          onChange={(e) =>
                            updateLine(line.id, { qty: e.target.value })
                          }
                        />

                        <button
                          type="button"
                          className="h-6 w-6 flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-xs hover:bg-[color:var(--primary)] hover:text-white transition"
                          onClick={() =>
                            updateLine(line.id, {
                              qty: String(Number(line.qty || 0) + 1),
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                      {selectedProduct?.unit && (
                        <div className="mt-1 text-[10px] text-[color:var(--muted)] text-center">
                          واحد: {selectedProduct.unit}
                        </div>
                      )}
                    </td>

                    {/* توضیح ردیف */}
                    <td className="border-t border-[color:var(--line-soft)] px-2 py-2">
                      <input
                        className={cls.input}
                        value={line.note}
                        onChange={(e) =>
                          updateLine(line.id, { note: e.target.value })
                        }
                        placeholder="مثلاً ضایعات، مرجوعی..."
                      />
                    </td>

                    {/* حذف */}
                    <td className="border-t border-[color:var(--line-soft)] px-2 py-2 text-center">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="h-6 w-6 flex items-center justify-center rounded-full border border-rose-500/60 text-[11px] text-rose-200 hover:bg-rose-500 hover:text-white transition"
                          title="حذف ردیف"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* پیام‌ها */}
      {error && <div className={cls.alertError}>{error}</div>}
      {success && <div className={cls.alertSuccess}>{success}</div>}
    </form>
  );
}
