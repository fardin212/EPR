import { prisma } from "@/lib/db";
import MoveFormClient from "./MoveFormClient";

export const dynamic = "force-dynamic";

const cls = {
  wrap: "max-w-6xl mx-auto px-4 py-6 text-[color:var(--text)]",
  title: "text-xl font-semibold mb-1",
  subtitle: "text-xs text-[color:var(--muted)] mb-4",
};

export default async function InventoryMovePage() {
  const [warehouses, productsRaw] = await Promise.all([
    prisma.warehouse.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        stockUnit: true,
        purchaseUnit: true,
        packSize: true,
      },
    }),
  ]);

  // اگر MoveFormClient هنوز "unit" می‌خواهد، اینجا تبدیل می‌کنیم:
  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.stockUnit, // ✅ سازگار با UI فعلی (اگر unit انتظار دارد)
    stockUnit: p.stockUnit,
    purchaseUnit: p.purchaseUnit,
    packSize: p.packSize == null ? null : Number(p.packSize),
  }));

  return (
    <div className={cls.wrap} dir="rtl">
      <h1 className={cls.title}>ثبت ورود / خروج موجودی</h1>
      <p className={cls.subtitle}>
        ثبت چند ردیف کالا در یک سند انبار، با کنترل موجودی و واحد کالا.
      </p>

      <MoveFormClient warehouses={warehouses} products={products} />
    </div>
  );
}
