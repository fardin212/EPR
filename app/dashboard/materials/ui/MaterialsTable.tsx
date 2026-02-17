"use client";

import { useMemo, useState, useTransition } from "react";
import { updateMaterialPriceAction } from "../actions";

type Row = {
  id: number;
  name: string;
  unit: string;
  unitPrice: any;
  category: string | null;
  updatedAt: Date;
  _count: { priceHistory: number };
};

function faMoney(n: any) {
  return Number(n ?? 0).toLocaleString("fa-IR");
}

export default function MaterialsTable({
  companyId,
  materials,
}: {
  companyId: number;
  materials: Row[];
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");

  const [pending, startTransition] = useTransition();

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const m of materials) if (m.category) s.add(m.category);
    return Array.from(s).sort();
  }, [materials]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return materials.filter((m) => {
      const okQ = !qq || m.name.toLowerCase().includes(qq);
      const okC = !cat || (m.category || "") === cat;
      return okQ && okC;
    });
  }, [materials, q, cat]);

  async function submit(materialId: number, unitPrice: string) {
    const fd = new FormData();
    fd.set("companyId", String(companyId));
    fd.set("materialId", String(materialId));
    fd.set("unitPrice", unitPrice);
    fd.set("note", "آپدیت قیمت روزانه");

    startTransition(async () => {
      try {
        await updateMaterialPriceAction(fd);
      } catch (e: any) {
        alert(e?.message || "خطا در ذخیره قیمت");
      }
    });
  }

  return (
    <div className="rounded-xl border bg-white">
      {/* Toolbar */}
      <div className="p-4 border-b flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            className="w-full sm:w-72 rounded-lg border px-3 py-2"
            placeholder="جستجو: نام آیتم (مثلاً پروفیل)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="w-full sm:w-56 rounded-lg border px-3 py-2"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            <option value="">همه دسته‌ها</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500">
          {pending ? "در حال ذخیره..." : `تعداد: ${filtered.length}`}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-right">
              <th className="px-4 py-3 font-semibold">آیتم</th>
              <th className="px-4 py-3 font-semibold">دسته</th>
              <th className="px-4 py-3 font-semibold">واحد</th>
              <th className="px-4 py-3 font-semibold">قیمت روز</th>
              <th className="px-4 py-3 font-semibold">آخرین تغییر</th>
              <th className="px-4 py-3 font-semibold">تاریخچه</th>
              <th className="px-4 py-3 font-semibold">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                  موردی یافت نشد.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <MaterialRow
                  key={m.id}
                  row={m}
                  onSave={submit}
                  disabled={pending}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MaterialRow({
  row,
  onSave,
  disabled,
}: {
  row: Row;
  onSave: (materialId: number, unitPrice: string) => void;
  disabled: boolean;
}) {
  const [val, setVal] = useState<string>(String(Number(row.unitPrice ?? 0)));
  const changed = val.replace(/,/g, "").trim() !== String(Number(row.unitPrice ?? 0));

  return (
    <tr className="border-t">
      <td className="px-4 py-3 font-medium">{row.name}</td>
      <td className="px-4 py-3">{row.category || <span className="text-gray-400">—</span>}</td>
      <td className="px-4 py-3">{row.unit}</td>

      <td className="px-4 py-3">
        <input
          className="w-44 rounded-lg border px-3 py-2 text-left"
          inputMode="numeric"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={disabled}
        />
        <div className="text-[11px] text-gray-400 mt-1">
          نمایش: {faMoney(val)} تومان
        </div>
      </td>

      <td className="px-4 py-3">
        {new Date(row.updatedAt).toLocaleDateString("fa-IR")}
      </td>

      <td className="px-4 py-3">
        <a
		  href={`/dashboard/materials/${row.id}/history`}
		  className="inline-flex items-center rounded-full border px-2 py-1 text-xs hover:bg-gray-50"
		>
		  {row._count.priceHistory}
		</a>
      </td>

      <td className="px-4 py-3">
        <button
          className={`rounded-lg px-3 py-2 text-white ${
            changed ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!changed || disabled}
          onClick={() => onSave(row.id, val)}
        >
          ذخیره
        </button>
      </td>
    </tr>
  );
}
