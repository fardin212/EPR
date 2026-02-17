// app/dashboard/projects/[id]/ProjectDetailClient.tsx
"use client";

import { useState, useEffect } from "react";
import StageChecklistClient from "./StageChecklistClient";
import StageImagesClient from "./StageImagesClient";
import { toJalali } from "@/lib/date";
import ProjectCustomerCard from "./ui/ProjectCustomerCard";

/* ================== TYPES ================== */

type ProjectStatus = "IN_PROGRESS" | "COMPLETED" | "STOPPED";
type StageStatus = "PENDING" | "ACTIVE" | "DONE";

type ContractRow = {
  id: number;
  contractorId: number;
  contractor: { id: number; partyId: number; name: string; mobile?: string | null };
  role?: string | null;
  note?: string | null;
  agreedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  payStatus: "PAID" | "PARTIAL" | "UNPAID";
  status: "ACTIVE" | "DONE" | "CANCELLED";
  startDate?: string | null;
  endDate?: string | null;
};

type Project = {
  id: number;
  title: string;
  type: string;
  size: string | null;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;

  customerName?: string | null;
  customerParty?: {
    id: number;
    name: string;
    mobile?: string | null;
  } | null;

  projectType?: { id: number; name: string } | null;

  stages: {
    id: number;
    name: string;
    status: StageStatus;
    startedAt: string | null;
    finishedAt: string | null;
    note: string | null;
    approvedAt?: string | null;
    approvedByName?: string | null;
  }[];
};

type Move = {
  id: number;
  date: string;
  qty: number;
  direction: "IN" | "OUT";
  reference: string | null;
  product: { id: number; name: string; unit: string };
  warehouse: { id: number; name: string };
};

type ContractorOption = {
  contractorId: number;
  partyId: number;
  name: string;
  mobile?: string | null;
  specialty?: string | null;
  dayRate?: any;
};

const statusLabel: Record<ProjectStatus, string> = {
  IN_PROGRESS: "در حال اجرا",
  COMPLETED: "تکمیل شده",
  STOPPED: "متوقف شده",
};

type Stage = Project["stages"][number];
type Tab = "overview" | "stages" | "materials" | "qc";

/* ================== HELPERS ================== */

function reloadKeepStagesTab() {
  if (typeof window === "undefined") return;
  const sp = new URLSearchParams(window.location.search);
  sp.set("tab", "stages");
  window.location.href = `${window.location.pathname}?${sp.toString()}`;
}

function getProjectStartDate(project: Project): Date | null {
  if (project.startDate) return new Date(project.startDate);
  const s = project.stages.find((x) => x.startedAt);
  return s?.startedAt ? new Date(s.startedAt) : null;
}

function stageStatusBadge(status: StageStatus) {
  if (status === "DONE")
    return <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-200">انجام شد</span>;
  if (status === "ACTIVE")
    return <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-200">در حال انجام</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-500/20 text-slate-200">در انتظار</span>;
}

/* ================== MAIN ================== */

