import Link from "next/link";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/authMe";

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

function toJalali(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  try {
    return d.toLocaleDateString("fa-IR");
  } catch {
    return "";
  }
}

function fmt(n: any) {
  const x = Number(n || 0);
  return x.toLocaleString("fa-IR");
}

// واحد دقیق‌تر
function unitLabel(u: any) {
  const v = String(u || "").toUpperCase();
  switch (v) {
    case "PIECE":
      return "عدد";
    case "KG":
      return "کیلوگرم";
    case "G":
      return "گرم";
    case "M":
      return "متر";
    case "M2":
      return "مترمربع";
    case "M3":
      return "مترمکعب";
    case "L":
      return "لیتر";
    case "PACK":
      return "بسته";
    case "ROLL":
      return "رول";
    default:
      return u || "—";
  }
}

function paymentBadge(status: "UNPAID" | "PARTIAL" | "PAID") {
  if (status === "PAID") return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (status === "PARTIAL") return "bg-amber-50 border-amber-200 text-amber-800";
  return "bg-rose-50 border-rose-200 text-rose-700";
}

function paymentLabel(status: "UNPAID" | "PARTIAL" | "PAID") {
  if (status === "PAID") return "تسویه شده";
  if (status === "PARTIAL") return "نیمه‌پرداخت";
  return "پرداخت نشده";
}

