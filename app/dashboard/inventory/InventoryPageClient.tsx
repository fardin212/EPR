"use client";

import { useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
};

type Item = {
  id: number;
  name: string;
  sku: string | null;
  unit: string;
  minStock: number;
  currentStock: number;
  category: Category | null;
};

type Props = {
  items: Item[];
  categories: Category[];
};

export default function InventoryPageClient({ items, categories }: Props) {
  const [allItems, setAllItems] = useState<Item[]>(items);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "low">("all");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unit: "",
    minStock: "",
  });
  const [loading, setLoading] = useState(false);

  // آمار سریع
  const stats = useMemo(() => {
    const total = allItems.length;
    const low = allItems.filter((i) => i.currentStock <= i.minStock).length;
    const withStock = allItems.filter((i) => i.currentStock > 0).length;
    return { total, low, withStock };
  }, [allItems]);

  // فیلتر و جستجو
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.sku ?? "").toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === "all" ||
        (item.category && item.category.id === Number(categoryFilter));

      const isLow = item.currentStock <= item.minStock;
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "low"
          ? isLow
          : !isLow;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [allItems, search, categoryFilter, statusFilter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.categoryId || !form.unit) return;

    setLoading(true);
    try {
      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "خطا در ثبت کالا");
        return;
      }

      const newItem: Item = await res.json();
      setAllItems((prev) => [newItem, ...prev]);

      setForm({
        name: "",
        sku: "",
        categoryId: "",
        unit: "",
        minStock: "",
      });
    } catch (err) {
      console.error(err);
      alert("مشکل در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* آمار بالا */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="تعداد کل کالاها"
          value={stats.total}
          description="مجموع آیتم‌های تعریف‌شده در انبار"
        />
        <SummaryCard
          label="کالاهای دارای موجودی"
          value={stats.withStock}
          description="حداقل یک واحد موجودی ثبت شده"
        />
        <SummaryCard
          label="کالاهای در وضعیت کمبود"
          value={stats.low}
          description="موجودی کمتر یا مساوی حداقل تعریف‌شده"
          variant={stats.low > 0 ? "danger" : "normal"}
        />
      </div>

      {/* فرم + جدول */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* فرم افزودن کالا */}
        <div className="xl:col-span-1">
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-1">
              افزودن کالای جدید
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              برای هر نوع پروفیل، ورق، پیچ، رنگ و... یک آیتم جدا تعریف کن تا
              بعداً مصرف هر پروژه دقیق رصد شود.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-200 mb-1">
                  نام کالا
                </label>
                <input
                  className="w-full bg-slate-800/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="مثلاً: پروفیل 8×4، ورق گالوانیزه 0.5، دستگاه جوش..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-200 mb-1">
                  کد / SKU (اختیاری)
                </label>
                <input
                  className="w-full bg-slate-800/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                  value={form.sku}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  placeholder="کد داخلی یا کد انبار"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-200 mb-1">
                  دسته‌بندی
                </label>
                <select
                  className="w-full bg-slate-800/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryId: e.target.value }))
                  }
                  required
                >
                  <option value="">انتخاب دسته…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-200 mb-1">
                    واحد
                  </label>
                  <input
                    className="w-full bg-slate-800/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                    value={form.unit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, unit: e.target.value }))
                    }
                    placeholder="مثلاً: متر، شاخه، عدد، کیلو..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-200 mb-1">
                    حداقل موجودی (اختیاری)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full bg-slate-800/80 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                    value={form.minStock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minStock: e.target.value }))
                    }
                    placeholder="مثلاً: 10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-l from-fuchsia-500 to-purple-500 text-sm font-semibold text-white py-2.5 shadow-lg shadow-purple-500/40 hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "در حال ثبت…" : "ثبت کالای جدید"}
              </button>
            </form>
          </div>
        </div>

        {/* لیست + فیلترها */}
        <div className="xl:col-span-2">
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">
                  لیست کالاها
                </h2>
                <p className="text-xs text-slate-300">
                  با جستجو و فیلتر سریع، آیتم مورد نظر را پیدا کن و وضعیت کمبود را در لحظه ببین.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-200">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-400 ml-1" />
                  <span>کمبود</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-200">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 ml-1" />
                  <span>موجودی کافی</span>
                </div>
              </div>
            </div>

            {/* فیلترها */}
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    className="w-full bg-slate-800/80 border border-white/15 rounded-xl pl-3 pr-10 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                    placeholder="جستجو بر اساس نام یا کد کالا…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">
                    Ctrl + F
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                <select
                  className="flex-1 bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">همه دسته‌ها</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  className="w-32 bg-slate-800/80 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "all" | "ok" | "low")
                  }
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="low">فقط کمبود</option>
                  <option value="ok">فقط کافی</option>
                </select>
              </div>
            </div>

            {/* جدول */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-900/80 text-slate-300 text-xs border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">نام کالا</th>
                    <th className="py-2.5 px-3">کد / SKU</th>
                    <th className="py-2.5 px-3">دسته</th>
                    <th className="py-2.5 px-3">واحد</th>
                    <th className="py-2.5 px-3">موجودی</th>
                    <th className="py-2.5 px-3">حداقل</th>
                    <th className="py-2.5 px-3 text-center">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 px-3 text-center text-slate-400 text-xs"
                      >
                        موردی با این فیلترها پیدا نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => {
                      const isLow = item.currentStock <= item.minStock;
                      return (
                        <tr
                          key={item.id}
                          className={
                            "border-b border-white/5 " +
                            (index % 2 === 0
                              ? "bg-slate-900/40"
                              : "bg-slate-900/20")
                          }
                        >
                          <td className="py-2.5 px-3 text-white">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {item.sku || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {item.category?.name || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200">
                            {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-100">
                            {item.currentStock}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-200">
                            {item.minStock}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex justify-center">
                              <span
                                className={
                                  "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium " +
                                  (isLow
                                    ? "bg-rose-500/20 text-rose-200 border border-rose-500/40"
                                    : "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40")
                                }
                              >
                                <span
                                  className={
                                    "ml-1 inline-block w-1.5 h-1.5 rounded-full " +
                                    (isLow
                                      ? "bg-rose-400"
                                      : "bg-emerald-400")
                                  }
                                />
                                {isLow ? "کمبود" : "مناسب"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* کارت خلاصه آمار بالا */
function SummaryCard({
  label,
  value,
  description,
  variant = "normal",
}: {
  label: string;
  value: number;
  description: string;
  variant?: "normal" | "danger";
}) {
  const isDanger = variant === "danger";
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-[0_18px_45px_rgba(15,23,42,0.85)] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-300">{label}</span>
        {isDanger && value > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-200 border border-rose-400/40">
            نیاز به رسیدگی
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <p className="text-[11px] text-slate-400">{description}</p>
    </div>
  );
}
