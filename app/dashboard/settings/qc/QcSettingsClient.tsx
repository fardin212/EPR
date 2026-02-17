// app/dashboard/settings/qc/QcSettingsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type ProjectType = {
  id: number;
  name: string;
};

type QcTemplateItem = {
  id: number;
  projectTypeId: number;
  stageIndex: number;
  title: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
};

const STAGE_LABELS = [
  "۱. برش و آماده‌سازی پروفیل",
  "۲. ساخت اسکلت اصلی",
  "۳. نصب کف و زیرسازی",
  "۴. نصب دیواره‌ها",
  "۵. نصب سقف",
  "۶. نصب درب و پنجره",
  "۷. برق‌کاری و تأسیسات داخلی",
  "۸. رنگ و نازک‌کاری",
  "۹. کنترل کیفیت نهایی",
];

interface Props {
  projectTypes: ProjectType[];
  initialTypeId: number | null;
  initialTemplates: QcTemplateItem[];
}

export default function QcSettingsClient({
  projectTypes,
  initialTypeId,
  initialTemplates,
}: Props) {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(initialTypeId);
  const [items, setItems] = useState<QcTemplateItem[]>(initialTemplates);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTypes = projectTypes?.length > 0;

  // اگر initialTypeId null بود و فقط یک نوع پروژه داریم، خودکار انتخابش کن
  useEffect(() => {
    if (selectedTypeId) return;
    if (!hasTypes) return;
    if (projectTypes.length === 1) setSelectedTypeId(projectTypes[0].id);
  }, [hasTypes, projectTypes, selectedTypeId]);

  const selectedTypeName = useMemo(() => {
    if (!selectedTypeId) return null;
    return projectTypes.find((x) => x.id === selectedTypeId)?.name ?? null;
  }, [projectTypes, selectedTypeId]);

  // تغییر نوع پروژه → لود تمپلیت جدید
  useEffect(() => {
    if (!selectedTypeId) {
      setItems([]);
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/qc-templates?projectTypeId=${selectedTypeId}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load QC templates:", res.status, text);
          if (!cancelled) setError("خطا در دریافت آیتم‌های QC");
          return;
        }
        const data = (await res.json()) as QcTemplateItem[];
        if (!cancelled) setItems(data);
      } catch (e) {
        console.error("Error loading QC templates:", e);
        if (!cancelled) setError("خطای ارتباط با سرور");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTypeId]);

  const addItem = async (stageIndex: number) => {
    if (!selectedTypeId) {
      alert("ابتدا نوع پروژه را انتخاب کنید.");
      return;
    }

    const title = prompt("عنوان آیتم QC جدید برای این مرحله؟");
    if (!title?.trim()) return;

    try {
      setSaving(true);
      const res = await fetch("/api/qc-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageOrder: 1,
		  stageName: "مرحله ۱",
		  title: "آیتم QC جدید",
		  description: "",
		  isRequired: true,
		  sortOrder: 10,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to create QC template:", res.status, text);
        alert("خطا در ثبت آیتم QC");
        return;
      }

      const created = (await res.json()) as QcTemplateItem;
      setItems((prev) => [...prev, created]);
    } catch (e) {
      console.error("Error creating QC template:", e);
      alert("خطای ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm("این آیتم از تمپلیت QC حذف شود؟")) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/qc-templates/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to delete QC template:", res.status, text);
        alert("خطا در حذف آیتم QC");
        return;
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error("Error deleting QC template:", e);
      alert("خطای ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900">تنظیمات QC برای انواع پروژه</h1>

      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-600">نوع پروژه:</span>

        <select
          className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          value={selectedTypeId ?? ""}
          onChange={(e) => {
            const v = e.target.value; // "" | "1" | ...
            setSelectedTypeId(v ? Number(v) : null); // ✅ جلوگیری از 0
          }}
        >
          <option value="" disabled>
            انتخاب نوع پروژه
          </option>
          {projectTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {selectedTypeName && (
          <span className="text-[11px] text-zinc-500">انتخاب‌شده: {selectedTypeName}</span>
        )}

        {saving && <span className="text-[11px] text-emerald-600">در حال ذخیره…</span>}
      </div>

      {!hasTypes && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          هیچ نوع پروژه‌ای ثبت نشده است. ابتدا یک ProjectType بسازید.
        </div>
      )}

      {error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-xs text-zinc-500">در حال بارگذاری تمپلیت…</div>
      ) : !selectedTypeId ? (
        <div className="text-xs text-zinc-500">برای مدیریت QC، ابتدا نوع پروژه را انتخاب کنید.</div>
      ) : (
        <div className="space-y-4">
          {STAGE_LABELS.map((label, idx) => {
            const stageIndex = idx + 1;
            const stageItems = items
              .filter((i) => i.stageIndex === stageIndex)
              .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

            return (
              <div key={stageIndex} className="border border-zinc-200 rounded-xl bg-white">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                  <div className="text-sm font-semibold text-zinc-900">{label}</div>

                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                    onClick={() => addItem(stageIndex)}
                    disabled={!selectedTypeId || saving}
                  >
                    افزودن آیتم QC
                  </button>
                </div>

                {stageItems.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-zinc-500">
                    برای این مرحله آیتم QC تعریف نشده است.
                  </div>
                ) : (
                  <ul className="divide-y divide-zinc-100">
                    {stageItems.map((item) => (
                      <li
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between gap-3 text-sm"
                      >
                        <div>
                          <div className="text-zinc-900">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-zinc-500 mt-1">{item.description}</div>
                          )}
                        </div>

                        <button
                          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs"
                          onClick={() => deleteItem(item.id)}
                          disabled={saving}
                        >
                          حذف
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
