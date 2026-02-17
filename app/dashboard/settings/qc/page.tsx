"use client";

import { useEffect, useMemo, useState } from "react";

/* -----------------------------------------------
   Types
------------------------------------------------- */
type ProjectType = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
};

type QCTemplateItem = {
  id: number;
  projectTypeId: number;

  stageOrder: number;
  stageName: string;

  title: string;
  description?: string | null;
  isRequired: boolean;

  sortOrder?: number;
  defaultStatus?: any | null;
};

/* لیبل‌های فارسی مرحله‌ها */
const STAGE_LABELS: Record<number, string> = {
  1: "۱. برش و آماده‌سازی پروفیل",
  2: "۲. ساخت اسکلت اصلی",
  3: "۳. نصب کف و زیرسازی",
  4: "۴. نصب دیواره‌ها",
  5: "۵. نصب سقف",
  6: "۶. نصب درب و پنجره",
  7: "۷. برق‌کاری و تأسیسات داخلی",
  8: "۸. رنگ و نازک‌کاری",
  9: "۹. کنترل کیفیت نهایی",
};

function stageNameOf(order: number) {
  return STAGE_LABELS[order] || `مرحله ${order}`;
}

function normalizeItems(data: any): QCTemplateItem[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function normalizeSingleItem(data: any): QCTemplateItem | null {
  if (!data) return null;
  if (data?.item) return data.item;
  if (data?.data) return data.data;
  if (typeof data === "object" && data.id) return data;
  return null;
}

async function readApiError(res: Response) {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j?.message || j?.error || j?.detail || JSON.stringify(j);
    }
    return await res.text();
  } catch {
    return "خطای نامشخص از سرور";
  }
}

