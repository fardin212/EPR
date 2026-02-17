import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const cls = {
  wrap: "max-w-7xl mx-auto px-4 py-6 text-[color:var(--text)]",
  title: "text-xl font-semibold mb-1",
  subtitle: "text-xs text-[color:var(--muted)] mb-6",

  grid: "grid gap-4 md:grid-cols-4",
  card: "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4",
  cardTitle: "text-xs font-medium mb-1",
  cardValue: "text-2xl font-semibold",
  small: "text-[11px] text-[color:var(--muted)]",

  // ✅ کارت هشدار
  alertCard:
    "rounded-2xl border border-rose-500/40 bg-rose-50 p-4 text-rose-800",

  tableCard:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 mt-6",
  tableWrap: "overflow-x-auto",
  th: "px-3 py-2 text-right text-[10px] text-[color:var(--muted)] border-b border-[color:var(--line)]",
  td: "px-3 py-2 border-b border-[color:var(--line-soft)] text-xs",

  emptyBox:
    "py-12 text-center text-sm text-[color:var(--muted)] flex flex-col items-center gap-3",
  primaryBtn:
    "inline-flex items-center gap-1 rounded-xl bg-[color:var(--primary)] px-4 py-2 text-xs text-white hover:bg-[color:var(--primary-soft)]",
};

function n(v: any): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

const unitFa: Record<string, string> = {
  PIECE: "عدد",
  KG: "کیلوگرم",
  M: "متر",
  M2: "مترمربع",
  PACK: "بسته",
  ROLL: "کلاف/رول",
};

async function getInventoryStats() {
  const [warehouseCount, productCount] = await Promise.all([
    prisma.warehouse.count(),
    prisma.product.count(),
  ]);

  // موجودی کل سیستم (جمع همه Stock ها)
  const totalStock = await prisma.stock.findMany({
    select: { quantity: true },
  });

  const totalQuantity = totalStock.reduce((sum, s) => sum + n(s.quantity), 0);

  const products = await prisma.product.findMany({
    include: {
      stocks: {
        include: { warehouse: true },
      },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // ✅ محاسبه مجموع موجودی و کمبودها
  let lowStockCount = 0;

  const enrichedProducts = products.map((p) => {
    const total = p.stocks.reduce((sum, s) => sum + n(s.quantity), 0);
    const min = n((p as any).minStock); // minStock در مدل جدید
    const isLow = min > 0 && total < min;

    if (isLow) lowStockCount++;

    return {
      ...p,
      totalQuantity: total,
      minStock: min,
      isLow,
    };
  });

  return {
    warehouseCount,
    productCount,
    totalQuantity,
    lowStockCount,
    products: enrichedProducts,
  };
}

export default async function InventoryDashboard() {
  const stats = await getInventoryStats();

  return (
    <div className={cls.wrap} dir="rtl">
      <h1 className={cls.title}>انبار و موجودی کالاها</h1>
      <p className={cls.subtitle}>
        لیست کالاهای تعریف‌شده در سیستم + موجودی انبارها.
      </p>

      {/* کارت هشدار کمبود موجودی */}
      {stats.lowStockCount > 0 && (
        <div className={cls.alertCard}>
          <div className="text-xs font-medium mb-1">⚠️ کمبود موجودی</div>
          <div className="text-2xl font-semibold">
            {stats.lowStockCount.toLocaleString("fa-IR")}
          </div>
          <div className="text-[11px] opacity-80">
            کالا زیر حداقل موجودی تعریف‌شده
          </div>
        </div>
      )}

      {/* کارت‌های شاخص */}
      <div className={cls.grid}>
        <div className={cls.card}>
          <div className={cls.cardTitle}>تعداد انبارها</div>
          <div className={cls.cardValue}>
            {stats.warehouseCount.toLocaleString("fa-IR")}
          </div>
        </div>

        <div className={cls.card}>
          <div className={cls.cardTitle}>کالاهای تعریف‌شده</div>
          <div className={cls.cardValue}>
            {stats.productCount.toLocaleString("fa-IR")}
          </div>
        </div>

        <div className={cls.card}>
          <div className={cls.cardTitle}>موجودی کل</div>
          <div className={cls.cardValue}>
            {stats.totalQuantity.toLocaleString("fa-IR")}
          </div>
          <div className={cls.small}>جمع کل در همهٔ انبارها</div>
        </div>

        <div className={cls.card}>
          <div className={cls.cardTitle}>عملیات انبار</div>
          <a
            href="/dashboard/inventory/move"
            className="text-[11px] text-[color:var(--primary)] hover:underline"
          >
            ثبت ورود/خروج →
          </a>
        </div>
      </div>

      {/* جدول کالاها */}
      <div className={cls.tableCard}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium">لیست کالاها و موجودی</div>

          <a href="/dashboard/products/new" className={cls.primaryBtn}>
            ➕ تعریف کالای جدید
          </a>
        </div>

        {stats.products.length === 0 ? (
          <div className={cls.emptyBox}>
            <div className="text-3xl">📦</div>
            <div>هیچ کالایی در سیستم تعریف نشده است.</div>
            <a href="/dashboard/products/new" className={cls.primaryBtn}>
              تعریف اولین کالا
            </a>
          </div>
        ) : (
          <div className={cls.tableWrap}>
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className={cls.th}>کالا (SKU)</th>
                  <th className={cls.th}>واحد مصرف</th>
                  <th className={cls.th}>موجودی کل</th>
                  <th className={cls.th}>جزئیات موجودی در انبارها</th>
                </tr>
              </thead>

              <tbody>
                {stats.products.map((p: any) => {
                  return (
                    <tr key={p.id} className={p.isLow ? "bg-rose-50" : undefined}>
                      <td className={cls.td}>
                        <div className="flex flex-col">
                          <span className="font-medium text-[13px]">{p.name}</span>
                          <span className="text-[10px] text-[color:var(--muted)]">
                            {p.sku || "—"}
                          </span>
                        </div>
                      </td>

                      {/* ✅ قبلاً p.unit بود */}
                      <td className={cls.td}>
                        {unitFa[p.stockUnit] || p.stockUnit || "—"}
                      </td>

                      <td className={cls.td}>
                        <div className="flex flex-col">
                          <span>{n(p.totalQuantity).toLocaleString("fa-IR")}</span>
                          {p.isLow && (
                            <span className="text-[10px] text-rose-600">
                              زیر حداقل ({n(p.minStock).toLocaleString("fa-IR")})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={cls.td}>
                        <a
                          href={`/dashboard/inventory/${p.id}`}
                          className="text-[11px] text-[color:var(--primary)] hover:underline"
                        >
                          مشاهده جزئیات →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-3 text-[11px] text-[color:var(--muted)]">
              نکته: هشدار کمبود موجودی فقط زمانی فعال می‌شود که برای کالا «حداقل موجودی» بزرگ‌تر از صفر ثبت شده باشد.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
