// app/dashboard/projects/[id]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import StageChecklistClient from "./StageChecklistClient";

import ProjectInvoicesTab from "./ui/ProjectInvoicesTab";
import ProjectPaymentsTab from "./ui/ProjectPaymentsTab";
import ProjectContractorsTab from "./ui/ProjectContractorsTab";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================== Utils ===================== */

async function unwrap<T>(v: T | Promise<T>): Promise<T> {
  return typeof (v as any)?.then === "function" ? await (v as any) : (v as any);
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={[
        "rounded-xl border px-4 py-2 text-sm transition",
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white hover:bg-zinc-50",
      ].join(" ")}
    >
      {children}
    </a>
  );
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ tab?: string }> | { tab?: string };
}) {
  const p = await unwrap(params);
  const sp = await unwrap(searchParams ?? {});

  const projectId = mustInt(p.id, "شناسه پروژه");

  const tab = ((sp.tab as any) || "overview") as
    | "overview"
    | "qc"
    | "contractors"
    | "payments"
    | "invoices";

  const project = await prisma.project.findFirst({
    where: { id: projectId, isDeleted: false },
    include: {
      customerParty: true,
      projectType: true,
      stages: {
        orderBy: { id: "asc" },
        include: {
          checklist: { orderBy: { id: "asc" } },
        },
      },
    },
  });

  if (!project) return notFound();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-xl font-extrabold">{project.title}</div>
            <div className="text-sm text-zinc-600">
              کد: {project.code} | نام داخلی: {project.name}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white"
              href={`/dashboard/projects/${project.id}/edit`}
            >
              ویرایش
            </a>
            <button className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white">
              حذف
            </button>
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white">
              اتمام پروژه
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          <TabLink
            active={tab === "invoices"}
            href={`/dashboard/projects/${project.id}?tab=invoices`}
          >
            Invoices
          </TabLink>
          <TabLink
            active={tab === "payments"}
            href={`/dashboard/projects/${project.id}?tab=payments`}
          >
            Payments
          </TabLink>
          <TabLink
            active={tab === "qc"}
            href={`/dashboard/projects/${project.id}?tab=qc`}
          >
            QC
          </TabLink>
          <TabLink
            active={tab === "contractors"}
            href={`/dashboard/projects/${project.id}?tab=contractors`}
          >
            Contractors
          </TabLink>
          <TabLink
            active={tab === "overview"}
            href={`/dashboard/projects/${project.id}?tab=overview`}
          >
            Overview
          </TabLink>
        </div>
      </div>

      {/* Content */}
      {tab === "qc" ? (
        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-extrabold">کنترل کیفیت پروژه (QC)</div>
            <div className="text-sm text-zinc-600">
              تعداد مراحل: <span className="font-bold">{project.stages.length}</span>
            </div>
          </div>

          {project.stages.length === 0 ? (
            <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
              برای این پروژه هنوز مرحله‌ای ساخته نشده است.
            </div>
          ) : (
            <div className="space-y-4">
              {project.stages.map((stage) => (
                <div key={stage.id} className="rounded-2xl border p-4">
                  <div className="mb-3 font-extrabold">{stage.name}</div>
                  <StageChecklistClient stageId={stage.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === "invoices" ? (
        <ProjectInvoicesTab projectId={project.id} />
      ) : tab === "payments" ? (
        <ProjectPaymentsTab projectId={project.id} />
      ) : tab === "contractors" ? (
        <ProjectContractorsTab projectId={project.id} />
      ) : (
        <div className="rounded-2xl border bg-white p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-zinc-500">ابعاد</div>
              <div className="font-bold">{project.size ?? "-"}</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-zinc-500">وضعیت</div>
              <div className="font-bold">{project.status}</div>
            </div>

            <div className="rounded-xl border p-4 md:col-span-2">
              <div className="text-xs text-zinc-500">مشتری</div>
              <div className="font-bold">
                {project.customerParty?.name
                  ? `${project.customerParty.name} (ID: ${project.customerParty.id})`
                  : "-"}
              </div>
            </div>

            <div className="rounded-xl border p-4 md:col-span-2">
              <div className="text-xs text-zinc-500">توضیحات</div>
              <div className="text-sm text-zinc-700">{project.description ?? "—"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
