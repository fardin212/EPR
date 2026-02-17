"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EstimateQtyUnit } from "@prisma/client";
import {
  getOrCreateEstimateBom,
  upsertEstimateBomLine,
  deleteEstimateBomLine,
  refreshBomPricesFromMaterials,
  finalizeEstimateBom,
  unfinalizeEstimateBom,
} from "@/app/actions/container-estimate-bom";

type Material = {
  id: number;
  name: string;
  unit: string;
  unitPrice: number;
  priceBasis: string;
  kgPerPiece: number | null;
  kgPerBranch: number | null;
};

type BomLine = {
  id: number;
  materialId: number;
  materialName: string;
  qty: number;
  qtyUnit?: EstimateQtyUnit | null;
  qtyUnitCustom?: string | null;
  unitPrice: number;
  lineTotal: number;
  note?: string | null;
};

type InitialBom =
  | null
  | {
      id: number;
      status: string;
      finalizedAt?: string | null;
      estimate: any;
      lines: BomLine[];
    };

// ✅ 1) لیبل فارسی واحدها (نمایش)
const UNIT_LABEL_FA: Record<string, string> = {
  KG: "کیلوگرم",
  BRANCH: "شاخه",
  PIECE: "عدد",
  M: "متر",
  M2: "متر مربع",
  LUMP_SUM: "مقطوع",
};

function unitLabelFa(u?: string | null) {
  if (!u) return "—";
  return UNIT_LABEL_FA[u] ?? u;
}

// ✅ 3) نرمال‌سازی نام مصالح در UI
function normalizeMaterialName(name?: string | null) {
  if (!name) return "—";
  return String(name).replace(/ورق بدنه\s*23/g, "ورق بدنه 25");
}

