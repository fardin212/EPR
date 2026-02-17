import { prisma } from "@/lib/db";
import CustomerDetailClient from "./CustomerDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage(props: Props) {
  const { params } = props;
  const { id } = await params;
  const customerId = Number(id);

  if (!customerId) {
    return (
      <div className="p-6 text-sm text-red-500" dir="rtl">
        شناسه مشتری نامعتبر است.
      </div>
    );
  }

  const customer = await prisma.crmCustomer.findUnique({
    where: { id: customerId },
    include: {
      leads: true,
      activities: {
        orderBy: { doneAt: "desc" },
      },
    },
  });

  if (!customer) {
    return (
      <div className="p-6 text-sm text-red-500" dir="rtl">
        مشتری مورد نظر یافت نشد.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <CustomerDetailClient customer={JSON.parse(JSON.stringify(customer))} />
    </div>
  );
}
