// app/dashboard/invoices/[id]/edit/page.tsx
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import InvoiceFormClient from "../../_components/InvoiceFormClient";
import { getMeServer } from "@/lib/authMe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mustInt(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

/** Prisma Decimal (decimal.js) -> number */
function decToNumber(v: any, fallback = 0) {
  if (v == null) return fallback;

  // Prisma.Decimal / decimal.js
  if (typeof v === "object") {
    if (typeof v.toNumber === "function") return v.toNumber();
    if (typeof v.toString === "function") {
      const n = Number(v.toString());
      return Number.isFinite(n) ? n : fallback;
    }
  }

  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default async function Page(ctx: any) {
  const params = (ctx?.params?.then ? await ctx.params : ctx?.params) as { id: string };
  const invoiceId = mustInt(params?.id);
  if (!invoiceId) redirect("/dashboard/invoices");

  const me = await getMeServer();
  if (!me) redirect("/login");

  const inv = await prisma.invoice.findFirst({
    where: { id: invoiceId, companyId: me.companyId, deletedAt: null },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      spec: true,
    },
  });

  if (!inv) redirect("/dashboard/invoices");

  return (
    <InvoiceFormClient
      mode="edit"
      invoiceId={inv.id}
      initialData={{
        docType: inv.docType,
        date: inv.date ? inv.date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        dueDate: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : "",

        projectId: inv.projectId ?? null,
        partyId: inv.partyId ?? null,

        customerName: inv.customerName ?? "",
        customerMobile: inv.customerMobile ?? "",
        customerPhone: inv.customerPhone ?? "",
        customerAddress: inv.customerAddress ?? "",

        // اگر این‌ها Decimal باشند هم امن شد:
        discount: decToNumber(inv.discount, 0),
        shipping: decToNumber(inv.shipping, 0),
        tax: decToNumber(inv.tax, 0),

        deliveryTime: inv.deliveryTime ?? "",
        storagePenalty: inv.storagePenalty ?? "",
        transportTerms: inv.transportTerms ?? "",
        description: inv.description ?? "",
        prepayPercent: inv.prepayPercent == null ? 50 : decToNumber(inv.prepayPercent, 50),
        paymentTerms: inv.paymentTerms ?? "الباقی به صورت توافقی",
        notes: inv.notes ?? "",

        // spec معمولاً رشته‌ایه، ولی اگر جایی Decimal داشتی اینجا هم باید decToNumber کنی
        spec: inv.spec
          ? {
              ...inv.spec,
              // اگر area یا هرچیزی Decimal بود:
              // area: inv.spec.area == null ? null : String(inv.spec.area),
            }
          : null,

        // ✅ مهم‌ترین بخش: آیتم‌ها را plain کن
        items: (inv.items || []).map((it) => ({
          title: it.title ?? "",
          qty: decToNumber(it.qty, 1),
          unit: it.unit ?? "عدد",
          unitPrice: decToNumber(it.unitPrice, 0),
          note: it.note ?? "",
        })),
      }}
    />
  );
}
