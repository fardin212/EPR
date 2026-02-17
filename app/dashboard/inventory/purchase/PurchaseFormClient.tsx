"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import JalaliDatePicker from "@/app/ui/JalaliDatePicker";

/* ===================== Helpers ===================== */
function asPositiveInt(v: any) {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 ? n : null;
}

function toIsoDateString(d: any) {
  if (!d) return new Date().toISOString().slice(0, 10);
  const dt = typeof d === "string" ? new Date(d) : d;
  if (!dt || Number.isNaN(dt.getTime())) return new Date().toISOString().slice(0, 10);
  return dt.toISOString().slice(0, 10);
}

function safeJson(res: Response) {
  return res.json().catch(() => null);
}

function toNumberSafe(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function toFloatSafe(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function normalizePaymentType(method: string) {
  const m = String(method || "").toUpperCase();
  if (m === "POS" || m === "CARD_TO_CARD") return "CARD";
  if (m === "TRANSFER") return "TRANSFER";
  return "CASH";
}

/* ===================== Types ===================== */
type Mode = "new" | "edit";
type PurchasePurpose = "PROJECT" | "STOCK"; // STOCK = تامین موجودی انبار (بدون پروژه)

type Product = {
  id: number;
  sku?: string | null;
  name?: string | null;
  slug?: string | null;
  stockUnit?: string | null;
  unit?: string | null;
  unitName?: string | null;
};

type Party = { id: number; name: string; kind?: string; type?: string };
type Warehouse = { id: number; name: string; title?: string | null };
type Project = { id: number; title: string };

type Account = {
  id: number;
  code?: string | null;
  name?: string | null;
  title?: string | null;
  type?: string | null;
  isActive?: boolean;
  isPosting?: boolean;
};

type TreasuryAccount = {
  id: number;
  title: string;
  type: "BANK" | "CASH" | "PETTY_CASH";
  bankName?: string | null;
  accountNumber?: string | null;
  cardNumber?: string | null;
  iban?: string | null;
  isActive?: boolean;
};

type Row = { productId: number | ""; qty: string; unitPrice: string; note: string };

type InitialData = {
  id?: number | null;
  date?: string | Date | null;
  partyId?: number | null;
  warehouseId?: number | null;
  projectId?: number | null;
  purpose?: PurchasePurpose | null;

  trackingNo?: string | null;
  description?: string | null;

  paidAmount?: number | string;
  hasPayments?: boolean;

  // ✅ freight
  freightAmount?: number | string;
  freightToInventory?: boolean;
  freightAccountId?: number | null;

  rows?: Array<{
    productId: number | "";
    qty: number | string;
    unitPrice: number | string;
    note: string;
  }>;
};

function mapInitialRows(d?: InitialData | null): Row[] {
  if (!d) return [{ productId: "", qty: "1", unitPrice: "0", note: "" }];

  const base =
    Array.isArray(d.rows) && d.rows.length
      ? d.rows
      : (d as any)?.items?.length
      ? (d as any).items.map((x: any) => ({
          productId: x.productId,
          qty: x.qty,
          unitPrice: x.unitPrice,
          note: (x.note ?? x.description ?? "") as any,
        }))
      : null;

  return base?.length
    ? base.map((r: any) => ({
        productId: r.productId,
        qty: String((r as any).qty ?? 0),
        unitPrice: String((r as any).unitPrice ?? 0),
        note: String((r as any).note ?? ""),
      }))
    : [{ productId: "", qty: "1", unitPrice: "0", note: "" }];
}

/* ===================== Component ===================== */
export default function PurchaseFormClient({
  mode,
  initialData,
}: {
  mode: Mode;
  initialData?: InitialData | null;
}) {
  const sp = useSearchParams();

  const isEdit = mode === "edit";
  const purchaseId = initialData?.id ? Number(initialData.id) : null;

  const forcedProjectId = asPositiveInt(sp.get("projectId"));
  const forcedPartyId = asPositiveInt(sp.get("partyId"));

  /* ===================== Form state ===================== */
  const [date, setDate] = useState<string>(toIsoDateString(initialData?.date));
  const [warehouseId, setWarehouseId] = useState<number | "">(initialData?.warehouseId ?? "");
  const [partyId, setPartyId] = useState<number | "">(initialData?.partyId ?? "");
  const [projectId, setProjectId] = useState<number | "">(initialData?.projectId ?? "");
  const [purpose, setPurpose] = useState<PurchasePurpose>(
    (initialData?.purpose as any) || (initialData?.projectId ? "PROJECT" : "STOCK")
  );

  const [trackingNo, setTrackingNo] = useState<string>(initialData?.trackingNo ?? "");
  const [description, setDescription] = useState<string>(initialData?.description ?? "");

  const [rows, setRows] = useState<Row[]>(mapInitialRows(initialData));

  // payment ui
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paidAmount, setPaidAmount] = useState<string>(String(initialData?.paidAmount ?? 0));

  // ✅ انتخاب حساب خزانه (بانک/صندوق)
  const [selectedTreasuryAccountId, setSelectedTreasuryAccountId] = useState<number | "">("");

  // optional payment fields
  const [trackingNoPay, setTrackingNoPay] = useState<string>("");
  const [ibanFrom, setIbanFrom] = useState<string>("");
  const [ibanTo, setIbanTo] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [cardFrom, setCardFrom] = useState<string>("");
  const [cardTo, setCardTo] = useState<string>("");
  const [toAccountText, setToAccountText] = useState<string>("");

  // freight
  const [freightAmount, setFreightAmount] = useState<string>(String(initialData?.freightAmount ?? 0));
  const [freightToInventory, setFreightToInventory] = useState<boolean>(initialData?.freightToInventory ?? true);
  const [freightAccountId, setFreightAccountId] = useState<number | "">(initialData?.freightAccountId ?? "");

  /* ===================== Data state ===================== */
  const [products, setProducts] = useState<Product[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  const [expenseAccounts, setExpenseAccounts] = useState<Account[]>([]);
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>([]);

  /* ===================== UI state ===================== */
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  /* ===================== Initial mapping ===================== */
  useEffect(() => {
    setDate(toIsoDateString(initialData?.date));
    setWarehouseId(initialData?.warehouseId ?? "");
    setPartyId(initialData?.partyId ?? "");
    setProjectId(initialData?.projectId ?? "");

    setTrackingNo(initialData?.trackingNo ?? "");
    setDescription(initialData?.description ?? "");
    setRows(mapInitialRows(initialData));

    setFreightAmount(String(initialData?.freightAmount ?? 0));
    setFreightToInventory(initialData?.freightToInventory ?? true);
    setFreightAccountId(initialData?.freightAccountId ?? "");

    if (!forcedProjectId) {
      const p = initialData?.projectId ? "PROJECT" : "STOCK";
      setPurpose(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  /* ===================== Data fetch ===================== */
  useEffect(() => {
    (async () => {
      try {
        const [pRes, partyRes, wRes, prRes, listRes, accRes, tRes] = await Promise.all([
          fetch("/api/products?take=500", { cache: "no-store" }),
          fetch("/api/parties?take=500", { cache: "no-store" }),
          fetch("/api/warehouses?take=200", { cache: "no-store" }),
          fetch("/api/projects?take=500", { cache: "no-store" }),
          fetch("/api/inventory/purchases?take=80", { cache: "no-store" }),
          fetch("/api/accounting/accounts?take=1500", { cache: "no-store" }),
          fetch("/api/treasury/accounts", { cache: "no-store" }),
        ]);

        const p = await safeJson(pRes);
        const party = await safeJson(partyRes);
        const w = await safeJson(wRes);
        const pr = await safeJson(prRes);
        const list = await safeJson(listRes);
        const acc = await safeJson(accRes);
        const t = await safeJson(tRes);

        setProducts(Array.isArray(p) ? p : p?.items || p?.data || []);
        setParties(Array.isArray(party) ? party : party?.items || party?.data || []);
        setWarehouses(Array.isArray(w) ? w : w?.items || w?.data || []);
        setProjects(Array.isArray(pr) ? pr : pr?.items || pr?.data || []);
        setPurchases(Array.isArray(list) ? list : list?.items || list?.data || []);

        const accounts: Account[] = Array.isArray(acc) ? acc : acc?.items || acc?.data || [];
        setExpenseAccounts(accounts.filter((a) => (a.type || "").toUpperCase().includes("EXP")));

        // ✅ خزانه/بانک/صندوق از API خزانه
        setTreasuryAccounts(Array.isArray(t) ? t : t?.items || t?.data || []);
      } catch (e: any) {
        // silent
      }
    })();
  }, []);

  /* ===================== Derived ===================== */
  const projectLocked = Boolean(forcedProjectId);
  const partyLocked = Boolean(forcedPartyId);

  const isProjectPurpose = purpose === "PROJECT";
  const isStockPurpose = purpose === "STOCK";

  function productById(id: number | "") {
    if (!id) return null;
    return products.find((p) => p.id === id) || null;
  }

  function productUnitValue(productId: number) {
    const p = productById(productId);
    return p?.stockUnit || p?.unit || p?.unitName || null;
  }

  const itemsTotal = useMemo(() => {
    return rows.reduce((sum, r) => {
      if (!r.productId) return sum;
      const qty = toFloatSafe(r.qty, 0);
      const unitPrice = toNumberSafe(r.unitPrice, 0);
      return sum + qty * unitPrice;
    }, 0);
  }, [rows]);

  const freight = useMemo(() => toNumberSafe(freightAmount, 0), [freightAmount]);
  const grandTotal = useMemo(() => itemsTotal + freight, [itemsTotal, freight]);

  const paid = useMemo(() => toNumberSafe(paidAmount, 0), [paidAmount]);
  const remaining = useMemo(() => Math.max(grandTotal - paid, 0), [grandTotal, paid]);

  /* ===================== Actions ===================== */
  function addRow() {
    setRows((prev) => [...prev, { productId: "", qty: "1", unitPrice: "0", note: "" }]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function setRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!warehouseId) {
      setErr("انتخاب انبار الزامی است.");
      return;
    }
    if (!partyId) {
      setErr("انتخاب تامین‌کننده الزامی است.");
      return;
    }

    const cleanItems = rows.filter((r) => r.productId && toFloatSafe(r.qty, 0) > 0);
    if (!cleanItems.length) {
      setErr("حداقل یک آیتم معتبر وارد کنید.");
      return;
    }

    const effectiveProjectId = projectLocked
      ? forcedProjectId
      : isStockPurpose
      ? null
      : projectId
      ? Number(projectId)
      : null;

    if (!effectiveProjectId && isProjectPurpose) {
      setErr("برای خرید پروژه‌ای، انتخاب پروژه الزامی است. (یا حالت «تأمین موجودی انبار» را فعال کنید)");
      return;
    }

    // ✅ اگر پرداخت داریم باید حساب خزانه انتخاب شود
    if (paid > 0 && !selectedTreasuryAccountId) {
      setErr("برای ثبت پرداخت، انتخاب حساب پرداخت (صندوق/بانک) الزامی است.");
      return;
    }

    const items = cleanItems.map((r) => ({
      productId: Number(r.productId),
      qty: toFloatSafe(r.qty, 0),
      unit: productUnitValue(Number(r.productId)) || null,
      unitPrice: toNumberSafe(r.unitPrice, 0),
      note: r.note || "",
    }));

    const payload: any = {
      date: new Date(date).toISOString(),
      warehouseId: Number(warehouseId),
      partyId: Number(partyId),
      projectId: effectiveProjectId,
      purpose,

      trackingNo: trackingNo || null,
      description: description || null,

      freightAmount: freight,
      freightToInventory,
      freightAccountId: freightAccountId ? Number(freightAccountId) : null,

      items,

      payment: {
        method: normalizePaymentType(paymentMethod || "CASH"),
        amount: paid,
        description: paid > 0 ? "پرداخت خرید" : undefined,

        fromAccountId: selectedTreasuryAccountId ? Number(selectedTreasuryAccountId) : null,

        trackingNo: trackingNoPay || null,
        ibanFrom: ibanFrom || null,
        ibanTo: ibanTo || null,
        bankName: bankName || null,
        cardFrom: cardFrom || null,
        cardTo: cardTo || null,
        toAccountText: toAccountText || null,
      },
    };

    setLoading(true);
    try {
      const url = isEdit ? `/api/inventory/purchases/${purchaseId}` : `/api/inventory/purchases`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const js = await safeJson(res);
      if (!res.ok) {
        setErr(js?.message || js?.error || "ثبت انجام نشد.");
        return;
      }

      setMsg("✅ ثبت شد.");
      if (!isEdit) {
        // reset minimal
        setRows([{ productId: "", qty: "1", unitPrice: "0", note: "" }]);
        setPaidAmount("0");
        setSelectedTreasuryAccountId("");
      }

      const listRes = await fetch("/api/inventory/purchases?take=80", { cache: "no-store" });
      const list = await safeJson(listRes);
      setPurchases(Array.isArray(list) ? list : list?.items || list?.data || []);
    } catch (e: any) {
      setErr(e?.message || "خطای غیرمنتظره");
    } finally {
      setLoading(false);
    }
  }

  async function deletePurchase(id: number) {
    if (!confirm("حذف شود؟")) return;
    setMsg(null);
    setErr(null);

    try {
      const res = await fetch(`/api/inventory/purchases/${id}`, { method: "DELETE" });
      const js = await safeJson(res);
      if (!res.ok) {
        setErr(js?.message || "حذف انجام نشد.");
        return;
      }
      setMsg("✅ خرید حذف شد.");
      const listRes = await fetch("/api/inventory/purchases?take=80", { cache: "no-store" });
      const list = await safeJson(listRes);
      setPurchases(Array.isArray(list) ? list : list?.items || list?.data || []);
    } catch (e: any) {
      setErr(e?.message || "خطای غیرمنتظره");
    }
  }

  /* ===================== Render ===================== */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">{isEdit ? "ویرایش خرید" : "ثبت خرید"}</h1>
          <div className="text-xs text-slate-500 mt-1">
            {forcedProjectId ? `پروژه قفل شده: ${forcedProjectId}` : "خرید می‌تواند پروژه‌ای یا تامین موجودی انبار باشد"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory/purchase" className="rounded-lg border px-3 py-2 text-sm">
            لیست خریدها
          </Link>
        </div>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{err}</div>}
      {msg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 p-3 text-sm">{msg}</div>}

      <form onSubmit={submit} className="rounded-2xl border bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs mb-1 text-slate-600">تاریخ</div>
            <JalaliDatePicker value={date} onChange={(v) => setDate(String(v || ""))} />
          </div>

          <div>
            <div className="text-xs mb-1 text-slate-600">انبار</div>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">انتخاب</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name || w.title || `انبار ${w.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs mb-1 text-slate-600">تامین‌کننده</div>
            <select
              className="w-full rounded-lg border px-3 py-2"
              disabled={partyLocked}
              value={partyLocked ? forcedPartyId || "" : partyId}
              onChange={(e) => setPartyId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">انتخاب</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs mb-1 text-slate-600">هدف خرید</div>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as any)}
              disabled={projectLocked}
            >
              <option value="PROJECT">خرید برای پروژه</option>
              <option value="STOCK">تامین موجودی انبار</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs mb-1 text-slate-600">پروژه</div>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={projectLocked ? forcedProjectId || "" : projectId}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : "")}
              disabled={projectLocked || isStockPurpose}
            >
              <option value="">{isStockPurpose ? "در حالت تامین موجودی، پروژه ندارد" : "انتخاب پروژه"}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs mb-1 text-slate-600">کد رهگیری خرید</div>
            <input className="w-full rounded-lg border px-3 py-2" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} />
          </div>

          <div className="md:col-span-3">
            <div className="text-xs mb-1 text-slate-600">توضیحات</div>
            <input className="w-full rounded-lg border px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        {/* items */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="font-bold">آیتم‌ها</div>
            <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={addRow}>
              + افزودن آیتم
            </button>
          </div>

          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-2 text-right">کالا</th>
                  <th className="p-2 text-right">تعداد</th>
                  <th className="p-2 text-right">قیمت واحد</th>
                  <th className="p-2 text-right">توضیح</th>
                  <th className="p-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 min-w-[260px]">
                      <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={r.productId}
                        onChange={(e) => setRow(idx, { productId: e.target.value ? Number(e.target.value) : "" })}
                      >
                        <option value="">انتخاب کالا</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {(p.sku ? `${p.sku} - ` : "") + (p.name || `کالا ${p.id}`)}
                          </option>
                        ))}
                      </select>
                      {r.productId ? (
                        <div className="text-[11px] text-slate-500 mt-1">
                          واحد: {productUnitValue(Number(r.productId)) || "—"}
                        </div>
                      ) : null}
                    </td>

                    <td className="p-2">
                      <input
                        className="w-full rounded-lg border px-3 py-2"
                        value={r.qty}
                        onChange={(e) => setRow(idx, { qty: e.target.value })}
                        inputMode="decimal"
                        dir="ltr"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        className="w-full rounded-lg border px-3 py-2"
                        value={r.unitPrice}
                        onChange={(e) => setRow(idx, { unitPrice: e.target.value })}
                        inputMode="numeric"
                        dir="ltr"
                      />
                    </td>

                    <td className="p-2">
                      <input className="w-full rounded-lg border px-3 py-2" value={r.note} onChange={(e) => setRow(idx, { note: e.target.value })} />
                    </td>

                    <td className="p-2">
                      <button type="button" className="rounded-lg border px-3 py-2 text-sm text-red-600" onClick={() => removeRow(idx)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* totals */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-xl border bg-slate-50 p-3">
              <div className="text-xs text-slate-500">جمع آیتم‌ها</div>
              <div className="font-extrabold">{itemsTotal.toLocaleString("fa-IR")} ریال</div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3">
              <div className="text-xs text-slate-500">کرایه</div>
              <input
                className="w-full mt-1 rounded-lg border px-3 py-2"
                value={freightAmount}
                onChange={(e) => setFreightAmount(e.target.value)}
                inputMode="numeric"
                dir="ltr"
              />
              <label className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                <input type="checkbox" checked={freightToInventory} onChange={(e) => setFreightToInventory(e.target.checked)} />
                کرایه به بهای تمام‌شده انبار اضافه شود
              </label>

              <div className="mt-2">
                <div className="text-xs mb-1 text-slate-600">حساب هزینه کرایه (اختیاری)</div>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={freightAccountId}
                  onChange={(e) => setFreightAccountId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">انتخاب</option>
                  {expenseAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {(a.code ? `${a.code} - ` : "") + (a.name || a.title || `حساب ${a.id}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3">
              <div className="text-xs text-slate-500">جمع کل</div>
              <div className="font-extrabold">{grandTotal.toLocaleString("fa-IR")} ریال</div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3">
              <div className="text-xs text-slate-500">مانده</div>
              <div className="font-extrabold">{remaining.toLocaleString("fa-IR")} ریال</div>
            </div>
          </div>

          {/* payment */}
          <div className="mt-4 rounded-2xl border p-4">
            <div className="font-bold mb-3">پرداخت</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs mb-1 text-slate-600">روش پرداخت</div>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="CASH">نقدی</option>
                  <option value="POS">پرداخت پوز</option>
                  <option value="CARD_TO_CARD">کارت به کارت</option>
                  <option value="TRANSFER">حواله بانکی</option>
                </select>
                <div className="text-[11px] text-slate-500 mt-1">
                  POS و کارت‌به‌کارت در بک‌اند به CARD نگاشت می‌شوند تا Prisma خطا ندهد.
                </div>
              </div>

              <div>
                <div className="text-xs mb-1 text-slate-600">مبلغ پرداختی</div>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  inputMode="numeric"
                  dir="ltr"
                />
              </div>

              <div>
                <div className="text-xs mb-1 text-slate-600">حساب پرداخت (صندوق/بانک)</div>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={selectedTreasuryAccountId}
                  onChange={(e) => setSelectedTreasuryAccountId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">انتخاب حساب پرداخت</option>
                  {treasuryAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.type === "BANK" ? "بانک" : a.type === "PETTY_CASH" ? "تنخواه" : "صندوق"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-slate-700">جزئیات پرداخت (اختیاری)</summary>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <div className="text-xs mb-1 text-slate-600">کد رهگیری</div>
                  <input className="w-full rounded-lg border px-3 py-2" value={trackingNoPay} onChange={(e) => setTrackingNoPay(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs mb-1 text-slate-600">IBAN از</div>
                  <input className="w-full rounded-lg border px-3 py-2" value={ibanFrom} onChange={(e) => setIbanFrom(e.target.value)} dir="ltr" />
                </div>
                <div>
                  <div className="text-xs mb-1 text-slate-600">IBAN به</div>
                  <input className="w-full rounded-lg border px-3 py-2" value={ibanTo} onChange={(e) => setIbanTo(e.target.value)} dir="ltr" />
                </div>
                <div>
                  <div className="text-xs mb-1 text-slate-600">نام بانک</div>
                  <input className="w-full rounded-lg border px-3 py-2" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs mb-1 text-slate-600">کارت از</div>
                  <input className="w-full rounded-lg border px-3 py-2" value={cardFrom} onChange={(e) => setCardFrom(e.target.value)} dir="ltr" />
                </div>
                <div>
                  <div className="text-xs mb-1 text-slate-600">کارت به</div>
                  <input className="w-full rounded-lg border px-3 py-2" value={cardTo} onChange={(e) => setCardTo(e.target.value)} dir="ltr" />
                </div>
                <div className="md:col-span-3">
                  <div className="text-xs mb-1 text-slate-600">شرح حساب مقصد/توضیح</div>
                  <input className="w-full rounded-lg border px-3 py-2" value={toAccountText} onChange={(e) => setToAccountText(e.target.value)} />
                </div>
              </div>
            </details>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {loading ? "در حال ثبت..." : isEdit ? "ذخیره تغییرات" : "ثبت خرید"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="mt-6 rounded-2xl border bg-white p-4">
        <div className="font-bold mb-3">خریدهای اخیر</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2 text-right">شناسه</th>
                <th className="p-2 text-right">تاریخ</th>
                <th className="p-2 text-right">تامین‌کننده</th>
                <th className="p-2 text-right">انبار</th>
                <th className="p-2 text-right">پروژه</th>
                <th className="p-2 text-right">مبلغ</th>
                <th className="p-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {(purchases?.items || purchases || []).map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.date ? new Date(p.date).toLocaleDateString("fa-IR") : "—"}</td>
                  <td className="p-2">{p.party?.name || p.partyName || "—"}</td>
                  <td className="p-2">{p.warehouse?.name || p.warehouseName || "—"}</td>
                  <td className="p-2">{p.project?.title || "—"}</td>
                  <td className="p-2">{Number(p.totalAmount || p.total || 0).toLocaleString("fa-IR")}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Link className="rounded-lg border px-3 py-2 text-sm" href={`/dashboard/inventory/purchase/${p.id}`}>
                        مشاهده
                      </Link>
                      <Link className="rounded-lg border px-3 py-2 text-sm" href={`/dashboard/inventory/purchase/${p.id}/edit`}>
                        ویرایش
                      </Link>
                      <button className="rounded-lg border px-3 py-2 text-sm text-red-600" onClick={() => deletePurchase(p.id)}>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {(!(purchases?.items || purchases || []).length) && (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={7}>
                    موردی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
