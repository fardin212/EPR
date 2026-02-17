"use client";

import { useEffect, useState } from "react";

type Category = {
  id: number;
  title: string;
  code: string;
  nextSeq: number;
};

export default function InventoryCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // create
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");

  // edit row
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCode, setEditCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/categories", { cache: "no-store" });
      const data = await res.json();
      setCats(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setError(null);
    setSuccess(null);

    if (!title.trim() || !code.trim()) {
      setError("عنوان و کد دسته الزامی است");
      return;
    }

    const res = await fetch("/api/inventory/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        code: code.trim().toUpperCase(),
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error || "خطا در ثبت دسته‌بندی");
      return;
    }

    setTitle("");
    setCode("");
    setSuccess("دسته‌بندی با موفقیت ثبت شد");
    load();
  }

  function startEdit(c: Category) {
    setError(null);
    setSuccess(null);
    setEditingId(c.id);
    setEditTitle(c.title);
    setEditCode(c.code);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditCode("");
  }

  async function saveEdit(id: number) {
    setError(null);
    setSuccess(null);

    if (!editTitle.trim() || !editCode.trim()) {
      setError("عنوان و کد دسته الزامی است");
      return;
    }

    const res = await fetch(`/api/inventory/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        code: editCode.trim().toUpperCase(),
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error || "خطا در ویرایش دسته‌بندی");
      return;
    }

    setSuccess("دسته‌بندی با موفقیت ویرایش شد");
    cancelEdit();
    load();
  }

  async function remove(id: number) {
    setError(null);
    setSuccess(null);

    const ok = confirm("حذف دسته‌بندی؟ اگر کالا به این دسته وصل باشد، حذف نباید انجام شود.");
    if (!ok) return;

    const res = await fetch(`/api/inventory/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error || "خطا در حذف دسته‌بندی");
      return;
    }

    setSuccess("دسته‌بندی حذف شد");
    load();
  }

  return (
    <div className="space-y-6" dir="rtl">
      <header>
        <h1 className="text-lg font-semibold">دسته‌بندی کالاها</h1>
        <p className="text-xs text-slate-500">
          تعریف گروه کالا برای ساخت کد اتومات و استفاده در انبار و BOM
        </p>
      </header>

      {/* فرم افزودن */}
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="عنوان دسته (مثلاً آهن‌آلات)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border rounded-lg px-3 py-2 text-sm uppercase"
            placeholder="کد دسته (مثلاً STL)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />

          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 py-2"
          >
            ثبت دسته
          </button>
        </div>

        {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
        {success && <div className="text-xs text-green-600 mt-2">{success}</div>}
      </div>

      {/* جدول */}
      <div className="rounded-xl border bg-white p-4">
        {loading ? (
          <div className="text-sm text-slate-500">در حال بارگذاری...</div>
        ) : cats.length === 0 ? (
          <div className="text-sm text-slate-500">هنوز دسته‌بندی‌ای ثبت نشده است.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right py-2">عنوان</th>
                <th className="text-right py-2">کد</th>
                <th className="text-right py-2">شماره بعدی</th>
                <th className="text-left py-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => {
                const isEdit = editingId === c.id;
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2">
                      {isEdit ? (
                        <input
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      ) : (
                        c.title
                      )}
                    </td>

                    <td className="py-2 font-mono">
                      {isEdit ? (
                        <input
                          className="border rounded-lg px-2 py-1 text-sm w-full uppercase"
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                        />
                      ) : (
                        c.code
                      )}
                    </td>

                    <td className="py-2">{c.nextSeq}</td>

                    <td className="py-2">
                      <div className="flex items-center justify-end gap-2">
                        {isEdit ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(c.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              ذخیره
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-3 py-1 rounded-lg border hover:bg-slate-50"
                            >
                              انصراف
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(c)}
                              className="px-3 py-1 rounded-lg border hover:bg-slate-50"
                            >
                              ویرایش
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(c.id)}
                              className="px-3 py-1 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50"
                            >
                              حذف
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