export default function BomClient({
  estimateId,
  initialBom,
  materials,
}: {
  estimateId: number;
  initialBom: InitialBom;
  materials: Material[];
}) {
  const [bomId, setBomId] = useState<number | null>(initialBom?.id ?? null);
  const [lines, setLines] = useState<BomLine[]>(initialBom?.lines ?? []);
  const [loading, setLoading] = useState(!initialBom);
  const [err, setErr] = useState<string | null>(null);

  const [status, setStatus] = useState<string>(initialBom?.status ?? "DRAFT");
  const [finalizedAt, setFinalizedAt] = useState<string | null>(
    initialBom?.finalizedAt ?? null
  );

  // ✅ حالت ویرایش
  const [editingLineId, setEditingLineId] = useState<number | null>(null);

  // form for new/edit line
  const [materialId, setMaterialId] = useState<number | "">("");
  const [qty, setQty] = useState<number>(1);
  const [unitMode, setUnitMode] = useState<"ENUM" | "CUSTOM">("ENUM");
  const [qtyUnit, setQtyUnit] = useState<EstimateQtyUnit>(EstimateQtyUnit.PIECE);
  const [qtyUnitCustom, setQtyUnitCustom] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  const total = useMemo(
    () => lines.reduce((s, l) => s + Number(l.lineTotal || 0), 0),
    [lines]
  );

  function resetForm() {
    setEditingLineId(null);
    setMaterialId("");
    setQty(1);
    setQtyUnit(EstimateQtyUnit.PIECE);
    setQtyUnitCustom("");
    setUnitMode("ENUM");
    setUnitPrice(0);
    setNote("");
  }

  async function reloadBom() {
    const bom = await getOrCreateEstimateBom(estimateId);

    setBomId((bom as any).id);
    setLines((bom as any).lines ?? []);
    setStatus((bom as any).status ?? "DRAFT");
    setFinalizedAt((bom as any).finalizedAt ?? null);
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        await reloadBom();
      } catch (e: any) {
        setErr(e?.message || "خطا در دریافت BOM");
      } finally {
        setLoading(false);
      }
    }

    if (!initialBom) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimateId, initialBom]);

  useEffect(() => {
    if (!materialId) return;
    const m = materials.find((x) => x.id === materialId);
    if (m && editingLineId === null) {
      // فقط در حالت افزودن، قیمت را از متریال پر کن
      setUnitPrice(m.unitPrice);
    }
  }, [materialId, materials, editingLineId]);

  // ✅ شروع ویرایش یک ردیف
  function startEdit(line: BomLine) {
    setErr(null);
    setEditingLineId(line.id);

    setMaterialId(line.materialId);
    setQty(Number(line.qty ?? 0));

    const hasCustom = !!line.qtyUnitCustom?.trim();
    setUnitMode(hasCustom ? "CUSTOM" : "ENUM");
    setQtyUnit((line.qtyUnit ?? EstimateQtyUnit.PIECE) as EstimateQtyUnit);
    setQtyUnitCustom(line.qtyUnitCustom ?? "");

    setUnitPrice(Number(line.unitPrice ?? 0));
    setNote(line.note ?? "");
  }

  async function saveLine() {
    setErr(null);
    if (!bomId) return;

    const mid = Number(materialId);
    if (!mid) return setErr("مصالح را انتخاب کن");

    const isCustom = unitMode === "CUSTOM";
    if (isCustom && !qtyUnitCustom.trim()) return setErr("واحد سفارشی را وارد کن");

    try {
      // ✅ اگر در حالت ویرایش هستیم، lineId را پاس می‌دهیم
      // نکته: اگر اکشن شما به جای lineId از id استفاده می‌کند،
      // فقط همین یک کلید را از lineId به id تغییر بده.
      await upsertEstimateBomLine({
        bomId,
        lineId: editingLineId ?? undefined, // ✅ EDIT
        materialId: mid,
        qty,
        qtyUnit: isCustom ? null : qtyUnit,
        qtyUnitCustom: isCustom ? qtyUnitCustom : null,
        unitPrice,
        note,
      } as any);

      await reloadBom();
      resetForm();
    } catch (e: any) {
      setErr(e?.message || (editingLineId ? "خطا در ویرایش ردیف" : "خطا در ثبت ردیف"));
    }
  }

  async function removeLine(lineId: number) {
    setErr(null);
    if (!bomId) return;

    try {
      await deleteEstimateBomLine(bomId, lineId);
      // اگر ردیفی که در حال ویرایش بود حذف شد، فرم ریست شود
      if (editingLineId === lineId) resetForm();
      await reloadBom();
    } catch (e: any) {
      setErr(e?.message || "خطا در حذف ردیف");
    }
  }

  async function refreshPrices() {
    setErr(null);
    if (!bomId) return;

    try {
      await refreshBomPricesFromMaterials(bomId);
      await reloadBom();
    } catch (e: any) {
      setErr(e?.message || "خطا در بروزرسانی قیمت‌ها");
    }
  }

  async function doFinalize() {
    setErr(null);
    if (!bomId) return;

    try {
      await finalizeEstimateBom(bomId);
      await reloadBom();
    } catch (e: any) {
      setErr(e?.message || "خطا در نهایی‌سازی BOM");
    }
  }

  async function doUnfinalize() {
    setErr(null);
    if (!bomId) return;

    try {
      await unfinalizeEstimateBom(bomId);
      await reloadBom();
    } catch (e: any) {
      setErr(e?.message || "خطا در بازگشت به پیش‌نویس");
    }
  }

  if (loading) return <div className="p-6">در حال بارگذاری…</div>;

  return (
    <div className="p-6 max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">ریزمصرف داخلی (BOM)</h1>
          <p className="text-sm text-gray-500 mt-1">
            این صفحه فقط داخلی است. پیش‌فاکتور مشتری ریزمصرف ندارد.
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                status === "FINAL"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              }`}
            >
              {status === "FINAL" ? "نهایی" : "پیش‌نویس"}
            </span>

            {finalizedAt && (
              <span className="text-xs text-gray-500">
                تاریخ نهایی: {new Date(finalizedAt).toLocaleDateString("fa-IR")}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
            onClick={refreshPrices}
            type="button"
          >
            بروزرسانی قیمت‌ها از قیمت روز
          </button>

          <button
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
            onClick={doFinalize}
            type="button"
          >
            نهایی‌سازی BOM
          </button>

          <button
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
            onClick={doUnfinalize}
            type="button"
          >
            بازگشت به پیش‌نویس
          </button>
		  
		  {/* ✅ دکمه خروجی PDF BOM */}
		  <Link
		     href={`/dashboard/container-estimates/${estimateId}/bom/pdf`}
			 target="_blank"
			 className="rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-2 hover:bg-indigo-100"
		  >
		    خروجی PDF BOM
		  </Link>

          <Link
            className="rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700"
            href={`/dashboard/container-estimates/${estimateId}`}
          >
            بازگشت به پیش‌فاکتور
          </Link>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Add/Edit line */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="font-semibold">
            {editingLineId ? "ویرایش ردیف" : "افزودن ردیف"}
          </div>

          {editingLineId && (
            <button
              type="button"
              className="rounded-lg border px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={resetForm}
            >
              انصراف
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-5">
            <select
              className="border p-2 rounded w-full"
              value={materialId}
              onChange={(e) =>
                setMaterialId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">انتخاب مصالح</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {normalizeMaterialName(m.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              min={0}
              step="0.001"
              placeholder="مقدار"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              className="border p-2 rounded w-full"
              value={unitMode}
              onChange={(e) => setUnitMode(e.target.value as any)}
            >
              <option value="ENUM">واحد استاندارد</option>
              <option value="CUSTOM">واحد سفارشی</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            {unitMode === "ENUM" ? (
              <select
                className="border p-2 rounded w-full"
                value={qtyUnit}
                onChange={(e) => setQtyUnit(e.target.value as EstimateQtyUnit)}
              >
                {Object.values(EstimateQtyUnit).map((u) => (
                  <option key={u} value={u}>
                    {unitLabelFa(u)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="border p-2 rounded w-full"
                value={qtyUnitCustom}
                onChange={(e) => setQtyUnitCustom(e.target.value)}
                placeholder="مثلاً: کارتن / بسته / ورق / ست ..."
              />
            )}
          </div>

          <div className="sm:col-span-3">
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              min={0}
              step="1"
              placeholder="قیمت واحد (قابل ویرایش)"
            />
          </div>

          <div className="sm:col-span-7">
            <input
              className="border p-2 rounded w-full"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="یادداشت (اختیاری)"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              className={`w-full rounded-lg px-3 py-2 text-white ${
                editingLineId ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={saveLine}
              type="button"
            >
              {editingLineId ? "ذخیره تغییرات" : "افزودن"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-right">
              <th className="px-4 py-3 font-semibold">مصالح</th>
              <th className="px-4 py-3 font-semibold">مقدار</th>
              <th className="px-4 py-3 font-semibold">واحد</th>
              <th className="px-4 py-3 font-semibold">قیمت واحد</th>
              <th className="px-4 py-3 font-semibold">جمع</th>
              <th className="px-4 py-3 font-semibold">یادداشت</th>
              <th className="px-4 py-3 font-semibold">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  هنوز ردیفی ثبت نشده.
                </td>
              </tr>
            ) : (
              lines.map((l) => (
                <tr
                  key={l.id}
                  className={`border-t ${editingLineId === l.id ? "bg-amber-50/40" : ""}`}
                >
                  <td className="px-4 py-3 font-medium">
                    {normalizeMaterialName(l.materialName)}
                  </td>

                  <td className="px-4 py-3">{l.qty}</td>

                  <td className="px-4 py-3">
                    {l.qtyUnitCustom?.trim()
                      ? l.qtyUnitCustom
                      : unitLabelFa(l.qtyUnit)}
                  </td>

                  <td className="px-4 py-3">
                    {Number(l.unitPrice || 0).toLocaleString("fa-IR")}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {Number(l.lineTotal || 0).toLocaleString("fa-IR")}
                  </td>

                  <td className="px-4 py-3">{l.note ?? "—"}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        className="text-blue-600"
                        onClick={() => startEdit(l)}
                        type="button"
                      >
                        ویرایش
                      </button>

                      <button
                        className="text-red-600"
                        onClick={() => removeLine(l.id)}
                        type="button"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-700">
        جمع BOM:{" "}
        <span className="font-bold">{total.toLocaleString("fa-IR")}</span>{" "}
        تومان
      </div>
    </div>
  );
}
