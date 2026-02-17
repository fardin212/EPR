// app/admin/(dashboard)/orders/page.tsx
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import {
  unstable_noStore as noStore,
  revalidatePath,
} from "next/cache";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { StatusCell, STATUS_LABELS } from "./StatusCell";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "همه وضعیت‌ها" },
  { key: "NEW", label: "جدید" },
  { key: "SEEN", label: "دیده‌شده" },
  { key: "QUOTED", label: "قیمت‌دادیم" },
  { key: "WON", label: "قطعی" },
  { key: "LOST", label: "لغو/از دست‌رفته" },
];

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  } as any).format(d);
}

// --- اکشن حذف سفارش ---
async function deleteOrder(formData: FormData) {
  "use server";

  await requireAdmin();

  const idRaw = formData.get("orderId");
  const id = Number(idRaw);

  if (!id || Number.isNaN(id)) {
    return;
  }

  try {
    await prisma.order.delete({
      where: { id },
    });
  } catch (e) {
    // اگر سفارش قبلاً حذف شده بود یا خطا خورد، فعلاً نادیده می‌گیریم
  }

  // بعد از حذف، صفحه سفارش‌ها رفرش شود
  revalidatePath("/admin/orders");
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  noStore();
  await requireAdmin();

  const statusParam = (searchParams.status || "ALL").toUpperCase();
  const activeFilter =
    STATUS_FILTERS.find((f) => f.key === statusParam) ?? STATUS_FILTERS[0];

  const where =
    activeFilter.key === "ALL"
      ? {}
      : ({
          status: activeFilter.key,
        } satisfies { status: OrderStatus });

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="space-y-5 text-[var(--text)]">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold">سفارش‌ها</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            مدیریت درخواست‌ها و سفارش‌های ثبت‌شده در سایت
          </p>
        </div>

        {/* فیلتر وضعیت بالا */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-[var(--surface)] border border-[var(--line)] p-1">
          {STATUS_FILTERS.map((f) => {
            const active = f.key === activeFilter.key;
            return (
              <Link
                key={f.key}
                href={
                  f.key === "ALL"
                    ? "/admin/orders"
                    : `/admin/orders?status=${f.key}`
                }
                className={[
                  "px-3 py-1.5 rounded-lg text-xs md:text-sm transition whitespace-nowrap",
                  active
                    ? "bg-[var(--brand)] text-white shadow"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]",
                ].join(" ")}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </header>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--soft-bg)] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2 text-right">#</th>
                <th className="px-3 py-2 text-right">مشتری</th>
                <th className="px-3 py-2 text-right">شماره تماس</th>
                <th className="px-3 py-2 text-right">شهر</th>
                <th className="px-3 py-2 text-right">ابعاد</th>
                <th className="px-3 py-2 text-right">عایق / برق / لوله‌کشی</th>
                <th className="px-3 py-2 text-right">توضیحات</th>
                <th className="px-3 py-2 text-right">تاریخ</th>
                <th className="px-3 py-2 text-right">وضعیت</th>
                <th className="px-3 py-2 text-right">حذف</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-[var(--muted)]"
                  >
                    هیچ سفارشی با این وضعیت پیدا نشد.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-[var(--line)] hover:bg-[var(--soft-bg)]/60"
                  >
                    <td className="px-3 py-2 align-top text-xs text-[var(--muted)]">
                      {o.id}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium">
                        {o.name || "بدون نام"}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <a
                        href={`tel:${o.phone}`}
                        className="text-[var(--brand)] hover:underline"
                      >
                        {o.phone}
                      </a>
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      {o.city || "—"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      {o.length || "?"} × {o.width || "?"} ×{" "}
                      {o.height || "?"}
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <div>عایق: {o.insulation || "نامشخص"}</div>
                      <div>برق: {o.electricity || "نامشخص"}</div>
                      <div>لوله‌کشی: {o.plumbing || "نامشخص"}</div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs max-w-xs">
                      <div className="line-clamp-3 leading-relaxed">
                        {o.notes || o.mods || "—"}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-[var(--muted)]">
                      {fmtDate(o.createdAt)}
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <StatusCell orderId={o.id} status={o.status} />
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <form action={deleteOrder}>
                        <input
                          type="hidden"
                          name="orderId"
                          value={o.id}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                        >
                          حذف
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
