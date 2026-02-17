// app/dashboard/inventory/[id]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const cls = {
  wrap: "max-w-7xl mx-auto px-4 py-6 text-[color:var(--text)]",
  title: "text-xl font-semibold mb-1",
  subtitle: "text-xs text-[color:var(--muted)] mb-6",

  grid2: "grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]",
  card:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 mb-4",
  cardTitle: "text-xs font-medium mb-2",
  pill:
    "inline-flex items-center gap-1 rounded-full bg-[color:var(--surface-soft)] px-2 py-0.5 text-[10px] text-[color:var(--muted)]",

  statValue: "text-2xl font-semibold",
  statLabel: "text-[11px] text-[color:var(--muted)]",

  tableWrap: "overflow-x-auto",
  th: "px-3 py-2 text-right text-[10px] text-[color:var(--muted)] border-b border-[color:var(--line)]",
  td: "px-3 py-2 border-b border-[color:var(--line-soft)] text-xs",

  badgeIn:
    "inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400",
  badgeOut:
    "inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400",

  backBtn:
    "inline-flex items-center gap-1 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-[11px] text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getProductData(productId: number) {
  const product = await prisma.product.findFirst({
    where: { id: productId },
    include: {
      stocks: {
        include: { warehouse: true },
      },
      stockMoves: {
        include: {
          warehouse: true,
          project: true,
        },
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  if (!product) return null;

  const totalQty = product.stocks.reduce(
    (sum, s) => sum + Number(s.quantity),
    0,
  );

  return { product, totalQty };
}

export default async function ProductInventoryPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!productId || Number.isNaN(productId)) {
    notFound();
  }

  const data = await getProductData(productId);

  if (!data) {
    notFound();
  }

  const { product, totalQty } = data;

  return (
    <div className={cls.wrap} dir="rtl">
      {/* هدر */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className={cls.title}>جزئیات موجودی کالا</h1>
          <p className={cls.subtitle}>
            وضعیت موجودی و تاریخچه ورود/خروج برای این کالا در همه انبارها.
          </p>
        </div>

        <a href="/dashboard/inventory" className={cls.backBtn}>
          ← بازگشت به لیست موجودی
        </a>
      </div>

      {/* کارت اطلاعات اصلی کالا */}
      <div className={cls.card}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">{product.name}</div>
            <div className="text-[11px] text-[color:var(--muted)]">
              کد کالا (SKU): {product.sku || "—"}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <div className={cls.statLabel}>موجودی کل</div>
              <div className={cls.statValue}>{totalQty}</div>
            </div>
            <div>
              <div className={cls.statLabel}>واحد</div>
              <div className="text-sm">
                {product.unit ? product.unit : "تعریف نشده"}
              </div>
            </div>
            <div>
              <div className={cls.statLabel}>تعداد انبارهایی که این کالا را دارند</div>
              <div className="text-sm">
                {product.stocks.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* دو ستون: موجودی در انبارها + تاریخچه حرکت‌ها */}
      <div className={cls.grid2}>
        {/* موجودی در انبارها */}
        <div className={cls.card}>
          <div className={cls.cardTitle}>موجودی در انبارها</div>
          {product.stocks.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-[color:var(--muted)]">
              هنوز برای این کالا هیچ موجودی در انباری ثبت نشده است.
            </div>
          ) : (
            <div className={cls.tableWrap}>
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className={cls.th}>انبار</th>
                    <th className={cls.th}>کد انبار</th>
                    <th className={cls.th}>موجودی</th>
                  </tr>
                </thead>
                <tbody>
                  {product.stocks.map((s) => (
                    <tr key={s.id}>
                      <td className={cls.td}>{s.warehouse?.name || "—"}</td>
                      <td className={cls.td}>{s.warehouse?.code || "—"}</td>
                      <td className={cls.td}>{Number(s.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* تاریخچه حرکت‌های انبار برای این کالا */}
        <div className={cls.card}>
          <div className="flex items-center justify-between mb-2">
            <div className={cls.cardTitle}>تاریخچه ورود/خروج این کالا</div>
            <span className={cls.pill}>
              {product.stockMoves.length} حرکت آخر
            </span>
          </div>

          {product.stockMoves.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-[color:var(--muted)]">
              تا الان هیچ حرکت انباری برای این کالا ثبت نشده است.
            </div>
          ) : (
            <div className={cls.tableWrap}>
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className={cls.th}>تاریخ</th>
                    <th className={cls.th}>انبار</th>
                    <th className={cls.th}>جهت</th>
                    <th className={cls.th}>مقدار</th>
                    <th className={cls.th}>پروژه</th>
                    <th className={cls.th}>مرجع / توضیح</th>
                  </tr>
                </thead>
                <tbody>
                  {product.stockMoves.map((m) => {
                    const d = m.date.toISOString();
                    const dateStr = d.split("T")[0];
                    const timeStr = d.split("T")[1].slice(0, 5);
                    const isIn = m.direction === "IN";

                    return (
                      <tr key={m.id}>
                        <td className={cls.td}>
                          <div className="flex flex-col">
                            <span>{dateStr}</span>
                            <span className="text-[10px] text-[color:var(--muted)]">
                              {timeStr}
                            </span>
                          </div>
                        </td>
                        <td className={cls.td}>{m.warehouse?.name || "—"}</td>
                        <td className={cls.td}>
                          <span className={isIn ? cls.badgeIn : cls.badgeOut}>
                            {isIn ? "ورودی" : "خروجی"}
                          </span>
                        </td>
                        <td className={cls.td}>{m.qty}</td>
                        <td className={cls.td}>
                          {m.project ? m.project.code || m.project.title : "—"}
                        </td>
                        <td className={cls.td}>
                          {m.reference || m.note || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
