import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import InvoicePrint from "./InvoicePrint";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;           // ✅ unwrap params
  const invoiceId = Number(id);
  if (!invoiceId) return notFound();

  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      party: true,
      items: true, // اگر اسم رلیشن فرق دارد اصلاح کن
    },
  });

  if (!inv) return notFound();

  const items = inv.items.map((it: any) => ({
    title: it.title ?? it.description ?? it.name ?? "آیتم",
    qty: Number(it.qty ?? it.quantity ?? 1),
    unit: it.unit ?? "عدد",
    unitPriceToman: Number(it.unitPrice ?? it.price ?? 0),
  }));

  const specs =
    inv.specsJson ? (JSON.parse(inv.specsJson) as Array<{ label: string; value: string }>) : [];

  return (
    <InvoicePrint
      docType={inv.docType === "PREINVOICE" ? "PREINVOICE" : "INVOICE"}
      docNo={inv.docNo}
      date={String(inv.date).slice(0, 10)}
      customerName={inv.party?.name ?? inv.customerName ?? "—"}
      customerMobile={inv.party?.phone ?? inv.customerMobile}
      customerPhone={inv.party?.phone2 ?? inv.customerPhone}
      customerAddress={inv.party?.address ?? inv.customerAddress}
      specs={specs}
      items={items}
      discountToman={Number(inv.discount ?? 0)}
      shippingToman={Number(inv.shipping ?? 0)}
      taxToman={Number(inv.tax ?? 0)}
    />
  );
}