export default function ProjectDetailClient({
  project,
  moves,
}: {
  project: Project;
  moves: Move[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [consumptionStage, setConsumptionStage] = useState<Stage | null>(null);

  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("tab");
    if (t === "overview" || t === "stages" || t === "materials" || t === "qc") {
      setActiveTab(t as Tab);
    }
  }, []);

  async function loadContracts() {
    setLoadingContracts(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/contracts`, { cache: "no-store" });
      const data = await res.json().catch(() => []);
      setContracts(Array.isArray(data) ? data : []);
    } finally {
      setLoadingContracts(false);
    }
  }

  useEffect(() => {
    loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const totalStages = project.stages.length;
  const doneStages = project.stages.filter((s) => s.status === "DONE").length;
  const progress = totalStages > 0 ? Math.round((doneStages / totalStages) * 100) : 0;

  const startDateLabel =
    getProjectStartDate(project) !== null ? toJalali(getProjectStartDate(project)!) : "تعریف نشده";

  const customerLabel = project.customerParty?.name || project.customerName || "—";
  const projectTypeLabel = project.projectType?.name || project.type;

  function handleStageFinished(stage: Stage) {
    const keywords = ["دیواره", "دیوار", "نصب دیوار"];
    if (keywords.some((k) => stage.name.includes(k))) setConsumptionStage(stage);
    else reloadKeepStagesTab();
  }

  function changeTab(tab: Tab) {
    setActiveTab(tab);
    const sp = new URLSearchParams(window.location.search);
    sp.set("tab", tab);
    window.history.replaceState(null, "", `?${sp.toString()}`);
  }

  // جمع کل قرارداد/پرداخت/مانده برای گزارش مالی سریع
  const totalAgreed = contracts.reduce((a, c) => a + (Number(c.agreedAmount) || 0), 0);
  const totalPaid = contracts.reduce((a, c) => a + (Number(c.paidAmount) || 0), 0);
  const totalRemain = Math.max(totalAgreed - totalPaid, 0);

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="text-sm text-slate-300">
            {customerLabel} — {projectTypeLabel}
          </p>
          <p className="text-xs text-slate-400">تاریخ شروع: {startDateLabel}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 text-xs rounded-full bg-slate-900 border">#{project.id}</span>
          <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 border border-emerald-400/60">
            {statusLabel[project.status]}
          </span>
          <a
            href={`/api/projects/${project.id}/report`}
            target="_blank"
            className="px-3 py-1 text-xs rounded-full bg-purple-600 text-white"
          >
            PDF پروژه
          </a>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="پیشرفت پروژه" value={`${progress}%`} />
        <SummaryCard label="تعداد مراحل" value={project.stages.length.toString()} />
        <SummaryCard label="مصرف انبار" value={moves.length.toString()} />
      </div>

      {/* QUICK FINANCIAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="جمع قرارداد پیمانکاران" value={totalAgreed.toLocaleString()} />
        <SummaryCard label="جمع پرداختی‌ها" value={totalPaid.toLocaleString()} />
        <SummaryCard label="مانده پیمانکاران" value={totalRemain.toLocaleString()} />
      </div>

      {/* TABS */}
      <div className="bg-slate-900/80 rounded-2xl border border-white/10">
        <div className="flex gap-2 border-b border-white/10 px-4 pt-3">
          <TabButton label="مرور کلی" active={activeTab === "overview"} onClick={() => changeTab("overview")} />
          <TabButton label="مراحل ساخت" active={activeTab === "stages"} onClick={() => changeTab("stages")} />
          <TabButton label="QC" active={activeTab === "qc"} onClick={() => changeTab("qc")} />
          <TabButton label="مصرف مواد" active={activeTab === "materials"} onClick={() => changeTab("materials")} />
        </div>

        <div className="p-4">
          {activeTab === "overview" && (
            <OverviewTab
              project={project}
              customerLabel={customerLabel}
              projectTypeLabel={projectTypeLabel}
              startDateLabel={startDateLabel}
              contracts={contracts}
              loadingContracts={loadingContracts}
              onAddContractor={() => setOpenAdd(true)}
            />
          )}

          {activeTab === "stages" && (
            <StagesTab project={project} onStageFinished={handleStageFinished} />
          )}

          {activeTab === "qc" && <QcTab project={project} />}

          {activeTab === "materials" && <MaterialsTab moves={moves} />}
        </div>
      </div>

      {openAdd && (
        <AddContractorModal
          projectId={project.id}
          onClose={() => setOpenAdd(false)}
          onCreated={async () => {
            setOpenAdd(false);
            await loadContracts();
          }}
        />
      )}

      {consumptionStage && (
        <ConsumptionModal projectId={project.id} stage={consumptionStage} onClose={() => setConsumptionStage(null)} />
      )}
    </div>
  );
}

/* ================== UI ================== */

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 text-xs border-b-2 " +
        (active ? "border-purple-400 text-white" : "border-transparent text-slate-400")
      }
    >
      {label}
    </button>
  );
}

/* ================== OVERVIEW ================== */

function OverviewTab({
  project,
  customerLabel,
  projectTypeLabel,
  startDateLabel,
  contracts,
  loadingContracts,
  onAddContractor,
}: {
  project: Project;
  customerLabel: string;
  projectTypeLabel: string;
  startDateLabel: string;
  contracts: ContractRow[];
  loadingContracts: boolean;
  onAddContractor: () => void;
}) {
  return (
  <div className="space-y-4">
    {/* CUSTOMER (Assign) */}
    <ProjectCustomerCard
      projectId={project.id}
      currentCustomerId={project.customerParty?.id ?? project.customerId ?? null}
      currentCustomerName={project.customerParty?.name || project.customerName || null}
      onSaved={() => window.location.reload()}
    />

    {/* CONTRACTS */}
    <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm text-white">پیمانکاران پروژه</h3>
          <p className="text-[11px] text-slate-400">
            برای ثبت پرداخت، از خزانه پرداختی‌ها استفاده کن و projectId را انتخاب کن.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAddContractor}
            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
          >
            + افزودن پیمانکار
          </button>

          <a
            href={`/dashboard/treasury`}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-white border border-white/10"
          >
            خزانه / پرداختی‌ها
          </a>
        </div>
      </div>

      {loadingContracts ? (
        <div className="text-xs text-slate-400">در حال بارگذاری…</div>
      ) : contracts.length === 0 ? (
        <div className="text-xs text-slate-400">هنوز پیمانکاری به پروژه اضافه نشده است.</div>
      ) : (
        <table className="w-full text-xs">
          <thead className="text-slate-300">
            <tr className="text-right">
              <th className="py-2">پیمانکار</th>
              <th>مبلغ قرارداد</th>
              <th>پرداختی</th>
              <th>مانده</th>
              <th>وضعیت پرداخت</th>
              <th>وضعیت کار</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="py-2">
                  <div className="text-white">{c.contractor.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.role ? `نقش: ${c.role}` : "—"}
                  </div>
                </td>
                <td>{Number(c.agreedAmount || 0).toLocaleString()}</td>
                <td className="text-emerald-300">{Number(c.paidAmount || 0).toLocaleString()}</td>
                <td className="text-rose-300 font-semibold">{Number(c.remainingAmount || 0).toLocaleString()}</td>
                <td>
                  <PayStatusBadge status={c.payStatus} />
                </td>
                <td>
                  <WorkStatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {/* INFO */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ❌ این خط رو حذف کردیم چون کارت کارفرما بالا اضافه شد */}
      {/* <Info label="مشتری" value={customerLabel} /> */}

      <Info label="نوع سازه" value={projectTypeLabel} />
      <Info label="ابعاد" value={project.size || "—"} />
      <Info label="تاریخ شروع" value={startDateLabel} />
    </div>
  </div>
);

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/50 border border-white/5 rounded-xl p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm text-white">{value}</div>
    </div>
  );
}

function PayStatusBadge({ status }: { status: "PAID" | "PARTIAL" | "UNPAID" }) {
  const map = {
    PAID: "bg-emerald-500/20 text-emerald-200",
    PARTIAL: "bg-amber-500/20 text-amber-200",
    UNPAID: "bg-rose-500/20 text-rose-200",
  };
  const label = status === "PAID" ? "تسویه" : status === "PARTIAL" ? "پرداخت ناقص" : "پرداخت نشده";
  return <span className={`px-2 py-0.5 rounded-full text-[10px] ${map[status]}`}>{label}</span>;
}

function WorkStatusBadge({ status }: { status: "ACTIVE" | "DONE" | "CANCELLED" }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-sky-500/20 text-sky-200",
    DONE: "bg-emerald-500/20 text-emerald-200",
    CANCELLED: "bg-slate-500/20 text-slate-200",
  };
  const label = status === "DONE" ? "تمام شد" : status === "CANCELLED" ? "لغو" : "فعال";
  return <span className={`px-2 py-0.5 rounded-full text-[10px] ${map[status]}`}>{label}</span>;
}

/* ================== QC TAB ================== */

function QcTab({ project }: { project: Project }) {
  if (!project.stages || project.stages.length === 0) {
    return <div className="text-xs text-slate-400">مرحله‌ای برای QC وجود ندارد.</div>;
  }

  return (
    <div className="space-y-3">
      {project.stages.map((stage) => (
        <div key={stage.id} className="bg-slate-950/60 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="text-sm text-white font-semibold">{stage.name}</div>
              {stageStatusBadge(stage.status)}
            </div>

            <div className="text-[11px] text-slate-400">
              {stage.approvedAt ? `تایید نهایی: ${stage.approvedByName || "—"}` : "تایید نهایی نشده"}
            </div>
          </div>

          {/* ✅ اتصال صحیح: stageId */}
          <StageChecklistClient stageId={stage.id} />
        </div>
      ))}
    </div>
  );
}

/* ================== STAGES TAB ================== */

function StagesTab({ project, onStageFinished }: { project: Project; onStageFinished: (s: Stage) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: QC per stage */}
        <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4">
          <div className="text-sm text-white mb-3">کنترل کیفیت مراحل</div>

          {project.stages.length === 0 ? (
            <div className="text-xs text-slate-400">مرحله‌ای ثبت نشده.</div>
          ) : (
            <div className="space-y-3">
              {project.stages.map((stage) => (
                <div key={stage.id} className="border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-white font-semibold">{stage.name}</div>
                      {stageStatusBadge(stage.status)}
                    </div>

                    {/* اگر جایی داری که stage تمام میشه، همونجا می‌تونی onStageFinished رو صدا بزنی */}
                    <button
                      type="button"
                      onClick={() => onStageFinished(stage)}
                      className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-200 border border-white/10"
                      title="بعد از پایان برخی مراحل می‌تونی مصرف انبار/مودال را باز کنی"
                    >
                      عملیات مرحله
                    </button>
                  </div>

                  {/* ✅ اتصال صحیح: stageId */}
                  <StageChecklistClient stageId={stage.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: IMAGES */}
        <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4">
          <StageImagesClient projectId={project.id} />
        </div>
      </div>
    </div>
  );
}

/* ================== MATERIALS TAB ================== */

function MaterialsTab({ moves }: { moves: Move[] }) {
  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4">
      <div className="text-sm text-white mb-2">مصرف مواد</div>
      {moves.length === 0 ? (
        <div className="text-xs text-slate-400">مصرفی ثبت نشده.</div>
      ) : (
        <div className="text-xs text-slate-200">({moves.length}) رکورد مصرف ثبت شده است.</div>
      )}
    </div>
  );
}

/* ================== ADD CONTRACTOR MODAL (بدون تغییر) ================== */

function AddContractorModal({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: number;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<ContractorOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [contractorId, setContractorId] = useState<number | "">("");
  const [agreedAmount, setAgreedAmount] = useState<string>("0");
  const [role, setRole] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/management/contractors`, { cache: "no-store" });
        const data = await res.json().catch(() => []);
        if (!alive) return;
        setOptions(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setOptions([]);
        setError("خطا در دریافت لیست پیمانکاران");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function submit() {
    setError(null);

    if (!contractorId) {
      setError("پیمانکار را انتخاب کنید.");
      return;
    }

    const amt = Number((agreedAmount || "0").toString().replace(/,/g, ""));
    if (!Number.isFinite(amt) || amt < 0) {
      setError("مبلغ قرارداد نامعتبر است.");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId,
          agreedAmount: amt,
          role: role.trim() || null,
          note: note.trim() || null,
        }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        setError(msg?.error || "ثبت پیمانکار ناموفق بود.");
        return;
      }

      await onCreated();
    } catch {
      setError("خطا در ثبت پیمانکار");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-white font-bold">افزودن پیمانکار</div>
            <div className="text-xs text-slate-400">پیمانکار + مبلغ توافقی را ثبت کن.</div>
          </div>
          <button onClick={onClose} className="text-slate-300 text-sm">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-xs text-slate-400">در حال بارگذاری…</div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-lg p-2">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300">پیمانکار</label>
              <select
                className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
                value={contractorId}
                onChange={(e) => setContractorId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">انتخاب کنید…</option>
                {options.map((o) => (
                  <option key={o.contractorId} value={o.contractorId}>
                    {o.name}
                    {o.mobile ? ` — ${o.mobile}` : ""}
                    {o.specialty ? ` — ${o.specialty}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300">مبلغ قرارداد (تومان)</label>
              <input
                className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
                value={agreedAmount}
                onChange={(e) => setAgreedAmount(e.target.value)}
                placeholder="مثلاً 25000000"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300">نقش (اختیاری)</label>
                <input
                  className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="مثلاً جوشکار"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">توضیحات (اختیاری)</label>
                <input
                  className="w-full mt-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-2 text-sm text-white"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="یادداشت..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-3 py-2 text-sm rounded-lg bg-slate-800 text-white border border-white/10"
              >
                انصراف
              </button>
              <button onClick={submit} className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white">
                ثبت پیمانکار
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// اگر ConsumptionModal در فایل دیگری است، همان قبلی را نگه دار.
// اینجا فقط برای جلوگیری از خطا در TypeScript، امضا را حفظ کردیم.
function ConsumptionModal({ projectId, stage, onClose }: any) {
  return null;
}
