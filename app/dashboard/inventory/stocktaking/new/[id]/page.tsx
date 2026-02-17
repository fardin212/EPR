"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Item = {
  id: number;
  productId: number;
  warehouseId: number;
  systemQty: number;
  countedQty: number;
  diffQty: number;
  note: string | null;
  product: {
    name: string;
    sku: string | null;
    unit: string;
  };
  warehouse: {
    name: string;
    code: string;
  };
};

type Session = {
  id: number;
  title: string;
  date: string;
  status: string;
  note: string | null;
  items: Item[];
};

const cls = {
  wrap: "max-w-7xl mx-auto px-4 py-6 text-[color:var(--text)]",
  title: "text-xl font-semibold mb-1",
  subtitle: "text-xs text-[color:var(--muted)] mb-4",
  card:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 mb-4",
  label: "block text-[11px] mb-1",
  input:
    "w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)]",
  textarea:
    "w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)] resize-y",
  chip:
    "inline-flex items-center rounded-full bg-[color:var(--surface-soft)] px-2 py-0.5 text-[10px] text-[color:var(--muted)]",
  primaryBtn:
    "inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-5 py-2 text-xs font-medium text-white hover:bg-[color:var(--primary-soft)] transition disabled:opacity-60 disabled:cursor-not-allowed",
  secondaryBtn:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-4 py-2 text-xs text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]",
  smallBtn:
    "inline-flex items-center justify-center rounded-full border border-[color:var(--line-soft)] bg-[color:var(--surface-soft)] px-3 py-1 text-[10px] text-[color:var(--muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]",
  alertError:
    "mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100",
  alertSuccess:
    "mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100",
  tableHead:
    "px-2 py-2 text-right text-[10px] text-[color:var(--muted)] border-b border-[color:var(--line)]",
  tableCell:
    "px-2 py-1.5 border-b border-[color:var(--line-soft)] text-[11px] align-middle",
};

const jalaliFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "short",
});

