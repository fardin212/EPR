"use client";

import { useEffect, useMemo, useState } from "react";

type PartyType = "CUSTOMER" | "SUPPLIER" | "CONTRACTOR" | "OTHER";

type Party = {
  id: number | string;
  name: string;
  type: PartyType;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  createdAt?: string;
};

const typeFa: Record<PartyType, string> = {
  CUSTOMER: "مشتری",
  SUPPLIER: "تأمین‌کننده",
  CONTRACTOR: "پیمانکار",
  OTHER: "سایر",
};

function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function Badge({ type }: { type: PartyType }) {
  const cls =
    type === "CUSTOMER"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : type === "SUPPLIER"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : type === "CONTRACTOR"
      ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs ring-1", cls)}>
      {typeFa[type]}
    </span>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            بستن
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmText = "حذف",
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          انصراف
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {loading ? "در حال حذف..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}

function PartyForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Partial<Party> | null;
  submitting?: boolean;
  onSubmit: (data: {
    name: string;
    type: PartyType;
    phone?: string;
    company?: string;
    notes?: string;
  }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<PartyType>((initial?.type as PartyType) ?? "CUSTOMER");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  useEffect(() => {
    setName(initial?.name ?? "");
    setType(((initial?.type as PartyType) ?? "CUSTOMER") as PartyType);
    setPhone((initial?.phone ?? "") as string);
    setCompany((initial?.company ?? "") as string);
    setNotes((initial?.notes ?? "") as string);
  }, [initial?.id]); // وقتی رکورد تغییر کرد، فرم ریست شود

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({
          name: name.trim(),
          type,
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }}
    >
      <div className="md:col-span-2">
        <label className="mb-1 block text-xs text-slate-600">نام طرف حساب</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً: مهدی حافظی"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-slate-600">نوع</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PartyType)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        >
          <option value="CUSTOMER">مشتری</option>
          <option value="SUPPLIER">تأمین‌کننده</option>
          <option value="CONTRACTOR">پیمانکار</option>
          <option value="OTHER">سایر</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-slate-600">شماره تماس</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09xxxxxxxxx"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs text-slate-600">شرکت / سازمان</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="اختیاری"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-xs text-slate-600">توضیحات</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="اختیاری"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="md:col-span-2 flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </div>
    </form>
  );
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export default function PartiesPageClient() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Party[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<PartyType | "ALL">("ALL");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [saving, setSaving] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== "ALL" && r.type !== tab) return false;
      if (!s) return true;
      const hay = `${r.name ?? ""} ${r.phone ?? ""} ${r.company ?? ""} ${r.notes ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q, tab]);

  async function refresh() {
    setLoading(true);
    try {
      const data = await api<{ items: Party[] }>("/api/parties");
      setRows(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitForm(payload: { name: string; type: PartyType; phone?: string; company?: string; notes?: string }) {
    setSaving(true);
    try {
      if (editing?.id != null) {
        const updated = await api<Party>(`/api/parties/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setRows((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
      } else {
        const created = await api<Party>("/api/parties", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setRows((prev) => [created, ...prev]);
      }
      setOpenForm(false);
      setEditing(null);
    } catch (e) {
      alert("خطا در ذخیره: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api<{ ok: true }>(`/api/parties/${deleteTarget.id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((p) => String(p.id) !== String(deleteTarget.id)));
      setOpenDelete(false);
      setDeleteTarget(null);
    } catch (e) {
      alert("خطا در حذف: " + (e as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-l from-indigo-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-bold text-slate-900">طرف حساب‌ها</div>
            <div className="mt-1 text-sm text-slate-600">
              مدیریت مشتریان، پیمانکاران، تأمین‌کنندگان و سایر طرف‌های مرتبط.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditing(null);
                setOpenForm(true);
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              + طرف حساب جدید
            </button>
            <button
              onClick={refresh}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              بروزرسانی
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["ALL", "CUSTOMER", "SUPPLIER", "CONTRACTOR", "OTHER"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs ring-1 transition",
                  tab === t
                    ? "bg-slate-900 text-white ring-slate-900"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                )}
              >
                {t === "ALL" ? "همه" : typeFa[t as PartyType]}
              </button>
            ))}
          </div>

          <div className="w-full md:w-96">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجو در نام، موبایل، شرکت..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-900">
          لیست طرف حساب‌ها
          <span className="mr-2 text-xs font-normal text-slate-500">({filtered.length} مورد)</span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-600">در حال بارگذاری...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-sm font-semibold text-slate-900">چیزی پیدا نشد</div>
            <div className="mt-1 text-sm text-slate-600">یک طرف حساب جدید ثبت کنید یا فیلترها را تغییر دهید.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-right font-medium">نام</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right font-medium">نوع</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right font-medium">شرکت/سازمان</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right font-medium">تماس</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right font-medium">توضیحات</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={String(r.id)} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-900">{r.name}</td>
                    <td className="px-5 py-3">
                      <Badge type={r.type} />
                    </td>
                    <td className="px-5 py-3 text-slate-700">{r.company || "—"}</td>
                    <td className="px-5 py-3 text-slate-700">{r.phone || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{r.notes || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(r);
                            setOpenForm(true);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(r);
                            setOpenDelete(true);
                          }}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-100"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        open={openForm}
        title={editing ? "ویرایش طرف حساب" : "افزودن طرف حساب"}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
      >
        <PartyForm initial={editing} onSubmit={submitForm} submitting={saving} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={openDelete}
        title="حذف طرف حساب"
        description={`آیا از حذف «${deleteTarget?.name ?? ""}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        loading={deleting}
        onCancel={() => {
          setOpenDelete(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
