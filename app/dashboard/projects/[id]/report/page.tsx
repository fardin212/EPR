// app/dashboard/projects/[id]/report/page.tsx
import { cookies } from "next/headers";
import ReportClient from "./ui/ReportClient";

export const dynamic = "force-dynamic";

async function fetchJson(url: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Report fetch failed: ${res.status}`);
  }
  return res.json();
}

export default async function ProjectReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

  // JSON Report from your API
  const data = await fetchJson(`${base}/api/projects/${id}/report?format=json`);

  return <ReportClient projectId={Number(id)} data={data} />;
}
