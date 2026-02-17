"use client";

import { useEffect, useMemo, useState } from "react";

type PayStatus = "PAID" | "PARTIAL" | "UNPAID";
type WorkStatus = "ACTIVE" | "DONE" | "CANCELLED";

type ContractRow = {
  id: number;
  contractor: { id: number; name: string };
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PayStatus; // وضعیت پرداخت
  contractStatus: WorkStatus; // وضعیت کار/قرارداد
};

type ContractorOption = {
  id: number; // contractorProfileId
  partyId: number;
  name: string;
};

function money(n: any) {
  return Number(n || 0).toLocaleString("fa-IR");
}

function PayStatusBadge({ status }: { status: PayStatus }) {
  const map: Record<PayStatus, { label: string; cls: string }> = {
    PAID: { label: "تسویه", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" },
    PARTIAL: { label: "نیمه", cls: "bg-amber-500/15 text-amber-200 border-amber-500/30" },
    UNPAID: { label: "بدهکار", cls: "bg-rose-500/15 text-rose-200 border-rose-500/30" },
  };
  const m = map[status];
  return <span className={`inline-flex items-center px-2 py-1 text-[11px] rounded-md border ${m.cls}`}>{m.label}</span>;
}

function WorkStatusBadge({ status }: { status: WorkStatus }) {
  const map: Record<WorkStatus, { label: string; cls: string }> = {
    ACTIVE: { label: "فعال", cls: "bg-sky-500/15 text-sky-200 border-sky-500/30" },
    DONE: { label: "تمام", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" },
    CANCELLED: { label: "لغو", cls: "bg-zinc-500/15 text-zinc-200 border-zinc-500/30" },
  };
  const m = map[status];
  return <span className={`inline-flex items-center px-2 py-1 text-[11px] rounded-md border ${m.cls}`}>{m.label}</span>;
}

export default function ProjectContractorsCard({ projectId }: { projectId: number }) {
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contracts, setContracts] = useState<ContractRow[]>([]);

  const [loadingContractors, setLoadingContractors] = useState(false);
  const [contractors, setContractors] = useState<ContractorOption[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [q, setQ] = useState("");
  const [selectedContractorId, setSelectedContractorId] = useState<number | "">("");
  const [agreedAmount, setAgreedAmount] = useState("");
  const [role, setRole] = useState("");
  const [note, setNote] = useState("");
  const [startDate, setStartDate] = useState(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState(""); // yyyy-mm-dd

  function parseAmount(v: string) {
    const n = Number(String(v).replace(/[,\s]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  async function loadContracts() {
    setLoadingContracts(true);
    try {
      const r = await fetch(`/api/projects/${projectId}/contracts`, { cache: "no-store" });
      const data = await r.json();
      setContracts((data?.contracts ?? []) as ContractRow[]);
    } finally {
      setLoadingContracts(false);
    }
  }

  async function loadContractors() {
    setLoadingContractors(true);
    try {
      // ✅ مهم: برای انتخاب پیمانکار فقط mode=select
      const r = await fetch(`/api/management/contractors?mode=select`, { cache: "no-store" });
      const data = await r.json();
      setContractors((Array.isArray(data) ? data : []) as ContractorOption[]);
    } finally {
      setLoadingContractors(false);
    }
  }

  useEffect(() => {
    loadContracts();
    loadContractors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const contractorOptions = useMemo(() => {
    const s = q.trim();
    return contractors
      .map((c) => ({ id: c.id, name: c.name }))
      .filter((c) => (!s ? true : c.name.includes(s) || String(c.id).includes(s)));
  }, [contractors, q]);

  async function addContract() {
    if (!selectedContractorId) return alert("پیمانکار را انتخاب کن.");
    const amount = parseAmount(agreedAmount);
    if (amount <= 0) return alert("مبلغ قرارداد نامعتبر است.");

    const res = await fetch(`/api/projects/${projectId}/contracts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractorId: Number(selectedContractorId),
        agreedAmount: amount,
        role: role || null,
        note: note || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        status: "ACTIVE",
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return alert(t || "خطا در ثبت قرارداد");
    }

    setSelectedContractorId("");
    setAgreedAmount("");
    setRole("");
    setNote("");
    setStartDate("");
    setEndDate("");
    setShowAdd(false);

    await loadContracts();
  }

  async function updateContract(contractId: number, patch: any) {
    const res = await fetch(`/api/projects/${projectId}/contracts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: contractId, ...patch }),
    });

    if (!res.ok) {
      const t = await res.text();
      alert(t || "خطا در ویرایش قرارداد");
      return;
    }
    await loadContracts();
  }

  async function deleteContract(contractId: number) {
    if (!confirm("حذف این قرارداد؟")) return;

    const res = await fetch(`/api/projects/${projectId}/contracts`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: contractId }),
    });

    if (!res.ok) {
      const t = await res.text();
      alert(t || "خطا در حذف قرارداد");
      return;
    }

    await loadContracts();
  }

  return (
    <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm text-white">پیمانکاران پروژه</h3>
          <p className="text-[11px] text-slate-400">
            پرداخت‌ها از خزانه پرداختی‌ها ثبت می‌شوند و با projectId جمع می‌گردند.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white"
          >
            {showAdd ? "بستن" : "+ افزودن پیمانکار"}
          </button>

          <a
            href={`/dashboard/treasury`}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-white border border-white/10"
          >
            خزانه / پرداختی‌ها
          </a>
        </div>
      </div>

      {showAdd && (
        <div className="mb-3 rounded-xl border border-white/10 bg-slate-900/60 p-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              className="md:col-span-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white"
              placeholder="جستجو پیمانکار…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="md:col-span-2 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white"
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">
                {loadingContractors ? "در حال بارگذاری…" : "— انتخاب پیمانکار —"}
              </option>
              {contractorOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white"
              placeholder="مبلغ قرارداد"
              value={agreedAmount}
              onChange={(e) => setAgreedAmount(e.target.value)}
            />

            <button onClick={addContract} className="w-full rounded-lg bg-purple-600 px-3 py-2 text-xs text-white">
              ثبت قرارداد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white"
              placeholder="نقش (اختیاری)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <textarea
            className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white"
            placeholder="یادداشت (اختیاری)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>
      )}

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
              <th className="text-left">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="py-2">
                  <div className="text-white">{c.contractor.name}</div>
                </td>

                <td>{money(c.totalAmount)}</td>
                <td className="text-emerald-300">{money(c.paidAmount)}</td>
                <td className="text-rose-300 font-semibold">{money(c.remainingAmount)}</td>

                <td>
                  <PayStatusBadge status={c.status} />
                </td>

                <td>
                  <WorkStatusBadge status={c.contractStatus} />
                </td>

                <td className="py-2 text-left">
                  <div className="flex justify-end gap-2">
                    <select
                      className="rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-white"
                      value={c.contractStatus}
                      onChange={(e) => updateContract(c.id, { status: e.target.value })}
                      title="وضعیت کار"
                    >
                      <option value="ACTIVE">فعال</option>
                      <option value="DONE">تمام</option>
                      <option value="CANCELLED">لغو</option>
                    </select>

                    <button
                      className="px-2 py-1 rounded-md border border-white/10 bg-rose-600/20 text-[11px] text-rose-200"
                      onClick={() => deleteContract(c.id)}
                      title="حذف"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
