// app/dashboard/projects/page.tsx
import Link from "next/link";
import ProjectsListClient from "./ProjectsListClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      {/* Header */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">لیست پروژه‌ها</p>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
              پروژه‌ها و کانکس‌ها
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <Link
              href="/dashboard/projects/new"
              className="rounded-2xl bg-indigo-600 text-white px-3 py-2 shadow-sm hover:bg-indigo-700"
            >
              + پروژه جدید
            </Link>
          </div>
        </div>
      </section>

      {/* Client List */}
      <ProjectsListClient />
    </div>
  );
}
