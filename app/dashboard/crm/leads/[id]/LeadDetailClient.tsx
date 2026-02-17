"use client";

import { toJalali } from "@/lib/date";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Activity = {
  id: number;
  type: string;
  title: string;
  detail?: string | null;
  doneAt: string;
};

type Customer = {
  id: number;
  name: string;
};

type Project = { id: number; name?: string | null; code?: string | null };
type Bom = { id: number; name?: string | null; code?: string | null };
type Contract = { id: number; title?: string | null; number?: string | null };

type Lead = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  status?: string | null;
  pipelineStage?: string | null;
  note?: string | null;
  createdAt: string;
  customer?: Customer | null;
  activities: Activity[];
  project?: Project | null;
  bom?: Bom | null;
  contract?: Contract | null;
};

export default function LeadDetailClient({ lead }: { lead: Lead }) {
  const router = useRouter();

  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [activities, setActivities] = useState<Activity[]>(lead.activities || []);

  const [actType, setActType] = useState("CALL");
  const [actTitle, setActTitle] = useState("");
  const [actDetail, setActDetail] = useState("");
  const [actLoading, setActLoading] = useState(false);

  const [convertLoading, setConvertLoading] = useState(false);

  const [linkSaving, setLinkSaving] = useState(false);
  const [projectIdInput, setProjectIdInput] = useState(
    lead.project?.id ? String(lead.project.id) : ""
  );
  const [bomIdInput, setBomIdInput] = useState(
    lead.bom?.id ? String(lead.bom.id) : ""
  );
  const [contractIdInput, setContractIdInput] = useState(
    lead.contract?.id ? String(lead.contract.id) : ""
  );
  const [linkError, setLinkError] = useState<string | null>(null);

  const statusKey = (currentLead.status || "").toUpperCase();
  const stageKey = (currentLead.pipelineStage || "").toUpperCase();

  async function handleConvertToCustomer() {
    setConvertLoading(true);
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}/convert`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.customer) {
        setCurrentLead((prev) => ({
          ...prev,
          status: "WON",
          pipelineStage: "WON",
          customer: data.customer,
        }));
      }
    } finally {
      setConvertLoading(false);
    }
  }

  async function addActivity(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!actTitle.trim()) return;

    setActLoading(true);
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: actType,
          title: actTitle,
          detail: actDetail || null,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.activity) {
        setActivities((prev) => [data.activity, ...prev]);
        setActTitle("");
        setActDetail("");
      }
    } finally {
      setActLoading(false);
    }
  }

  async function saveLinks(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLinkError(null);
    setLinkSaving(true);

    const payload: any = {
      projectId: projectIdInput ? Number(projectIdInput) : null,
      bomId: bomIdInput ? Number(bomIdInput) : null,
      contractId: contractIdInput ? Number(contractIdInput) : null,
    };

    try {
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setLinkError(data?.error || "خطا در ذخیره لینک‌ها");
      } else {
        setCurrentLead((prev) => ({
          ...prev,
          project: data.project || prev.project,
          bom: data.bom || prev.bom,
          contract: data.contract || prev.contract,
        }));
      }
    } catch {
      setLinkError("خطای ارتباط با سرور.");
    } finally {
      setLinkSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">CRM / جزئیات سرنخ</p>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 mt-1">
            {currentLead.name}
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 space-x-2 space-x-reverse">
            <span>
              ایجاد شده در{" "}
              {toJalali(currentLead.createdAt)}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <StatusChip label="وضعیت" value={statusKey} />
            <StageChip stage={stageKey} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/crm")}
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-600 hover:text-slate-900 hover:border-slate-400"
          >
            ← بازگشت به CRM
          </button>
          {currentLead.customer ? (
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/crm/customers/${currentLead.customer!.id}`)
              }
              className="rounded-xl bg-emerald-600 text-white text-xs px-4 py-2 hover:bg-emerald-700"
            >
              مشاهده مشتری مرتبط
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConvertToCustomer}
              disabled={convertLoading}
              className="rounded-xl bg-indigo-600 text-white text-xs px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
            >
              {convertLoading ? "در حال تبدیل..." : "تبدیل به مشتری"}
            </button>
          )}
        </div>
      </section>

      {/* اطلاعات اصلی + اتصال به پروژه/BOM/قرارداد */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* اطلاعات اصلی */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3 text-[12px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Info label="نام سرنخ" value={currentLead.name} />
            <Info label="منبع سرنخ" value={currentLead.source || "—"} />
            <Info label="شماره تماس" value={currentLead.phone || "—"} />
            <Info label="ایمیل" value={currentLead.email || "—"} />
          </div>
          {currentLead.note && (
            <div>
              <div className="text-[11px] text-slate-500 mb-1">توضیحات</div>
              <p className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-[12px] text-slate-700">
                {currentLead.note}
              </p>
            </div>
          )}
        </div>

        {/* اتصال به پروژه / BOM / قرارداد */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3 text-[12px]">
          <h2 className="text-[13px] font-semibold text-slate-800">
            اتصال به پروژه‌ها / BOM / قرارداد
          </h2>
          <p className="text-[11px] text-slate-500">
            می‌توانید این سرنخ را به یک پروژه، BOM یا قرارداد موجود در سیستم
            متصل کنید (با وارد کردن شناسه داخلی آن‌ها).
          </p>

          <form onSubmit={saveLinks} className="space-y-2">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                شناسه پروژه مرتبط
              </label>
              <input
                value={projectIdInput}
                onChange={(e) => setProjectIdInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5"
                placeholder="مثلاً 101"
              />
              {currentLead.project && (
                <div className="text-[11px] text-slate-500 mt-1">
                  متصل به پروژه:{" "}
                  <span className="font-medium">
                    {currentLead.project.name || currentLead.project.code || currentLead.project.id}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                شناسه BOM مرتبط
              </label>
              <input
                value={bomIdInput}
                onChange={(e) => setBomIdInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5"
                placeholder="مثلاً 205"
              />
              {currentLead.bom && (
                <div className="text-[11px] text-slate-500 mt-1">
                  متصل به BOM:{" "}
                  <span className="font-medium">
                    {currentLead.bom.name || currentLead.bom.code || currentLead.bom.id}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                شناسه قرارداد مرتبط
              </label>
              <input
                value={contractIdInput}
                onChange={(e) => setContractIdInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5"
                placeholder="مثلاً 3001"
              />
              {currentLead.contract && (
                <div className="text-[11px] text-slate-500 mt-1">
                  متصل به قرارداد:{" "}
                  <span className="font-medium">
                    {currentLead.contract.title ||
                      currentLead.contract.number ||
                      currentLead.contract.id}
                  </span>
                </div>
              )}
            </div>

            {linkError && (
              <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {linkError}
              </div>
            )}

            <button
              type="submit"
              disabled={linkSaving}
              className="mt-1 rounded-full bg-slate-900 text-white text-[12px] px-5 py-1.5 hover:bg-slate-800 disabled:opacity-60"
            >
              {linkSaving ? "در حال ذخیره..." : "ذخیره لینک‌ها"}
            </button>
          </form>
        </div>
      </section>

      {/* ثبت پیگیری جدید */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3 text-[12px]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          ثبت پیگیری جدید برای این سرنخ
        </h2>
        <form onSubmit={addActivity} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                نوع فعالیت
              </label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
              >
                <option value="CALL">تماس تلفنی</option>
                <option value="MEETING">جلسه</option>
                <option value="WHATSAPP">واتس‌اپ</option>
                <option value="EMAIL">ایمیل</option>
                <option value="NOTE">یادداشت</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-500 mb-1 block">
                عنوان *
              </label>
              <input
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
                placeholder="مثلاً تماس برای ارسال پیش‌فاکتور..."
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 mb-1 block">
              توضیحات
            </label>
            <textarea
              value={actDetail}
              onChange={(e) => setActDetail(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={actLoading}
            className="rounded-full bg-indigo-600 text-white text-[12px] px-5 py-2 hover:bg-indigo-700 disabled:opacity-60"
          >
            {actLoading ? "در حال ثبت..." : "ثبت پیگیری"}
          </button>
        </form>
      </section>

      {/* تاریخچه پیگیری‌ها */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3 text-[12px]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          تاریخچه پیگیری‌ها
        </h2>
        {activities.length === 0 ? (
          <p className="text-[12px] text-slate-500">
            هنوز هیچ پیگیری برای این سرنخ ثبت نشده است.
          </p>
        ) : (
          <ul className="space-y-2">
            {activities.map((a) => (
              <li
                key={a.id}
                className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {a.title}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {toJalali(a.doneAt, true)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {activityLabel(a.type)}
                </div>
                {a.detail && (
                  <div className="text-[12px] text-slate-700 mt-1">
                    {a.detail}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* --- helpers --- */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
      <div className="text-[11px] text-slate-500 mb-0.5">{label}</div>
      <div className="text-[12px] text-slate-800">{value}</div>
    </div>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  const text =
    value === "NEW"
      ? "جدید"
      : value === "IN_PROGRESS"
      ? "در حال پیگیری"
      : value === "WON"
      ? "تبدیل به مشتری"
      : value === "LOST"
      ? "از دست رفته"
      : "نامشخص";

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1">
      <span>{label}:</span>
      <span className="font-semibold">{text}</span>
    </span>
  );
}

function StageChip({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    NEW: "ورود سرنخ",
    CONTACTED: "اولین تماس",
    PROPOSAL: "ارسال پیش‌فاکتور",
    NEGOTIATION: "مذاکره",
    WON: "قرارداد نهایی",
    LOST: "از دست رفته",
  };

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1">
      <span>مرحله:</span>
      <span className="font-medium">{map[stage] || stage || "نامشخص"}</span>
    </span>
  );
}

function activityLabel(t: string) {
  const map: Record<string, string> = {
    CALL: "تماس تلفنی",
    MEETING: "جلسه",
    WHATSAPP: "پیام واتس‌اپ",
    EMAIL: "ایمیل",
    NOTE: "یادداشت",
  };
  return map[t] || "فعالیت";
}
