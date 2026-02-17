"use client";

import { toJalali } from "@/lib/date";
import { useEffect, useMemo, useState } from "react";

type VoucherType =
  | "GENERAL"
  | "PURCHASE"
  | "SALE"
  | "EXPENSE"
  | "INCOME"
  | "TRANSFER"
  | "OPENING"
  | "ADJUSTMENT";

type DashboardData = {
  totalIncome: number;
  totalExpense: number;
  projectCount: number;
  vouchersCount: number;
  lastVouchers: Array<{
    id: number;
    date: string;
    refNo: string;
    type: VoucherType;
    totalDebit: number;
    totalCredit: number;
  }>;
  monthlyCashflow: Array<{
    month: string; // "1403-09"
    income: number;
    expense: number;
  }>;
};

type VoucherListItem = {
  id: number;
  date: string;
  refNo: string;
  type: VoucherType;
  projectName: string | null;
  description: string | null;
  totalDebit: number;
  totalCredit: number;
};

type AccountItem = {
  id: number;
  code: string;
  name: string;
  type: string;
};

type TabKey = "dashboard" | "vouchers" | "accounts" | "reports";

const voucherTypeLabel: Record<VoucherType, string> = {
  GENERAL: "سند عمومی",
  PURCHASE: "خرید",
  SALE: "فروش",
  EXPENSE: "هزینه",
  INCOME: "درآمد",
  TRANSFER: "انتقال",
  OPENING: "افتتاحیه",
  ADJUSTMENT: "تعدیلات",
};

function formatCurrency(v: number) {
  return Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(v || 0);
}

function isoDateOnly(iso: string) {
  // اگر "2025-12-23T..." بود -> "2025-12-23"
  if (!iso) return "";
  return iso.slice(0, 10);
}

