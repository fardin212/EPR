import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";
import PurchaseFormClient from "../../PurchaseFormClient";

export const dynamic = "force-dynamic";

async function getParams(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const p: any = (ctx as any).params;
  return typeof p?.then === "function" ? await p : p;
}

function mustInt(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

export default async function PurchaseEditPage(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const me = await getMeServer();
  const { id: idStr } = await getParams(ctx);
  const id = mustInt(idStr);

  if (!id) {
    return (
      <div className="rounded-xl border bg-white p-6 text-red-600">
        شناسه خرید نامعتبر است.
      </div>
    );
  }

  const v = await prisma.accountingVoucher.findFirst({
    where: { id, companyId: me.companyId, type: "PURCHASE" as any },
    include: {
      // ✅ فقط اقلام کالایی + نام محصول
      items: {
        where: { productId: { not: null } },
        orderBy: { id: "asc" },
        include: { product: true },
      },
      treasuryPayments: { orderBy: { id: "desc" } },
    },
  });

  if (!v) {
    return (
      <div className="rounded-xl border bg-white p-6 text-red-600">
        خرید یافت نشد.
      </div>
    );
  }

  // ✅ اگر پرداخت ثبت شده، بهتره فرم ادیت اقلام را قفل کند
  const paid = (v.treasuryPayments || []).reduce(
    (acc: number, p: any) => acc + Number(p.amount || 0),
    0
  );
  const hasPayments = paid > 0;

  // ✅ داده‌ی اولیه برای فرم (طبق فیلدهای واقعی)
  const initialData = {
    id: v.id,
    date: v.date,
    warehouseId: (v as any).warehouseId ?? "",
    partyId: (v as any).partyId ?? "",
    projectId: (v as any).projectId ?? "",
    note: (v as any).description ?? "",
    paymentMethod: ((v.treasuryPayments?.[0]?.method as any) || "CASH") as any,
    paidAmount: paid,
    hasPayments,
    items: (v.items || []).map((it: any) => ({
      id: it.id,
      productId: it.productId,
      title: it.product?.name || "", // ✅ از محصول
      unit: it.unit || it.product?.purchaseUnit || it.product?.stockUnit || "",
      qty: Number(it.qty || 0),
      unitPrice: Number(it.unitPrice || 0),
      note: it.description || "",
    })),
  };

  return <PurchaseFormClient mode="edit" initialData={initialData as any} />;
}