/* =============================================================================
   Component
============================================================================= */
export default function QCSettingsPage() {
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const [items, setItems] = useState<QCTemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // فرم افزودن آیتم جدید
  const [newStageOrder, setNewStageOrder] = useState<number>(1);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");
  const [newRequired, setNewRequired] = useState<boolean>(true);

  const newStageName = useMemo(() => stageNameOf(newStageOrder), [newStageOrder]);

  /* ---------------------------------------------------------------------------
     Load Project Types
  --------------------------------------------------------------------------- */
  useEffect(() => {
    async function loadTypes() {
      try {
        setError(null);
        const res = await fetch("/api/project-types", { cache: "no-store" });
        if (!res.ok) {
          setError(await readApiError(res));
          return;
        }
        const data = await res.json();

        const list: ProjectType[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];

        setTypes(list);

        if (list.length > 0) setSelectedTypeId(list[0].id);
        else setSelectedTypeId(null);
      } catch {
        setError("خطا در دریافت لیست نوع پروژه‌ها");
      }
    }
    loadTypes();
  }, []);

  async function loadTemplate(typeId: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/qc-templates/${typeId}`, { cache: "no-store" });
      if (!res.ok) {
        const msg = await readApiError(res);
        console.error("Load QC template failed:", msg);
        setError(msg || "خطا در دریافت آیتم‌های QC");
        setItems([]);
        return;
      }
      const data = await res.json();
      const list = normalizeItems(data);

      setItems(
        list.map((x: any) => ({
          ...x,
          projectTypeId: Number(x.projectTypeId ?? typeId),
          stageOrder: Number(x.stageOrder ?? 1),
          stageName: String(x.stageName || stageNameOf(Number(x.stageOrder ?? 1))),
          title: String(x.title ?? ""),
          description: x.description ?? "",
          isRequired: Boolean(x.isRequired),
        }))
      );
    } catch {
      setError("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------------
     Load QC Template Items for selected type
  --------------------------------------------------------------------------- */
  useEffect(() => {
    if (!selectedTypeId) {
      setItems([]);
      return;
    }
    loadTemplate(selectedTypeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypeId]);

  /* ---------------------------------------------------------------------------
     Add New QC Item
  --------------------------------------------------------------------------- */
  async function addItem() {
    if (!selectedTypeId) {
      alert("نوع پروژه را انتخاب کنید");
      return;
    }
    const title = newTitle.trim();
    if (!title) {
      alert("عنوان آیتم QC را وارد کنید");
      return;
    }
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/qc-templates/${selectedTypeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTypeId: selectedTypeId, // اگر بک‌اند نیاز نداشت هم مشکلی ندارد
          stageOrder: Number(newStageOrder || 1),
          stageName: newStageName,
          title,
          description: (newDesc || "").trim(),
          isRequired: Boolean(newRequired),
        }),
      });

      if (!res.ok) {
        const msg = await readApiError(res);
        console.error("QC API ERROR:", msg);
        setError(msg || "خطا در افزودن آیتم QC");
        alert(msg || "خطا در افزودن آیتم QC");
        return;
      }

      const data = await res.json().catch(() => null);
      const created = normalizeSingleItem(data);

      // ریست فرم
      setNewTitle("");
      setNewDesc("");
      setNewRequired(true);
      setNewStageOrder(1);

      if (created?.id) {
        // سریع به لیست اضافه کن (UX بهتر)
        setItems((prev) => [
          ...prev,
          {
            ...created,
            projectTypeId: Number((created as any).projectTypeId ?? selectedTypeId),
            stageOrder: Number((created as any).stageOrder ?? 1),
            stageName: String((created as any).stageName || stageNameOf(Number((created as any).stageOrder ?? 1))),
            title: String((created as any).title ?? ""),
            description: (created as any).description ?? "",
            isRequired: Boolean((created as any).isRequired),
          },
        ]);
      } else {
        // اگر سرور آیتم برنگردوند، لیست را رفرش کن
        await loadTemplate(selectedTypeId);
      }
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------------------------
     Update Item (Optimistic + PATCH)
  --------------------------------------------------------------------------- */
  const updateItem = async (item: QCTemplateItem, patch: Partial<QCTemplateItem>) => {
    if (!selectedTypeId) return;

    const updated: QCTemplateItem = { ...item, ...patch };

    if (patch.stageOrder != null) {
      updated.stageOrder = Number(patch.stageOrder);
      updated.stageName = stageNameOf(updated.stageOrder);
    }

    // optimistic UI
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));

    try {
      const res = await fetch(`/api/qc-templates/${selectedTypeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          projectTypeId: selectedTypeId,
          stageOrder: Number(updated.stageOrder ?? 1),
          stageName: String(updated.stageName || stageNameOf(Number(updated.stageOrder ?? 1))),
          title: String(updated.title ?? "").trim(),
          description: String(updated.description ?? ""),
          isRequired: Boolean(updated.isRequired),
          sortOrder: Number(updated.sortOrder ?? 0),
          defaultStatus: updated.defaultStatus ?? null,
        }),
      });

      if (!res.ok) {
        const msg = await readApiError(res);
        console.error("Update QC item failed:", msg);
        alert(msg || "خطا در ذخیره تغییرات");
        // بهترین حالت: رفرش برای برگشت به وضعیت صحیح سرور
        await loadTemplate(selectedTypeId);
      }
    } catch {
      alert("خطای ارتباط با سرور");
      await loadTemplate(selectedTypeId);
    }
  };

  /* ---------------------------------------------------------------------------
     Delete Item
  --------------------------------------------------------------------------- */
  const deleteItem = async (item: QCTemplateItem) => {
    if (!selectedTypeId) return;
    if (!confirm("این آیتم QC حذف شود؟")) return;

    const prev = items;
    setItems((p) => p.filter((i) => i.id !== item.id));
    setError(null);

    try {
      const res = await fetch(`/api/qc-templates/${selectedTypeId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, projectTypeId: selectedTypeId }),
      });

      if (!res.ok) {
        const msg = await readApiError(res);
        console.error("Delete QC item failed:", msg);
        alert(msg || "خطا در حذف آیتم QC");
        setItems(prev);
        setError(msg || "خطا در حذف آیتم QC");
      }
    } catch {
      alert("خطای ارتباط با سرور");
      setItems(prev);
    }
  };

  /* ---------------------------------------------------------------------------
     UI
  --------------------------------------------------------------------------- */
  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-100">تنظیمات QC پروژه‌ها</h1>

      <div className="flex flex-col gap-3 bg-zinc-900/40 border border-zinc-700/60 rounded-2xl p-3">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-zinc-400">نوع پروژه:</span>

          <select
            className="bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            value={selectedTypeId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedTypeId(v ? Number(v) : null);
            }}
          >
            <option value="" className="bg-zinc-900 text-zinc-400">
              انتخاب نوع پروژه
            </option>

            {types.map((t) => (
              <option key={t.id} value={t.id} className="bg-zinc-900 text-zinc-100">
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={addItem}
            disabled={saving || !selectedTypeId}
            className="px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "در حال ثبت..." : "افزودن آیتم QC"}
          </button>
        </div>

        {/* فرم آیتم جدید */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="md:col-span-2">
            <label className="text-[11px] text-zinc-400">مرحله</label>
            <select
              className="w-full mt-1 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={newStageOrder}
              onChange={(e) => setNewStageOrder(Number(e.target.value))}
            >
              {Array.from({ length: 9 }, (_, i) => i + 1).map((idx) => (
                <option key={idx} value={idx} className="bg-zinc-950 text-zinc-100">
                  {STAGE_LABELS[idx]}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-zinc-400">عنوان</label>
            <input
              className="w-full mt-1 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-2 text-xs"
              value={newTitle}
              placeholder="مثلاً: کنترل جوش اسکلت"
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-zinc-400">توضیح</label>
            <input
              className="w-full mt-1 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-lg px-2 py-2 text-xs"
              value={newDesc}
              placeholder="اختیاری"
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <div className="md:col-span-6">
            <label className="inline-flex items-center gap-2 text-[11px] text-zinc-200 mt-1">
              <input
                type="checkbox"
                checked={newRequired}
                onChange={(e) => setNewRequired(e.target.checked)}
              />
              ضروری
            </label>
            <div className="text-[11px] text-zinc-500 mt-1">
              مرحله انتخاب‌شده: <span className="text-zinc-300">{newStageName}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-zinc-400">در حال بارگذاری...</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row md:items-center gap-3 bg-zinc-900/60 border border-zinc-700/60 rounded-xl px-3 py-3"
            >
              <select
                className="bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={item.stageOrder}
                onChange={(e) => updateItem(item, { stageOrder: Number(e.target.value) })}
              >
                {Array.from({ length: 9 }, (_, i) => i + 1).map((idx) => (
                  <option key={idx} value={idx} className="bg-zinc-950 text-zinc-100">
                    {STAGE_LABELS[idx]}
                  </option>
                ))}
              </select>

              <input
                className="flex-1 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-2 text-xs"
                value={item.title}
                onChange={(e) => updateItem(item, { title: e.target.value })}
              />

              <input
                className="flex-1 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-lg px-2 py-2 text-xs"
                value={item.description ?? ""}
                placeholder="توضیح (اختیاری)"
                onChange={(e) => updateItem(item, { description: e.target.value })}
              />

              <label className="inline-flex items-center gap-1 text-[11px] text-zinc-200">
                <input
                  type="checkbox"
                  checked={item.isRequired}
                  onChange={(e) => updateItem(item, { isRequired: e.target.checked })}
                />
                ضروری
              </label>

              <button
                onClick={() => deleteItem(item)}
                className="px-2 py-2 rounded-lg bg-red-700/80 hover:bg-red-600 text-[11px]"
              >
                حذف
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-xs text-zinc-500">هنوز آیتم QC برای این نوع پروژه تعریف نشده است.</div>
          )}
        </div>
      )}
    </div>
  );
}
