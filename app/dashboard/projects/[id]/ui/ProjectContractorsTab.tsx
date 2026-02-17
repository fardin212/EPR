import ProjectContractorsCard from "./ProjectContractorsCard";

export default async function ProjectContractorsTab({ projectId }: { projectId: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-lg font-extrabold">پیمانکاران</div>

          <div className="flex flex-wrap gap-2">
            {/* ✅ افزودن/مدیریت پیمانکار (گزارش مدیریت) */}
            <a
              href={`/dashboard/management/reports/contractors?projectId=${projectId}&new=1`}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm text-white"
            >
              افزودن پیمانکار / قرارداد
            </a>

            <a
              href={`/dashboard/management/reports/contractors?projectId=${projectId}`}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              مشاهده در مدیریت
            </a>
          </div>
        </div>

        {/* ✅ کارت کامل: انتخاب پیمانکار + ثبت قرارداد + ویرایش/حذف */}
        <ProjectContractorsCard projectId={projectId} />
      </div>
    </div>
  );
}
