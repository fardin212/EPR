import { prisma } from "@/lib/db";
import LeadDetailClient from "./LeadDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function LeadDetailPage(props: Props) {
  const { params } = props;
  const { id } = await params;
  const leadId = Number(id);

  if (!leadId) {
    return (
      <div className="p-6 text-sm text-red-500" dir="rtl">
        شناسه سرنخ نامعتبر است.
      </div>
    );
  }

  const lead = await prisma.crmLead.findUnique({
    where: { id: leadId },
    include: {
      customer: true,
      activities: {
        orderBy: { doneAt: "desc" },
      },
      // اگر بعداً رابطه پروژه / BOM اضافه شد، می‌تونی اینجا include کنی
      // projects: true,
      // bom: true,
    },
  });

  if (!lead) {
    return (
      <div className="p-6 text-sm text-red-500" dir="rtl">
        سرنخ مورد نظر یافت نشد.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <LeadDetailClient lead={JSON.parse(JSON.stringify(lead))} />
    </div>
  );
}
