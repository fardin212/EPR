"use client";

import Link from "next/link";

type WizardSteps = {
  customer: boolean;
  project: boolean;
  invoice: boolean;
  receive: boolean;
  purchase: boolean;
  report: boolean;
};

export default function WizardStepper({
  projectId,
  partyId,
  steps,
}: {
  projectId: number;
  partyId?: number | null;
  steps: WizardSteps;
}) {
  const cls = (ok: boolean) =>
    ok
      ? "bg-emerald-600 text-white"
      : "bg-slate-200 text-slate-600";

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold mb-3">
        🧭 وضعیت پیشرفت پروژه
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
        <Step label="مشتری" ok={steps.customer} />
        <Step label="پروژه" ok={steps.project} />
        <Step
          label="فاکتور فروش"
          ok={steps.invoice}
          href={`/dashboard/invoices/new?projectId=${projectId}&partyId=${partyId ?? ""}`}
        />
        <Step
          label="دریافت"
          ok={steps.receive}
          href={`/dashboard/treasury/payments/new?projectId=${projectId}&partyId=${partyId ?? ""}&direction=IN`}
        />
        <Step
          label="خرید پروژه"
          ok={steps.purchase}
          href={`/dashboard/inventory/purchase?projectId=${projectId}&partyId=${partyId ?? ""}`}
        />
        <Step
          label="گزارش"
          ok={steps.report}
          href={`/dashboard/projects/${projectId}/report`}
        />
      </div>
    </div>
  );
}

function Step({
  label,
  ok,
  href,
}: {
  label: string;
  ok: boolean;
  href?: string;
}) {
  const body = (
    <div
      className={`rounded-xl px-3 py-3 text-center font-medium ${ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-600 border border-slate-200"}`}
    >
      {ok ? "✔ " : "○ "} {label}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