export default function StockTakingSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [filterWarehouse, setFilterWarehouse] = useState<string>("ALL");
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stocktaking/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "خطا در دریافت اطلاعات جلسه.");
        } else {
          setSession(data);
        }
      } catch (err) {
        console.error(err);
        setError("خطا در ارتباط با سرور.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const warehouses = useMemo(() => {
    if (!session) return [];
    const map = new Map<number, { id: number; name: string; code: string }>();
    session.items.forEach((it) =>
      map.set(it.warehouseId, {
        id: it.warehouseId,
        name: it.warehouse.name,
        code: it.warehouse.code,
      }),
    );
    return Array.from(map.values());
  }, [session]);

  const filteredItems = useMemo(() => {
    if (!session) return [];
    return session.items.filter((it) => {
      if (
        filterWarehouse !== "ALL" &&
        String(it.warehouseId) !== filterWarehouse
      ) {
        return false;
      }
      if (onlyDiff && Math.abs(it.diffQty) < 1e-9) {
        return false;
      }
      if (search.trim()) {
        const term = search.trim().toLowerCase();
        const hay =
          (it.product.name || "") +
          " " +
          (it.product.sku || "") +
          " " +
          (it.warehouse.name || "") +
          " " +
          (it.warehouse.code || "");
        if (!hay.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [session, filterWarehouse, onlyDiff, search]);

  const summary = useMemo(() => {
    if (!session) return { plus: 0, minus: 0, linesWithDiff: 0 };
    let plus = 0;
    let minus = 0;
    let linesWithDiff = 0;
    session.items.forEach((it) => {
      if (Math.abs(it.diffQty) > 1e-9) {
        linesWithDiff += 1;
        if (it.diffQty > 0) plus += it.diffQty;
        else minus += it.diffQty;
      }
    });
    return { plus, minus, linesWithDiff };
  }, [session]);

  function updateItem(id: number, patch: Partial<Item>) {
    setSession((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) =>
              it.id === id
                ? {
                    ...it,
                    ...patch,
                    diffQty:
                      patch.countedQty !== undefined
                        ? Number(patch.countedQty) - it.systemQty
                        : it.diffQty,
                  }
                : it,
            ),
          }
        : prev,
    );
  }

  async function handleSave(closeAfter: boolean) {
    if (!session) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        status: closeAfter ? "CLOSED" : session.status,
        items: session.items.map((it) => ({
          id: it.id,
          countedQty: Number(it.countedQty),
          note: it.note ?? undefined,
        })),
      };

      const res = await fetch(`/api/stocktaking/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error || "خطا در ذخیره شمارش انبارگردانی. دوباره تلاش کنید.",
        );
      } else {
        setSuccess(
          closeAfter
            ? "شمارش ذخیره شد و جلسه انبارگردانی بسته شد."
            : "شمارش انبارگردانی ذخیره شد.",
        );
        if (closeAfter) {
          setSession((prev) => (prev ? { ...prev, status: "CLOSED" } : prev));
        }
      }
    } catch (err) {
      console.error(err);
      setError("خطای غیرمنتظره در ارتباط با سرور.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={cls.wrap}>
        <div className="text-xs text-[color:var(--muted)]">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={cls.wrap}>
        <div className={cls.alertError}>
          جلسه انبارگردانی پیدا نشد یا خطایی رخ داد.
        </div>
      </div>
    );
  }

  const jalaliDate = jalaliFormatter.format(new Date(session.date));

  return (
    <div className={cls.wrap} dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className={cls.title}>انبارگردانی: {session.title}</h1>
          <p className={cls.subtitle}>
            تاریخ جلسه: {jalaliDate} ({session.date.slice(0, 10)}) — وضعیت:{" "}
            <span
              className={
                session.status === "CLOSED"
                  ? "text-emerald-300"
                  : "text-amber-300"
              }
            >
              {session.status === "CLOSED" ? "بسته‌شده" : "باز"}
            </span>
          </p>
        </div>

        <button
          type="button"
          className={cls.secondaryBtn}
          onClick={() => router.push("/dashboard/inventory/stocktaking")}
        >
          ← بازگشت به لیست
        </button>
      </div>

      {/* خلاصه اختلاف‌ها */}
      <div className="grid gap-3 md:grid-cols-3 mb-4">
        <div className={cls.card}>
          <div className="text-[11px] text-[color:var(--muted)] mb-1">
            تعداد اقلام با اختلاف
          </div>
          <div className="text-lg font-semibold">{summary.linesWithDiff}</div>
        </div>
        <div className={cls.card}>
          <div className="text-[11px] text-[color:var(--muted)] mb-1">
            مجموع اضافه موجودی (کالاهای مازاد)
          </div>
          <div className="text-lg font-semibold text-emerald-300">
            {summary.plus}
          </div>
        </div>
        <div className={cls.card}>
          <div className="text-[11px] text-[color:var(--muted)] mb-1">
            مجموع کسری موجودی (کالاهای کمبود)
          </div>
          <div className="text-lg font-semibold text-rose-300">
            {summary.minus}
          </div>
        </div>
      </div>

      {/* فیلترها */}
      <div className={cls.card}>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={cls.label}>انبار:</span>
            <select
              className={cls.input}
              style={{ width: "200px" }}
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
            >
              <option value="ALL">همه انبارها</option>
              {warehouses.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              className="h-3 w-3"
              checked={onlyDiff}
              onChange={(e) => setOnlyDiff(e.target.checked)}
            />
            فقط اقلام دارای اختلاف
          </label>

          <div className="flex items-center gap-2">
            <span className={cls.label}>جستجو:</span>
            <input
              className={cls.input}
              style={{ width: "220px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="نام کالا، کد، انبار..."
            />
          </div>
        </div>

        {/* جدول اقلام */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr>
                <th className={cls.tableHead}>کالا</th>
                <th className={cls.tableHead}>انبار</th>
                <th className={cls.tableHead}>موجودی سیستمی</th>
                <th className={cls.tableHead}>موجودی شمارش‌شده</th>
                <th className={cls.tableHead}>اختلاف</th>
                <th className={cls.tableHead}>یادداشت</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((it) => (
                <tr key={it.id}>
                  <td className={cls.tableCell}>
                    <div className="flex flex-col">
                      <span className="font-medium text-[12px]">
                        {it.product.name}
                      </span>
                      <span className="text-[10px] text-[color:var(--muted)]">
                        {it.product.sku ? `SKU: ${it.product.sku}` : ""}
                      </span>
                    </div>
                  </td>
                  <td className={cls.tableCell}>
                    <div className="flex flex-col">
                      <span>{it.warehouse.name}</span>
                      <span className="text-[10px] text-[color:var(--muted)]">
                        {it.warehouse.code}
                      </span>
                    </div>
                  </td>
                  <td className={cls.tableCell}>{it.systemQty}</td>
                  <td className={cls.tableCell}>
                    <input
                      className={cls.input}
                      value={it.countedQty}
                      onChange={(e) =>
                        updateItem(it.id, {
                          countedQty: Number(e.target.value || "0"),
                        })
                      }
                      disabled={session.status === "CLOSED"}
                    />
                  </td>
                  <td className={cls.tableCell}>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                        it.diffQty > 0
                          ? "bg-emerald-500/10 text-emerald-300"
                          : it.diffQty < 0
                            ? "bg-rose-500/10 text-rose-300"
                            : "bg-[color:var(--surface-soft)] text-[color:var(--muted)]"
                      }`}
                    >
                      {it.diffQty}
                    </span>
                  </td>
                  <td className={cls.tableCell}>
                    <textarea
                      className={cls.textarea}
                      rows={1}
                      value={it.note || ""}
                      onChange={(e) =>
                        updateItem(it.id, { note: e.target.value })
                      }
                      disabled={session.status === "CLOSED"}
                    />
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-[12px] text-[color:var(--muted)]"
                  >
                    هیچ ردیفی مطابق فیلتر فعلی پیدا نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* دکمه‌های ذخیره */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={cls.primaryBtn}
            disabled={saving || session.status === "CLOSED"}
            onClick={() => handleSave(false)}
          >
            {saving ? "در حال ذخیره..." : "ذخیره شمارش"}
          </button>

          <button
            type="button"
            className={cls.smallBtn}
            disabled={saving || session.status === "CLOSED"}
            onClick={() => handleSave(true)}
          >
            ذخیره و بستن جلسه
          </button>

          {session.status === "CLOSED" && (
            <span className="text-[10px] text-[color:var(--muted)]">
              این جلسه بسته شده است؛ برای تغییر مقادیر باید دوباره باز شود
              (با یک PATCH دیگر به API، که در صورت نیاز اضافه می‌کنیم).
            </span>
          )}
        </div>

        {error && <div className={cls.alertError}>{error}</div>}
        {success && <div className={cls.alertSuccess}>{success}</div>}
      </div>
    </div>
  );
}