export default async function PurchaseDetailsPage(
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const me = await getMeServer();
  const { id: idStr } = await getParams(ctx);
  const id = mustInt(idStr);

  if (!id) {
    return (
      <div className="rounded-xl border bg-white p-6 text-red-600">
        شناسه خرید نامعتبر است.
        <div className="mt-3">
          <Link className="underline" href="/dashboard/inventory/purchase">
            بازگشت به ثبت خرید
          </Link>
        </div>
      </div>
    );
  }

  const v = await prisma.accountingVoucher.findFirst({
    where: { id, companyId: me.companyId, type: "PURCHASE" as any },
    include: {
      party: true,
      project: true,
      warehouse: true as any, // اگر relation دارید (طبق تغییرات قبلی پروژه)
      // ✅ فقط آیتم‌های کالایی
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
      <div className="rounded-xl border bg-white p-6">
        <div className="text-red-600 font-bold">خرید یافت نشد.</div>
        <div className="mt-3">
          <Link className="underline" href="/dashboard/inventory/purchase">
            بازگشت
          </Link>
        </div>
      </div>
    );
  }

  // ✅ اقلام + محاسبات
  const items = (v.items || []).map((it: any) => {
    const qty = Number(it.qty || 0);
    const unitPrice = Number(it.unitPrice || 0);
    const lineTotal = qty * unitPrice;
    return { ...it, _qty: qty, _unitPrice: unitPrice, _lineTotal: lineTotal };
  });

  const itemsTotal = items.reduce((acc: number, it: any) => acc + Number(it._lineTotal || 0), 0);

  // ✅ کرایه حمل (اختیاری)
  const freightAmount = Number((v as any).freightAmount || 0);
  const freightToInventory = Boolean((v as any).freightToInventory);

  // ✅ جمع سند = totalDebit (در AccountingVoucher) => شامل کرایه هم هست
  const voucherTotal = Number((v as any).totalDebit ?? 0);

  // ✅ پرداخت‌شده = جمع TreasuryPayment ها
  const paid = (v.treasuryPayments || []).reduce(
    (acc: number, p: any) => acc + Number(p.amount || 0),
    0
  );

  const remain = Math.max(0, voucherTotal - paid);

  // ✅ وضعیت پرداخت
  const paymentStatus: "UNPAID" | "PARTIAL" | "PAID" =
    paid <= 0 ? "UNPAID" : remain <= 0 ? "PAID" : "PARTIAL";

  // ✅ مغایرت واقعی: جمع سند - (جمع اقلام + کرایه)
  const diff = Math.round((voucherTotal - (itemsTotal + freightAmount)) * 100) / 100;
  const hasDiff = Math.abs(diff) > 0.01;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xl font-bold">
            جزئیات خرید #{(v as any).refNo || String(v.id).padStart(5, "0")}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className={`inline-flex items-center rounded-full border px-2 py-1 ${paymentBadge(paymentStatus)}`}>
              {paymentLabel(paymentStatus)}
            </span>

            {(v as any).warehouse?.name ? (
              <span className="inline-flex items-center rounded-full border px-2 py-1 bg-slate-50">
                انبار: {(v as any).warehouse.name}
              </span>
            ) : null}

            {(v as any).project?.title ? (
              <span className="inline-flex items-center rounded-full border px-2 py-1 bg-slate-50">
                پروژه: {(v as any).project.title}
              </span>
            ) : null}

            {(v as any).party?.name ? (
              <span className="inline-flex items-center rounded-full border px-2 py-1 bg-slate-50">
                تامین‌کننده: {(v as any).party.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/inventory/purchase"
            className="rounded-lg border px-3 py-2 text-sm"
          >
            بازگشت
          </Link>

          <Link
            href={`/dashboard/inventory/purchase/${v.id}/edit`}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white"
          >
            ویرایش خرید
          </Link>
        </div>
      </div>

      {hasDiff && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <div className="font-bold text-amber-800">⚠️ مغایرت مالی</div>
          <div className="mt-1 text-amber-900">
            جمع اقلام: {fmt(itemsTotal)} — کرایه: {fmt(freightAmount)} — جمع سند: {fmt(voucherTotal)} — اختلاف: {fmt(diff)}
          </div>
        </div>
      )}

      {/* خلاصه */}
      <div className="rounded-xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">تاریخ</div>
            <div className="font-semibold">{toJalali((v as any).date as any)}</div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">جمع کالاها</div>
            <div className="font-semibold">{fmt(itemsTotal)}</div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">کرایه حمل</div>
            <div className="font-semibold">{fmt(freightAmount)}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              {freightAmount > 0
                ? freightToInventory
                  ? "✅ افزوده به بهای تمام‌شده موجودی"
                  : "⚠️ ثبت به‌عنوان هزینه حمل"
                : "—"}
            </div>
          </div>

          <div className="rounded-lg border p-3 bg-indigo-50 border-indigo-200">
            <div className="text-xs text-slate-500">جمع کل فاکتور</div>
            <div className="font-semibold">{fmt(voucherTotal)}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">پرداخت‌شده</div>
            <div className="font-semibold">{fmt(paid)}</div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">مانده</div>
            <div className="font-semibold">{fmt(remain)}</div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="text-xs text-slate-500">توضیحات</div>
            <div className="font-semibold">{(v as any).description || "—"}</div>
          </div>
        </div>
      </div>

      {/* اقلام */}
      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 font-bold">اقلام</div>

        {items.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-slate-500">
            برای این خرید هیچ «آیتم کالایی» ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-slate-600">
                  <th className="p-2 text-right">کالا</th>
                  <th className="p-2 text-center">تعداد</th>
                  <th className="p-2 text-center">واحد</th>
                  <th className="p-2 text-center">قیمت واحد</th>
                  <th className="p-2 text-center">جمع</th>
                  <th className="p-2 text-right">یادداشت</th>
                </tr>
              </thead>

              <tbody>
                {items.map((it: any) => (
                  <tr key={it.id} className="border-b">
                    <td className="p-2">
                      {it.product?.sku ? `${it.product.sku} — ` : ""}
                      {it.product?.name || "—"}
                    </td>

                    <td className="p-2 text-center">
                      {it._qty ? it._qty.toLocaleString("fa-IR") : "—"}
                    </td>

                    <td className="p-2 text-center">
                      {/* ✅ واحد دقیق: اول آیتم، بعد purchaseUnit، بعد stockUnit */}
                      {unitLabel(it.unit || it.product?.purchaseUnit || it.product?.stockUnit)}
                    </td>

                    <td className="p-2 text-center">
                      {it._unitPrice ? fmt(it._unitPrice) : "—"}
                    </td>

                    <td className="p-2 text-center">
                      {it._lineTotal ? fmt(it._lineTotal) : "—"}
                    </td>

                    <td className="p-2">{it.description || "—"}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t bg-slate-50">
                  <td className="p-2 font-bold" colSpan={4}>
                    جمع کالاها
                  </td>
                  <td className="p-2 text-center font-bold">{fmt(itemsTotal)}</td>
                  <td className="p-2" />
                </tr>

                {freightAmount > 0 ? (
                  <tr className="border-t bg-slate-50">
                    <td className="p-2 font-bold" colSpan={4}>
                      کرایه حمل
                    </td>
                    <td className="p-2 text-center font-bold">{fmt(freightAmount)}</td>
                    <td className="p-2 text-slate-600 text-xs">
                      {freightToInventory ? "افزوده به موجودی" : "هزینه حمل"}
                    </td>
                  </tr>
                ) : null}

                <tr className="border-t bg-indigo-50">
                  <td className="p-2 font-bold" colSpan={4}>
                    جمع کل فاکتور
                  </td>
                  <td className="p-2 text-center font-bold">{fmt(voucherTotal)}</td>
                  <td className="p-2" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* پرداخت‌ها */}
        <div className="mt-4 rounded-lg border p-3">
          <div className="font-bold mb-2">پرداخت‌ها</div>

          {!v.treasuryPayments || v.treasuryPayments.length === 0 ? (
            <div className="text-slate-500 text-sm">پرداختی ثبت نشده است.</div>
          ) : (
            <ul className="space-y-1 text-sm">
              {v.treasuryPayments.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {p.method} • {toJalali(p.createdAt as any)}
                  </span>
                  <span className="font-semibold">{fmt(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
