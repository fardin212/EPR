// app/dashboard/projects/[id]/edit/page.tsx
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import ProjectFormClient from "@/app/dashboard/projects/new/ProjectFormClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any, name = "id") {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    throw new Error(`${name} نامعتبر است.`);
  }
  return n;
}

async function buildCookieHeader() {
  const store = await cookies();
  const all = store.getAll();
  const fromCookies = all.map((c) => `${c.name}=${c.value}`).join("; ");
  if (fromCookies.trim()) return fromCookies;

  const h = await headers();
  return h.get("cookie") ?? "";
}

async function getBaseUrl() {
  const envUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL;

  if (envUrl) {
    if (!envUrl.startsWith("http")) return `https://${envUrl}`;
    return envUrl;
  }

  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export default async function EditProjectPage(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const { id } = await getParams(ctx);
  const projectId = mustInt(id, "شناسه پروژه");

  const baseUrl = await getBaseUrl();
  const cookieHeader = await buildCookieHeader();

  // پروژه
  const projectRes = await fetch(`${baseUrl}/api/projects/${projectId}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (projectRes.status === 404) notFound();
  if (!projectRes.ok) throw new Error(await projectRes.text());
  const project = await projectRes.json();

  // ✅ مشتری‌ها: از Parties نوع CUSTOMER (PartyId)
  const customersRes = await fetch(`${baseUrl}/api/parties?kind=CUSTOMER`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  const customersRaw = customersRes.ok ? await customersRes.json() : [];
  const customers = (Array.isArray(customersRaw) ? customersRaw : [])
    .map((p: any) => ({ id: Number(p.id), name: String(p.name ?? "").trim() }))
    .filter((x: any) => x.id > 0 && x.name);

  // پیمانکارها
  const contractorsRes = await fetch(`${baseUrl}/api/management/contractors`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  const contractors = contractorsRes.ok ? await contractorsRes.json() : [];

  // نوع پروژه‌ها
  const projectTypesRes = await fetch(`${baseUrl}/api/project-types`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  const projectTypes = projectTypesRes.ok ? await projectTypesRes.json() : [];

  // ✅ initialProject برای فرم edit
  const initialProject = {
    id: project.id,
    title: project.title ?? "",
    name: project.name ?? "",
    type: project.type ?? "کانکس",
    projectTypeId: project.projectTypeId ?? null,
    size: project.size ?? "",
    startDate: project.startDate ?? null,
    description: project.description ?? "",
    customerId: project.customerId ?? null,
    contractorIds: Array.isArray(project.contractors)
      ? project.contractors.map((x: any) => x.contractorId).filter((n: any) => Number(n) > 0)
      : [],
  };

  return (
    <div className="p-6">
      <ProjectFormClient
        mode="edit"
        initialProject={initialProject}
        customers={customers}
        contractors={contractors}
        projectTypes={projectTypes}
      />
    </div>
  );
}
