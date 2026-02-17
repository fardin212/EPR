// app/dashboard/parties/[id]/ui/PartyEditClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PartyKind = "CUSTOMER" | "CONTRACTOR" | "SUPPLIER" | "PERSON";
type PartyType =
  | "CUSTOMER"
  | "CONTRACTOR"
  | "SUPPLIER"
  | "OWNER"
  | "EMPLOYEE"
  | "OTHER";

type BankAccountDTO = {
  id: number;
  title?: string | null;
  bankName?: string | null;
  accountNo?: string | null;
  cardNumber?: string | null;
  iban?: string | null;
  isDefault?: boolean | null;
};

type PartyDTO = {
  id: number;
  name: string;
  kind: PartyKind;
  type?: PartyType | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  nationalId?: string | null;
  companyName?: string | null;
  address?: string | null;
  note?: string | null;
  description?: string | null;

  // ✅ جدید:
  bankAccounts?: BankAccountDTO[];
  defaultBankAccount?: BankAccountDTO | null;
};

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function maskCard(v?: string | null) {
  const s = String(v ?? "").replace(/[^\d]/g, "");
  if (!s) return "";
  if (s.length <= 4) return s;
  return "**** **** **** " + s.slice(-4);
}

export default function PartyEditClient({
  id,
  initial,
}: {
  id: number;
  initial: PartyDTO | null;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [party, setParty] = useState<PartyDTO | null>(initial);

  const [form, setForm] = useState<PartyDTO>(() => {
    return (
      initial ?? {
        id,
        name: "",
        kind: "CUSTOMER",
        type: "CUSTOMER",
        phone: "",
        mobile: "",
        email: "",
        nationalId: "",
        companyName: "",
        address: "",
        note: "",
        description: "",
        bankAccounts: [],
        defaultBankAccount: null,
      }
    );
  });

  // فرم حساب بانکی (پیش‌فرض)
  const [bank, setBank] = useState<{
    id?: number;
    title: string;
    bankName: string;
    accountNo: string;
    cardNumber: string;
    iban: string;
  }>(() => {
    const d = initial?.defaultBankAccount;
    return {
      id: d?.id,
      title: d?.title ?? "حساب پیش‌فرض",
      bankName: d?.bankName ?? "",
      accountNo: d?.accountNo ?? "",
      cardNumber: d?.cardNumber ?? "",
      iban: d?.iban ?? "",
    };
  });

  const kindOptions = useMemo(
    () => [
      { value: "CUSTOMER" as const, label: "مشتری" },
      { value: "CONTRACTOR" as const, label: "پیمانکار" },
      { value: "SUPPLIER" as const, label: "تأمین‌کننده" },
      { value: "PERSON" as const, label: "سایر" },
    ],
    []
  );

  useEffect(() => {
    if (party) return;

    let ignore = false;

    (async () => {
      try {
        const res = await fetch(`/api/parties/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as PartyDTO;
        if (ignore) return;

        setParty(data);
        setForm(data);

        const d = data.defaultBankAccount;
        setBank({
          id: d?.id,
          title: d?.title ?? "حساب پیش‌فرض",
          bankName: d?.bankName ?? "",
          accountNo: d?.accountNo ?? "",
          cardNumber: d?.cardNumber ?? "",
          iban: d?.iban ?? "",
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id, party]);

  async function onSave() {
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        name: form.name,
        kind: form.kind,
        type: form.type,
        phone: form.phone || undefined,
        mobile: form.mobile || undefined,
        email: form.email || undefined,
        nationalId: form.nationalId || undefined,
        companyName: form.companyName || undefined,
        address: form.address || undefined,
        note: form.note || undefined,
        description: form.description || undefined,
      };

      // ✅ حساب بانکی
      const hasBank =
        bank.title.trim() ||
        bank.bankName.trim() ||
        bank.accountNo.trim() ||
        bank.cardNumber.trim() ||
        bank.iban.trim();

      if (hasBank) {
        payload.bankAccount = {
          id: bank.id,
          title: bank.title || "حساب پیش‌فرض",
          bankName: bank.bankName || undefined,
          accountNo: bank.accountNo || undefined,
          cardNumber: bank.cardNumber || undefined,
          iban: bank.iban || undefined,
        };
      }

      const res = await fetch(`/api/parties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "ویرایش انجام نشد");
        return;
      }

      // data = { party, bankAccounts, defaultBankAccount }
      const merged: PartyDTO = {
        ...(data.party ?? form),
        bankAccounts: data.bankAccounts ?? [],
        defaultBankAccount: data.defaultBankAccount ?? null,
      };

      setParty(merged);
      setForm(merged);

      const d = merged.defaultBankAccount;
      setBank({
        id: d?.id,
        title: d?.title ?? "حساب پیش‌فرض",
        bankName: d?.bankName ?? "",
        accountNo: d?.accountNo ?? "",
        cardNumber: d?.cardNumber ?? "",
        iban: d?.iban ?? "",
      });

      alert("ذخیره شد ✅");
    } catch (e) {
      console.error(e);
      setError("خطای غیرمنتظره رخ داد");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    const ok = confirm(`حذف طرف‌حساب «${form.name || "#" + id}»؟`);
    if (!ok) return;

    try {
      setRemoving(true);
      const res = await fetch(`/api/parties/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "حذف انجام نشد.");
        return;
      }
      router.push("/dashboard/parties");
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div dir="rtl" className="max-w-5xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-100">ویرایش طرف‌حساب</div>
          <div className="text-xs text-slate-400">
            شناسه: <span className="text-slate-300">{id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/parties"
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 hover:bg-slate-900"
          >
            بازگشت
          </Link>

          <button
            onClick={onDelete}
            disabled={removing}
            className={cls(
              "rounded-xl border px-3 py-2 text-xs",
              "border-rose-500/40 bg-rose-950/30 text-rose-100 hover:bg-rose-950/50",
              removing && "opacity-60"
            )}
          >
            {removing ? "در حال حذف..." : "حذف"}
          </button>

          <button
            onClick={onSave}
            disabled={loading}
            className={cls(
              "rounded-xl px-3 py-2 text-xs text-white",
              "bg-emerald-600 hover:bg-emerald-700",
              loading && "opacity-60"
            )}
          >
            {loading ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 shadow-sm">
        {error && (
          <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="نام *">
            <Input value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          </Field>

          <Field label="نوع اصلی (kind)">
            <Select
              value={form.kind}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  kind: v as PartyKind,
                  type: p.type || (v as any),
                }))
              }
            >
              {kindOptions.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="نوع کاربردی (type)">
            <Select
              value={form.type ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, type: (v || null) as any }))}
            >
              <option value="">(خالی)</option>
              <option value="CUSTOMER">مشتری</option>
              <option value="CONTRACTOR">پیمانکار</option>
              <option value="SUPPLIER">تأمین‌کننده</option>
              <option value="OWNER">مالک</option>
              <option value="EMPLOYEE">کارمند</option>
              <option value="OTHER">سایر</option>
            </Select>
          </Field>

          <Field label="شرکت/سازمان">
            <Input
              value={form.companyName ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, companyName: v }))}
            />
          </Field>

          <Field label="موبایل">
            <Input
              value={form.mobile ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, mobile: v }))}
            />
          </Field>

          <Field label="تلفن">
            <Input
              value={form.phone ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
            />
          </Field>

          <Field label="ایمیل">
            <Input
              value={form.email ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            />
          </Field>

          <Field label="کد/شناسه ملی">
            <Input
              value={form.nationalId ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, nationalId: v }))}
            />
          </Field>

          <Field label="آدرس" className="md:col-span-2">
            <Textarea
              rows={2}
              value={form.address ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, address: v }))}
            />
          </Field>

          <Field label="توضیحات" className="md:col-span-2">
            <Textarea
              rows={2}
              value={form.description ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, description: v }))}
            />
          </Field>
        </div>

        {/* ✅ Bank section */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-100">اطلاعات بانکی طرف‌حساب</div>
            <div className="text-[11px] text-slate-400">
              این اطلاعات در پرداخت‌ها/واریزی‌ها/چک‌ها استفاده می‌شود.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="عنوان حساب">
              <Input value={bank.title} onChange={(v) => setBank((p) => ({ ...p, title: v }))} />
            </Field>

            <Field label="نام بانک">
              <Input value={bank.bankName} onChange={(v) => setBank((p) => ({ ...p, bankName: v }))} />
            </Field>

            <Field label="شماره حساب">
              <Input value={bank.accountNo} onChange={(v) => setBank((p) => ({ ...p, accountNo: v }))} />
            </Field>

            <Field label="شماره کارت">
              <Input value={bank.cardNumber} onChange={(v) => setBank((p) => ({ ...p, cardNumber: v }))} />
              <div className="mt-1 text-[11px] text-slate-500">{maskCard(bank.cardNumber)}</div>
            </Field>

            <Field label="شماره شبا (IBAN)" className="md:col-span-2">
              <Input value={bank.iban} onChange={(v) => setBank((p) => ({ ...p, iban: v }))} />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI atoms ---------- */

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cls("space-y-1", className)}>
      <div className="text-xs text-slate-300">{label}</div>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type ?? "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-700"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows ?? 3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-700"
    />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-700"
    >
      {children}
    </select>
  );
}
