"use client";

import { useState } from "react";

export default function InventoryImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/inventory/import", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4" dir="rtl">
      <h1 className="text-lg font-semibold">Import کالا از Excel</h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={submit}
        disabled={!file || loading}
        className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "در حال Import..." : "شروع Import"}
      </button>

      {result && (
        <div className="text-xs bg-slate-50 border rounded-xl p-3">
          <div>کل ردیف‌ها: {result.total}</div>
          <div className="text-green-600">
            موفق: {result.success}
          </div>
          {result.errors?.length > 0 && (
            <div className="text-red-600 mt-2">
              خطاها:
              <ul className="list-disc pr-5">
                {result.errors.map((e: any, i: number) => (
                  <li key={i}>
                    ردیف {e.row}: {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
