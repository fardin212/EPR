// app/dashboard/parties/new/page.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";

type PartyKind = "CUSTOMER" | "CONTRACTOR" | "SUPPLIER" | "PERSON";
type PartyType =
  | "CUSTOMER"
  | "CONTRACTOR"
  | "SUPPLIER"
  | "OWNER"
  | "EMPLOYEE"
  | "OTHER";

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function NewPartyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [kind, setKind] = useState<PartyKind>("CUSTOMER");

  const kindOptions = useMemo(
    () => [
      { value: "CUSTOMER" as const, label: "مشتری" },
      { value: "CONTRACTOR" as const, label: "پیمانکار" },
      { value: "SUPPLIER" as const, label: "تأمین‌کننده" },
      { value: "PERSON" as const, label: "سایر" },
    ],
    []
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const kindValue = (fd.get("kind") as PartyKind) || "CUSTOMER";
    const typeValue = ((fd.get("type") as PartyType) || "") || (kindValue as any);

    const contractorEnabled = kindValue === "CONTRACTOR";

    const skillsRaw = (fd.get("skills") as string) || "";
    const skills = skillsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, levelStr, category, description] = line.split("|").map((s) => s?.trim());
        return {
          name: name || "",
          level: levelStr ? Number(levelStr) : undefined,
          category: category || "",
          projectTypeId: undefined,
          description,
        };
      });

    const bankTitle = (fd.get("bankTitle") as string) || "";
    const bankName = (fd.get("bankName") as string) || "";
    const accountNumber = (fd.get("accountNumber") as string) || "";
    const cardNumber = (fd.get("cardNumber") as string) || "";
    const iban = (fd.get("iban") as string) || "";

    const payload: any = {
      name: fd.get("name") as string,
      kind: kindValue,
      type: typeValue,
      phone: (fd.get("phone") as string) || undefined,
      mobile: (fd.get("mobile") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      nationalId: (fd.get("nationalId") as string) || undefined,
      companyName: (fd.get("companyName") as string) || undefined,
      address: (fd.get("address") as string) || undefined,
      note: (fd.get("note") as string) || undefined,
      description: (fd.get("description") as string) || undefined,
    };

    // ✅ بانک
    const hasBank =
      bankTitle.trim() ||
      bankName.trim() ||
      accountNumber.trim() ||
      cardNumber.trim() ||
      iban.trim();

    if (hasBank) {
      payload.bankAccount = {
        title: bankTitle || "حساب پیش‌فرض",
        bankName: bankName || undefined,
        accountNumber: accountNumber || undefined,
        cardNumber: cardNumber || undefined,
        iban: iban || undefined,
      };
    }

    if (contractorEnabled) {
      payload.contractor = {
        specialty: (fd.get("specialty") as string) || undefined,
        note: (fd.get("contractorNote") as string) || undefined,
        dayRate: fd.get("dayRate") ? Number(fd.get("dayRate")) : undefined,
        skills: skills.length > 0 ? skills : undefined,
      };
    }

    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "خطا در ایجاد طرف‌حساب");
      } else {
        setSuccess("طرف‌حساب با موفقیت ثبت شد ✅");
        form.reset();
        setKind("CUSTOMER");
      }
    } catch (err) {
      console.error(err);
      setError("خطای غیرمنتظره رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="max-w-5xl">
      <div className="mb-4">
        <div className="text-lg font-bold text-slate-100">ثبت طرف‌حساب جدید</div>
        <div className="text-xs text-slate-400">
          مشتری، پیمانکار، تأمین‌کننده یا سایر طرف‌های مرتبط را اینجا ثبت کن.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="نام *">
            <Input name="name" required />
          </Field>

          <Field label="نوع اصلی (kind) *">
            <Select
              name="kind"
              value={kind}
              onChange={(v) => setKind(v as PartyKind)}
            >
              {kindOptions.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="نوع کاربردی (type)">
            <Select name="type" defaultValue="">
              <option value="">(خودکار بر اساس kind)</option>
              <option value="CUSTOMER">مشتری</option>
              <option value="CONTRACTOR">پیمانکار</option>
              <option value="SUPPLIER">تأمین‌کننده</option>
              <option value="OWNER">مالک</option>
              <option value="EMPLOYEE">کارمند</option>
              <option value="OTHER">سایر</option>
            </Select>
          </Field>

          <Field label="نام شرکت / سازمان">
            <Input name="companyName" />
          </Field>

          <Field label="موبایل">
            <Input name="mobile" />
          </Field>

          <Field label="تلفن ثابت">
            <Input name="phone" />
          </Field>

          <Field label="ایمیل">
            <Input name="email" />
          </Field>

          <Field label="کد/شناسه ملی">
            <Input name="nationalId" />
          </Field>

          <Field label="آدرس" className="md:col-span-2">
            <Textarea name="address" rows={2} />
          </Field>

          <Field label="توضیحات (داخلی)" className="md:col-span-2">
            <Textarea name="description" rows={2} />
          </Field>
        </div>

        {/* ✅ اطلاعات بانکی */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-100">اطلاعات بانکی طرف‌حساب</div>
            <div className="text-[11px] text-slate-400">
              برای اتصال به پرداختی‌ها/واریزی‌ها/چک‌ها
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="عنوان حساب">
              <Input name="bankTitle" placeholder="مثلاً حساب اصلی / کارت شخصی" />
            </Field>

            <Field label="نام بانک">
              <Input name="bankName" placeholder="مثلاً ملی / ملت / صادرات..." />
            </Field>

            <Field label="شماره حساب">
              <Input name="accountNo" placeholder="مثلاً 1234567890" />
            </Field>

            <Field label="شماره کارت">
              <Input name="cardNumber" placeholder="مثلاً 6037-9912-...." />
            </Field>

            <Field label="شماره شبا (IBAN)" className="md:col-span-2">
              <Input name="iban" placeholder="IRxxxxxxxxxxxxxxxxxxxxxxxx" />
            </Field>
          </div>
        </div>

        {/* بخش پیمانکار */}
        {kind === "CONTRACTOR" && (
          <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-4">
            <div className="mb-3 text-sm font-bold text-slate-100">تنظیمات اختصاصی پیمانکار</div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="تخصص اصلی">
                <Input name="specialty" placeholder="مثلاً اسکلت فلزی، ساندویچ‌پنل، برق..." />
              </Field>

              <Field label="دستمزد روزانه (ریال)">
                <Input name="dayRate" type="number" />
              </Field>

              <Field label="توضیحات پیمانکار" className="md:col-span-2">
                <Textarea name="contractorNote" rows={2} />
              </Field>

              <Field label="مهارت‌ها (هر خط: نام | سطح (۱-۵) | دسته | توضیح)" className="md:col-span-2">
                <Textarea
                  name="skills"
                  rows={3}
                  placeholder={`مثال:\nجوشکاری | 4 | اسکلت فلزی | اجرای جوش در اسکلت سنگین\nبرق‌کاری | 3 | تاسیسات | سیم‌کشی داخلی کانکس`}
                />
              </Field>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className={cls(
              "rounded-xl px-4 py-2 text-sm text-white",
              "bg-emerald-600 hover:bg-emerald-700",
              loading && "opacity-60"
            )}
          >
            {loading ? "در حال ثبت..." : "ثبت طرف‌حساب"}
          </button>

          {error && (
            <div className="text-xs text-rose-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-200">
              {success}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

/* ---------- atoms ---------- */

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
  name,
  required,
  type,
  placeholder,
}: {
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      name={name}
      required={required}
      type={type ?? "text"}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-700"
    />
  );
}

function Textarea({
  name,
  rows,
  placeholder,
}: {
  name: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      name={name}
      rows={rows ?? 3}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-700"
    />
  );
}

function Select({
  name,
  value,
  onChange,
  defaultValue,
  children,
}: {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-700"
    >
      {children}
    </select>
  );
}
