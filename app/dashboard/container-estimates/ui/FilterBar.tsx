"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Option = { id: number; name?: string; title?: string };

export default function FilterBar({
  parties,
  models,
  initial,
  count,
}: {
  parties: Option[];
  models: Option[];
  initial: {
    q: string;
    partyId: string;
    modelId: string;
    from: string;
    to: string;
    minFinal: string;
    maxFinal: string;
    minBase: string;
    maxBase: string;
  };
  count: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [state, setState] = useState(initial);

  const qs = useMemo(() => new URLSearchParams(sp?.toString() || ""), [sp]);

  function set(k: keyof typeof state, v: string) {
    setState((s) => ({ ...s, [k]: v }));
  }

  function apply() {
    const next = new URLSearchParams();

    // فقط فیلدهای پر شده رو به URL اضافه می‌کنیم
    Object.entries(state).forEach(([k, v]) => {
      const val = String(v || "").trim();
      if (val) next.set(k, val);
    });

    router.push(`/dashboard/container-estimates?${next.toString()}`);
  }

  function clearAll() {
    setState({
      q: "",
      partyId: "",
      modelId: "",
      from: "",
      to: "",
      minFinal: "",
      maxFinal: "",
      minBase: "",
      maxBase: "",
    });
    router.push("/dashboard/container-estimates");
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="text-xs text-gray-500">جستجو (شماره/مشتری/مدل)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="مثلاً: 12 یا کارگاهی یا نام مشتری"
            />
          </div>

          {/* Party */}
          <div className="w-full lg:w-64">
            <label className="text-xs text-gray-500">مشتری</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.partyId}
              onChange={(e) => set("partyId", e.target.value)}
            >
              <option value="">همه</option>
              {parties.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name || `#${p.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="w-full lg:w-64">
            <label className="text-xs text-gray-500">مدل کانکس</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.modelId}
              onChange={(e) => set("modelId", e.target.value)}
            >
              <option value="">همه</option>
              {models.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.title || `#${m.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date + Prices */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div>
            <label className="text-xs text-gray-500">از تاریخ</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.from}
              onChange={(e) => set("from", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">تا تاریخ</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.to}
              onChange={(e) => set("to", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">حداقل مبلغ نهایی</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.minFinal}
              onChange={(e) => set("minFinal", e.target.value)}
              placeholder="مثلاً 50000000"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">حداکثر مبلغ نهایی</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.maxFinal}
              onChange={(e) => set("maxFinal", e.target.value)}
              placeholder="مثلاً 150000000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div>
            <label className="text-xs text-gray-500">حداقل بهای تمام‌شده</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.minBase}
              onChange={(e) => set("minBase", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">حداکثر بهای تمام‌شده</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={state.maxBase}
              onChange={(e) => set("maxBase", e.target.value)}
            />
          </div>

          <div className="lg:col-span-2 flex gap-2 items-end">
            <button
              onClick={apply}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              اعمال فیلتر
            </button>
            <button
              onClick={clearAll}
              className="w-full rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              پاک کردن
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          نتیجه فعلی: <span className="font-semibold">{count}</span> مورد
        </div>
      </div>
    </div>
  );
}
