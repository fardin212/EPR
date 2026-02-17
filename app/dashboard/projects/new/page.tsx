"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectFormClient from "./ProjectFormClient";

type Customer = { id: number; name: string };
type ProjectType = { id: number; name: string };

export default function NewProjectPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [hasQcTemplate, setHasQcTemplate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // ✅ مشتری‌ها = Party (kind=CUSTOMER)
        const cRes = await fetch("/api/parties?kind=CUSTOMER&take=300", {
          cache: "no-store",
        });
        const cJson = await cRes.json();

        const customers: Customer[] = (Array.isArray(cJson) ? cJson : [])
          .map((p: any) => ({
            id: Number(p.id),            // ✅ PartyId واقعی
            name: String(p.name).trim(), // ✅ نام واقعی مشتری
          }))
          .filter((x) => x.id > 0 && x.name);

        // نوع پروژه‌ها
        const ptRes = await fetch("/api/project-types?take=200", {
          cache: "no-store",
        });
        const ptJson = await ptRes.json();
        const projectTypes: ProjectType[] = (ptJson?.items || ptJson || []).map(
          (x: any) => ({
            id: Number(x.id),
            name: String(x.name || "—"),
          })
        );

        // QC Template check
        const qcRes = await fetch("/api/qc-templates?take=1", {
          cache: "no-store",
        });
        const qcJson = await qcRes.json();
        const qcCount = Array.isArray(qcJson?.items)
          ? qcJson.items.length
          : Array.isArray(qcJson)
          ? qcJson.length
          : 0;

        if (!alive) return;

        setCustomers(customers);
        setProjectTypes(projectTypes);
        setHasQcTemplate(qcCount > 0);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "خطا در دریافت اطلاعات اولیه");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const emptyContractors = useMemo(() => [], []);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold">پروژه جدید</h1>
          <p className="text-sm text-zinc-500">
            ویزارد: ابتدا مشتری → سپس نوع سازه و مشخصات پروژه
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border bg-white p-4 text-sm text-zinc-600">
          در حال بارگذاری...
        </div>
      )}

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {!loading && !err && (
        <ProjectFormClient
          customers={customers}          // ✅ Party customers
          contractors={emptyContractors}
          projectTypes={projectTypes}
          hasQcTemplate={hasQcTemplate}
        />
      )}
    </div>
  );
}
