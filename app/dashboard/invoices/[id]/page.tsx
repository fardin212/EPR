import { getMeServer } from "@/lib/authMe";
import InvoiceViewClient from "./InvoiceViewClient";

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await getMeServer();

  const { id } = await params;
  const invoiceId = Number(id);

  if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
    // می‌تونی notFound() هم بزنی
    return <div className="p-4">شناسه فاکتور نامعتبر است</div>;
  }

  return <InvoiceViewClient id={invoiceId} />;
}