function parseMoneyInput(s: string) {
  const cleaned = String(s || "").replace(/[,\s]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export default function AccountingPageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const [dashLoading, setDashLoading] = useState(false);
  const [dashData, setDashData] = useState<DashboardData | null>(null);

  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherListItem[]>([]);

  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);

  const [error, setError] = useState<string | null>(null);

  // -------------------------------
  // reload helpers
  // -------------------------------
  const reloadVouchers = async () => {
    setVouchersLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounting/vouchers", { cache: "no-store" });
      if (!res.ok) {
        const txt = await res.text();
        console.error("Vouchers reload failed:", res.status, txt);
        setError("خطا در بارگذاری اسناد حسابداری");
        return;
      }
      const data = (await res.json()) as VoucherListItem[];
      setVouchers(data);
    } catch (e) {
      console.error("Vouchers reload error:", e);
      setError("خطای ارتباط با سرور در اسناد حسابداری");
    } finally {
      setVouchersLoading(false);
    }
  };

  // -------------------------------
  // load dashboard
  // -------------------------------
  useEffect(() => {
    if (activeTab !== "dashboard") return;

    let cancelled = false;
    async function loadDashboard() {
      setDashLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/accounting/dashboard", { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text();
          console.error("Dashboard load failed:", res.status, txt);
          if (!cancelled) setError("خطا در بارگذاری داشبورد حسابداری");
          return;
        }
        const data = (await res.json()) as DashboardData;
        if (!cancelled) setDashData(data);
      } catch (e) {
        console.error("Dashboard load error:", e);
        if (!cancelled) setError("خطای ارتباط با سرور در داشبورد");
      } finally {
        if (!cancelled) setDashLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // -------------------------------
  // load vouchers
  // -------------------------------
  useEffect(() => {
    if (activeTab !== "vouchers") return;
    let cancelled = false;

    async function loadVouchers() {
      setVouchersLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/accounting/vouchers", { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text();
          console.error("Vouchers load failed:", res.status, txt);
          if (!cancelled) setError("خطا در بارگذاری اسناد حسابداری");
          return;
        }
        const data = (await res.json()) as VoucherListItem[];
        if (!cancelled) setVouchers(data);
      } catch (e) {
        console.error("Vouchers load error:", e);
        if (!cancelled) setError("خطای ارتباط با سرور در اسناد حسابداری");
      } finally {
        if (!cancelled) setVouchersLoading(false);
      }
    }

    loadVouchers();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // -------------------------------
  // load accounts
  // -------------------------------
  useEffect(() => {
    if (activeTab !== "accounts") return;

    let cancelled = false;
    async function loadAccounts() {
      setAccountsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/accounting/accounts", { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text();
          console.error("Accounts load failed:", res.status, txt);
          if (!cancelled) setError("خطا در بارگذاری سرفصل‌های حسابداری");
          return;
        }
        const data = (await res.json()) as AccountItem[];
        if (!cancelled) setAccounts(data);
      } catch (e) {
        console.error("Accounts load error:", e);
        if (!cancelled) setError("خطای ارتباط با سرور در سرفصل‌ها");
      } finally {
        if (!cancelled) setAccountsLoading(false);
      }
    }

    loadAccounts();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // -------------------------------
  // create simple voucher (inline form)
  // -------------------------------
  const [createLoading, setCreateLoading] = useState(false);
  const [createDate, setCreateDate] = useState("");
  const [createType, setCreateType] = useState<VoucherType>("GENERAL");
  const [createDescription, setCreateDescription] = useState("");
  const [createAmount, setCreateAmount] = useState("");

  const handleCreateSimpleVoucher = async () => {
    if (!createDate || !createAmount) {
      alert("تاریخ و مبلغ الزامی است");
      return;
    }
    const amount = Number(createAmount.replace(/,/g, ""));
    if (!amount || amount <= 0) {
      alert("مبلغ معتبر وارد کنید");
      return;
    }

    setCreateLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/accounting/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: createDate,
          type: createType,
          description: createDescription || `سند ساده مبلغ ${amount}`,
          items: [
            {
              accountCode: "1000",
              description: "بدهکار",
              debit: amount,
              credit: 0,
            },
            {
              accountCode: "2000",
              description: "بستانکار",
              debit: 0,
              credit: amount,
            },
          ],
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Create voucher failed:", res.status, txt);
        alert("خطا در ثبت سند حسابداری");
        return;
      }

      const created = (await res.json()) as VoucherListItem;

      // اگر همین تب فعاله، در لیست اضافه کن
      setVouchers((prev) => [created, ...prev]);

      setCreateDate("");
      setCreateDescription("");
      setCreateAmount("");
      setCreateType("GENERAL");

      alert("سند با موفقیت ثبت شد");
    } catch (e) {
      console.error("Create voucher error:", e);
      alert("خطای ارتباط در ثبت سند");
    } finally {
      setCreateLoading(false);
    }
  };

  // -------------------------------
  // edit / delete voucher
  // -------------------------------
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRefNo, setEditRefNo] = useState<string>("");
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<VoucherType>("GENERAL");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(""); // optional
  const [editLoading, setEditLoading] = useState(false);

  const openEdit = (v: VoucherListItem) => {
    setEditId(v.id);
    setEditRefNo(v.refNo);
    setEditDate(isoDateOnly(v.date));
    setEditType(v.type);
    setEditDescription(v.description || "");
    // برای سند ساده: totalDebit == totalCredit
    const amount = v.totalDebit || v.totalCredit || 0;
    setEditAmount(amount ? String(amount) : "");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditId(null);
    setEditRefNo("");
    setEditDate("");
    setEditType("GENERAL");
    setEditDescription("");
    setEditAmount("");
    setEditLoading(false);
  };

  const handleDeleteVoucher = async (v: VoucherListItem) => {
    const ok = confirm(`حذف سند شماره ${v.refNo} ؟\nاین عملیات برگشت‌پذیر نیست.`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/accounting/vouchers/${v.id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        console.error("Delete voucher failed:", res.status, txt);
        alert("خطا در حذف سند");
        return;
      }

      // فوری از لیست حذف کن
      setVouchers((prev) => prev.filter((x) => x.id !== v.id));
      alert("سند حذف شد");
    } catch (e) {
      console.error("Delete voucher error:", e);
      alert("خطای ارتباط در حذف سند");
    }
  };

  const handleSaveEdit = async () => {
    if (!editId) return;

    if (!editDate) {
      alert("تاریخ الزامی است");
      return;
    }

    const totalAmount = editAmount ? parseMoneyInput(editAmount) : null;
    if (editAmount && totalAmount === null) {
      alert("مبلغ معتبر وارد کنید");
      return;
    }

    setEditLoading(true);
    try {
      const res = await fetch(`/api/accounting/vouchers/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          type: editType,
          description: editDescription || null,
          totalAmount, // optional
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Edit voucher failed:", res.status, txt);
        alert("خطا در ویرایش سند");
        return;
      }

      // برای محاسبه‌های دقیق totalDebit/totalCredit: رفرش
      await reloadVouchers();

      closeEdit();
      alert("سند ویرایش شد");
    } catch (e) {
      console.error("Edit voucher error:", e);
      alert("خطای ارتباط در ویرایش سند");
    } finally {
      setEditLoading(false);
    }
  };

  const vouchersCountColSpan = 8;

  const voucherTableRows = useMemo(() => vouchers, [vouchers]);

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">ماژول حسابداری</h1>
          <p className="text-xs text-zinc-400 mt-1">
            مدیریت اسناد حسابداری، گزارش هزینه و درآمد پروژه‌ها و جریان نقدی.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-zinc-900 border border-zinc-700 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1 rounded-full ${
              activeTab === "dashboard"
                ? "bg-emerald-600 text-white"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            داشبورد
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vouchers")}
            className={`px-3 py-1 rounded-full ${
              activeTab === "vouchers"
                ? "bg-emerald-600 text-white"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            اسناد حسابداری
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`px-3 py-1 rounded-full ${
              activeTab === "accounts"
                ? "bg-emerald-600 text-white"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            سرفصل‌ها
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1 rounded-full ${
              activeTab === "reports"
                ? "bg-emerald-600 text-white"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            گزارش‌ها
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/50 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-4">
          {dashLoading && <div className="text-xs text-zinc-400">در حال بارگذاری داشبورد...</div>}

          {dashData && (
            <>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">کل درآمد ثبت‌شده</div>
                  <div className="text-lg font-semibold text-emerald-400">
                    {formatCurrency(dashData.totalIncome)} ریال
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">کل هزینه ثبت‌شده</div>
                  <div className="text-lg font-semibold text-red-400">
                    {formatCurrency(dashData.totalExpense)} ریال
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">
                    تعداد پروژه‌های درگیر حسابداری
                  </div>
                  <div className="text-lg font-semibold text-zinc-100">{dashData.projectCount}</div>
                </div>
                <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4">
                  <div className="text-xs text-zinc-400 mb-1">
                    تعداد اسناد حسابداری ثبت‌شده
                  </div>
                  <div className="text-lg font-semibold text-zinc-100">{dashData.vouchersCount}</div>
                </div>
              </div>

              {/* آخرین اسناد */}
              <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-zinc-100">آخرین اسناد حسابداری</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-zinc-200">
                    <thead>
                      <tr className="border-b border-zinc-700/60 text-zinc-400">
                        <th className="py-2 text-right">شماره سند</th>
                        <th className="py-2 text-right">تاریخ</th>
                        <th className="py-2 text-right">نوع</th>
                        <th className="py-2 text-right">بدهکار</th>
                        <th className="py-2 text-right">بستانکار</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashData.lastVouchers.map((v) => (
                        <tr key={v.id} className="border-b border-zinc-800/60">
                          <td className="py-1">{v.refNo}</td>
                          <td className="py-1">{toJalali(v.date)}</td>
                          <td className="py-1">{voucherTypeLabel[v.type]}</td>
                          <td className="py-1 text-emerald-400">{formatCurrency(v.totalDebit)}</td>
                          <td className="py-1 text-red-400">{formatCurrency(v.totalCredit)}</td>
                        </tr>
                      ))}
                      {dashData.lastVouchers.length === 0 && (
                        <tr>
                          <td className="py-2 text-zinc-500" colSpan={5}>
                            هنوز سندی ثبت نشده است.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* VOUCHERS */}
      {activeTab === "vouchers" && (
        <div className="flex flex-col gap-4">
          {/* فرم سریع ثبت سند */}
          <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3">ثبت سریع سند دوبل</h2>

            <div className="grid gap-3 md:grid-cols-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-400">تاریخ سند</label>
                <input
                  type="date"
                  className="rounded-lg bg-zinc-950/60 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-100"
                  value={createDate}
                  onChange={(e) => setCreateDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-400">نوع سند</label>
                <select
                  className="rounded-lg bg-zinc-950/60 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-100"
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value as VoucherType)}
                >
                  {Object.entries(voucherTypeLabel).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-400">مبلغ کل سند</label>
                <input
                  type="text"
                  className="rounded-lg bg-zinc-950/60 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-100 ltr text-left"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                  placeholder="مثلاً 15000000"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-400">توضیح</label>
                <input
                  type="text"
                  className="rounded-lg bg-zinc-950/60 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-100"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="مثلاً دریافت پیش‌پرداخت"
                />
              </div>
            </div>

            <div className="flex justify-end mt-3">
              <button
                type="button"
                disabled={createLoading}
                onClick={handleCreateSimpleVoucher}
                className="px-4 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              >
                {createLoading ? "در حال ثبت..." : "ثبت سند"}
              </button>
            </div>
          </div>

          {/* لیست اسناد */}
          <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-100">لیست اسناد حسابداری</h2>

              <div className="flex items-center gap-2">
                {vouchersLoading && (
                  <span className="text-xs text-zinc-400">در حال بارگذاری اسناد...</span>
                )}
                <button
                  type="button"
                  onClick={reloadVouchers}
                  className="px-3 py-1 rounded-lg text-[11px] bg-zinc-950/60 border border-zinc-700/60 hover:bg-zinc-800"
                >
                  بروزرسانی
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-zinc-200">
                <thead>
                  <tr className="border-b border-zinc-700/60 text-zinc-400">
                    <th className="py-2 text-right">شماره سند</th>
                    <th className="py-2 text-right">تاریخ</th>
                    <th className="py-2 text-right">نوع</th>
                    <th className="py-2 text-right">پروژه</th>
                    <th className="py-2 text-right">شرح</th>
                    <th className="py-2 text-right">بدهکار</th>
                    <th className="py-2 text-right">بستانکار</th>
                    <th className="py-2 text-right">عملیات</th>
                  </tr>
                </thead>

                <tbody>
                  {voucherTableRows.map((v) => (
                    <tr key={v.id} className="border-b border-zinc-800/60">
                      <td className="py-1">{v.refNo}</td>
                      <td className="py-1">{toJalali(v.date)}</td>
                      <td className="py-1">{voucherTypeLabel[v.type]}</td>
                      <td className="py-1">
                        {v.projectName || <span className="text-zinc-500">—</span>}
                      </td>
                      <td className="py-1 max-w-xs truncate">
                        {v.description || <span className="text-zinc-500">—</span>}
                      </td>
                      <td className="py-1 text-emerald-400">{formatCurrency(v.totalDebit)}</td>
                      <td className="py-1 text-red-400">{formatCurrency(v.totalCredit)}</td>

                      <td className="py-1">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(v)}
                            className="px-3 py-1 rounded-lg text-[11px] bg-zinc-950/60 border border-zinc-700/60 hover:bg-zinc-800"
                          >
                            ویرایش
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVoucher(v)}
                            className="px-3 py-1 rounded-lg text-[11px] bg-red-900/30 border border-red-700/50 hover:bg-red-900/50 text-red-200"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {vouchers.length === 0 && !vouchersLoading && (
                    <tr>
                      <td className="py-2 text-zinc-500" colSpan={vouchersCountColSpan}>
                        هنوز هیچ سندی ثبت نشده است.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Modal */}
          {editOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-700/60 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">ویرایش سند</div>
                    <div className="text-xs text-zinc-400 mt-1">
                      سند شماره: {editRefNo || "—"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="text-zinc-300 hover:text-white text-sm"
                    title="بستن"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-400">تاریخ</label>
                    <input
                      type="date"
                      className="rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-2 py-2 text-xs text-zinc-100"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-zinc-400">نوع سند</label>
                    <select
                      className="rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-2 py-2 text-xs text-zinc-100"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as VoucherType)}
                    >
                      {Object.entries(voucherTypeLabel).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-zinc-400">شرح</label>
                    <input
                      type="text"
                      className="rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-2 py-2 text-xs text-zinc-100"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="شرح سند"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-zinc-400">مبلغ کل (اختیاری)</label>
                    <input
                      type="text"
                      className="rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-2 py-2 text-xs text-zinc-100 ltr text-left"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="مثلاً 15000000"
                    />
                    <div className="text-[11px] text-zinc-500">
                      اگر سند ۲ آیتمی نباشد (سند پیچیده)، مبلغ تغییر نمی‌کند و فقط تاریخ/نوع/شرح اصلاح می‌شود.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="px-4 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-200"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    disabled={editLoading}
                    onClick={handleSaveEdit}
                    className="px-4 py-2 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {editLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACCOUNTS */}
      {activeTab === "accounts" && (
        <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-100">سرفصل‌های حسابداری</h2>
            {accountsLoading && (
              <span className="text-xs text-zinc-400">در حال بارگذاری سرفصل‌ها...</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-zinc-200">
              <thead>
                <tr className="border-b border-zinc-700/60 text-zinc-400">
                  <th className="py-2 text-right">کد</th>
                  <th className="py-2 text-right">نام حساب</th>
                  <th className="py-2 text-right">نوع</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-zinc-800/60">
                    <td className="py-1">{a.code}</td>
                    <td className="py-1">{a.name}</td>
                    <td className="py-1">{a.type}</td>
                  </tr>
                ))}
                {accounts.length === 0 && !accountsLoading && (
                  <tr>
                    <td className="py-2 text-zinc-500" colSpan={3}>
                      هنوز سرفصلی ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-zinc-500 mt-3">
            مدیریت ساخت/ویرایش سرفصل‌ها را بعداً در یک صفحهٔ تنظیمات حسابداری اضافه می‌کنیم.
          </p>
        </div>
      )}

      {/* REPORTS */}
      {activeTab === "reports" && (
        <div className="rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4 text-xs text-zinc-300">
          <h2 className="text-sm font-semibold text-zinc-100 mb-3">گزارش‌های حسابداری</h2>
          <p className="mb-2">
            در این نسخه، گزارش سود/زیان پروژه‌ها و روند هزینه/درآمد را از روی اسناد حسابداری تولید می‌کنیم.
            (API‌ آن را در گام بعدی اضافه می‌کنیم)
          </p>
          <ul className="list-disc pr-4 space-y-1 text-zinc-400">
            <li>گزارش هزینه و درآمد هر پروژه</li>
            <li>گزارش جمع هزینه‌ها در بازهٔ زمانی</li>
            <li>نمودار سادهٔ جریان نقدی ماهانه</li>
          </ul>
        </div>
      )}
    </div>
  );
}
