"use client";

import { useEffect, useState } from "react";

const STAGE_TITLES: Record<string, string> = {
  NEW: "ورود سرنخ",
  CONTACTED: "اولین تماس",
  PROPOSAL: "ارسال پیش‌فاکتور",
  NEGOTIATION: "مذاکره",
  WON: "قرارداد نهایی",
  LOST: "از دست رفته",
};

type Lead = {
  id: number;
  name: string;
  phone?: string | null;
  source?: string | null;
  pipelineStage?: string | null;
  status?: string | null;
};

type PipelineResponse = {
  stages: string[];
  grouped: Record<string, Lead[]>;
};

export default function PipelinePage() {
  const [stages, setStages] = useState<string[]>([]);
  const [columns, setColumns] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/crm/pipeline");
        const json: PipelineResponse = await res.json();

        const stageIds = json.stages || [];
        const grouped = json.grouped || {};

        setStages(stageIds);
        setColumns(grouped);
      } catch (err) {
        console.error("Pipeline load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateStage(leadId: number, newStage: string) {
    try {
      setSaving(true);
      await fetch(`/api/crm/pipeline/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: newStage }),
      });
    } catch (err) {
      console.error("Update pipeline stage error:", err);
      // در صورت نیاز می‌توانی اینجا toast خطا اضافه کنی
    } finally {
      setSaving(false);
    }
  }

  function onDragStart(leadId: number, fromStage: string) {
    setDraggingId(leadId);
    setActiveStage(fromStage);
  }

  function onDragOverStage(e: React.DragEvent<HTMLDivElement>, stageId: string) {
    e.preventDefault(); // لازم برای اجازه drop
    setActiveStage(stageId);
  }

  function onDropOnStage(stageId: string) {
    if (!draggingId) return;

    setColumns((prev) => {
      const next: Record<string, Lead[]> = {};
      // اول همه ستون‌ها را کپی می‌کنیم
      for (const key of Object.keys(prev)) {
        next[key] = [...prev[key]];
      }

      // سرنخ مورد نظر را از ستون فعلی حذف می‌کنیم
      let draggedLead: Lead | undefined;

      for (const key of Object.keys(next)) {
        const idx = next[key].findIndex((l) => l.id === draggingId);
        if (idx !== -1) {
          draggedLead = { ...next[key][idx] };
          next[key].splice(idx, 1);
          break;
        }
      }

      if (!draggedLead) return prev;

      // به ستون جدید اضافه می‌کنیم
      draggedLead.pipelineStage = stageId;
      if (!next[stageId]) next[stageId] = [];
      next[stageId].unshift(draggedLead);

      // آپدیت به دیتابیس
      updateStage(draggedLead.id, stageId);

      return next;
    });

    setDraggingId(null);
    setActiveStage(null);
  }

  function onDragEnd() {
    setDraggingId(null);
    setActiveStage(null);
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500" dir="rtl">
        در حال بارگذاری کانبان فروش...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">CRM / Sales Pipeline</p>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 mt-1">
            کانبان فروش
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 max-w-2xl">
            سرنخ‌ها را بین مراحل مختلف درگ کنید تا مرحله فروش آن‌ها به‌صورت خودکار در
            سیستم به‌روزرسانی شود.
          </p>
        </div>

        {saving && (
          <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
            در حال ذخیره تغییرات...
          </div>
        )}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {stages.map((id) => {
          const leads = columns[id] || [];

          const isActive = activeStage === id;

          return (
            <div
              key={id}
              className={`flex flex-col rounded-2xl bg-slate-50 border ${
                isActive
                  ? "border-indigo-400 shadow-md shadow-indigo-100"
                  : "border-slate-200"
              } p-3 min-h-[220px]`}
              onDragOver={(e) => onDragOverStage(e, id)}
              onDrop={() => onDropOnStage(id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-medium text-slate-700">
                  {STAGE_TITLES[id] || id}
                </div>
                <div className="text-[10px] text-slate-400">
                  {leads.length} سرنخ
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {leads.map((l) => (
                  <div
                    key={l.id}
                    draggable
                    onDragStart={() => onDragStart(l.id, id)}
                    onDragEnd={onDragEnd}
                    className={`rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-[11px] shadow-sm cursor-move transition ${
                      draggingId === l.id
                        ? "opacity-60 ring-2 ring-indigo-200"
                        : "hover:border-indigo-300"
                    }`}
                  >
                    <div className="font-medium text-slate-800 truncate">
                      {l.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {l.phone || l.source || "بدون توضیح"}
                    </div>
                  </div>
                ))}

                {leads.length === 0 && (
                  <div className="text-[11px] text-slate-400 mt-2">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
