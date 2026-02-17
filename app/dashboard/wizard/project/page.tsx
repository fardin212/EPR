"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Party = { id: number; name: string; kind?: string; type?: string };
type Project = { id: number; name?: string; title?: string; code?: string };

async function jget(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function ProjectWizardPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [parties, setParties] = useState<Party[]>([]);
  const [partyId, setPartyId] = useState<number | null>(null);

  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Step 1: load parties, auto-select latest
  useEffect(() => {
    (async () => {
      // اگر endpoint لیست parties دارید:
      const data = await jget("/api/parties?take=50&skip=0");
      const list: Party[] = data?.items || data || [];
      setParties(list);

      // auto-select last created (فرض: ترتیب desc)
      if (list?.length && !partyId) setPartyId(list[0].id);
    })().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 2: load projects for party (اختیاری)
  useEffect(() => {
    if (!partyId) return;
    (async () => {
      const data = await jget(`/api/projects?take=50&skip=0&customerId=${partyId}`);
      const list: Project[] = data?.items || data || [];
      setProjects(list);
      // اگر پروژه‌ای وجود داشت، آخرین را انتخاب کن
      if (list?.length && !projectId) setProjectId(list[0].id);
    })().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId]);

  const canStep2 = !!partyId;
  const canStep3 = !!projectId;
  const canStep4 = !!projectId;

  const partyLabel = useMemo(
    () => parties.find((p) => p.id === partyId)?.name || "—",
    [parties, partyId]
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-slate-500">ویزارد پروژه</div>
        <div className="mt-1 text-xl font-bold">مشتری → پروژه → فاکتور → دریافت</div>
        <div className="mt-1 text-xs text-slate-400">
          مشتری انتخاب‌شده: {partyLabel} • پروژه: {projectId ?? "—"}
        </div>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((n: any) => (
          <button
            key={n}
            onClick={() => setStep(n)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              step === n ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"
            }`}
          >
            مرحله {n}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="font-semibold">مرحله 1: انتخاب/ایجاد مشتری</div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">مشتری</label>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={partyId ?? ""}
                onChange={(e) => setPartyId(Number(e.target.value))}
              >
                <option value="" disabled>
                  انتخاب کنید
                </option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-slate-400">
                * آخرین مشتری ساخته‌شده به صورت خودکار انتخاب می‌شود.
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2">
              <Link
                className="rounded-xl border px-4 py-2 text-center hover:bg-slate-50"
                href="/dashboard/parties/new"
              >
                ایجاد مشتری جدید
              </Link>

              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-40"
                disabled={!canStep2}
                onClick={() => setStep(2)}
              >
                ادامه → مرحله 2
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="font-semibold">مرحله 2: ساخت/انتخاب پروژه</div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">پروژه‌های مشتری</label>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={projectId ?? ""}
                onChange={(e) => setProjectId(Number(e.target.value))}
              >
                <option value="">(اختیاری) انتخاب پروژه موجود</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.name || p.title || "بدون عنوان"}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-slate-400">
                اگر پروژه جدید می‌خوای، از دکمه کناری بساز.
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2">
              <Link
                className="rounded-xl border px-4 py-2 text-center hover:bg-slate-50"
                href={`/dashboard/projects/new?customerId=${partyId}`}
              >
                ایجاد پروژه جدید برای این مشتری
              </Link>

              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-40"
                disabled={!canStep3}
                onClick={() => setStep(3)}
              >
                ادامه → مرحله 3
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="font-semibold">مرحله 3: صدور فاکتور فروش (Draft)</div>
          <div className="mt-2 text-sm text-slate-600">
            پیشنهاد: فاکتور را Draft بساز، سپس Finalize (قفل پروژه‌محور فعال است).
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
              href={`/dashboard/invoices/new?projectId=${projectId}&partyId=${partyId}`}
            >
              ساخت فاکتور فروش برای پروژه
            </Link>

            <Link
              className="rounded-xl border px-4 py-2 hover:bg-slate-50"
              href={`/dashboard/invoices`}
            >
              رفتن به لیست فاکتورها
            </Link>

            <button
              className="rounded-xl border px-4 py-2 hover:bg-slate-50"
              onClick={() => setStep(4)}
            >
              مرحله 4: ثبت دریافت
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="font-semibold">مرحله 4: ثبت دریافت کارفرما (خزانه)</div>
          <div className="mt-2 text-sm text-slate-600">
            دریافت‌ها باید پروژه داشته باشند (قفل فعال).
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
              href={`/dashboard/treasury?projectId=${projectId}&partyId=${partyId}&direction=IN`}
            >
              ثبت دریافت برای پروژه
            </Link>

            <Link
              className="rounded-xl border px-4 py-2 hover:bg-slate-50"
              href={`/dashboard/projects/${projectId}/report`}
            >
              مشاهده گزارش پروژه
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600 shadow-sm">
        <div className="font-semibold text-slate-900">نکته</div>
        <div className="mt-1">
          اگر queryهای `?customerId=` یا `?projectId=` را فرم‌های شما هنوز پشتیبانی نمی‌کنند،
          مرحله بعدی اینه که در فرم‌های مربوطه مقدار اولیه را از query بخوانیم.
        </div>
      </div>
    </div>
  );
}
