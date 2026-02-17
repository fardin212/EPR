"use client";

import { toJalali } from "@/lib/date";
import JalaliDatePicker from "../../ui/JalaliDatePicker";
import { useEffect, useMemo, useState } from "react";
import ChequesUI from "./ui/ChequesUI";
import { useSearchParams, useRouter } from "next/navigation";

/* ===================== types ===================== */

type TreasuryAccount = { id: number; title: string; type: string; balance?: number };
type Direction = "IN" | "OUT" | "XFER" | "ALL";
type Method = "CASH" | "CARD" | "TRANSFER" | "CHEQUE" | "ALL";
type Party = { id: number; name: string };
type Project = { id: number; title: string };

type TxRow = {
  id: number;
  date: string;
  direction: "IN" | "OUT" | "XFER";
  method: "CASH" | "CARD" | "TRANSFER" | "CHEQUE";
  amount: number;
  fromAccount: { id: number; title: string; type: string } | null;
  toAccount: { id: number; title: string; type: string } | null;
  party: { id: number; name: string } | null;
  project: { id: number; title: string } | null;
  trackingNo: string | null;
  refNo: string | null;
  note: string | null;
  accountingVoucherId: number | null;
};

/* ===================== helpers ===================== */

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function safeArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.items)) return x.items;
  return [];
}

/* ===================== page ===================== */

export default function TreasuryPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<"pay" | "transfer" | "cheques" | "balances">("pay");
  const presetProjectId = searchParams.get("projectId") ?? undefined;

  useEffect(() => {
    const newType = searchParams.get("new");
    if (newType === "payment") setTab("pay");
  }, [searchParams]);

  return (
    <div className="space-y-4">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">خزانه‌داری</h1>
          <p className="text-sm text-zinc-500">
            دریافت، پرداخت، انتقال، مانده حساب و جریان نقدی
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ✅ NEW BUTTON */}
          <button
            onClick={() => router.push("/dashboard/treasury/accounts?new=1")}
            className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
          >
            + افزودن حساب
          </button>

          {/* tabs */}
          <div className="inline-flex rounded-2xl bg-zinc-900 p-1 text-white">
            <button
              className={`px-4 py-2 rounded-2xl ${tab === "pay" ? "bg-emerald-500 text-black" : ""}`}
              onClick={() => setTab("pay")}
            >
              تراکنش
            </button>
            <button
              className={`px-4 py-2 rounded-2xl ${tab === "transfer" ? "bg-emerald-500 text-black" : ""}`}
              onClick={() => setTab("transfer")}
            >
              انتقال
            </button>
            <button
              className={`px-4 py-2 rounded-2xl ${tab === "cheques" ? "bg-emerald-500 text-black" : ""}`}
              onClick={() => setTab("cheques")}
            >
              چک‌ها
            </button>
            <button
              className={`px-4 py-2 rounded-2xl ${tab === "balances" ? "bg-emerald-500 text-black" : ""}`}
              onClick={() => setTab("balances")}
            >
              مانده و گزارش
            </button>
          </div>
        </div>
      </div>

      {tab === "pay" && <TransactionsUI presetProjectId={presetProjectId} />}
      {tab === "transfer" && <TransferUI />}
      {tab === "cheques" && <ChequesUI />}
      {tab === "balances" && <BalancesUI />}
    </div>
  );
}

/* ===================== number helpers ===================== */

// فقط عدد نگه می‌دارد
function keepDigitsOnly(v: string) {
  return (v || "").replace(/[^\d]/g, "");
}

// تبدیل عدد به فرمت هزارگان فارسی
function formatThousandsFa(v: string | number | null | undefined) {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/[^\d]/g, "");
  if (!s) return "";
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
}

/* ================= TRANSACTIONS ================= */

function TransactionsUI({ presetProjectId }: { presetProjectId?: string }) {
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [method, setMethod] = useState("TRANSFER");

  const [amountDigits, setAmountDigits] = useState("");

  const [date, setDate] = useState(() => isoDate(new Date()));
  const [note, setNote] = useState("");

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");

  const [partyId, setPartyId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>(presetProjectId ?? "");
  const [parties, setParties] = useState<Party[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [items, setItems] = useState<TxRow[]>([]);

  // ✅ NEW: حالت ویرایش
  const [editingId, setEditingId] = useState<number | null>(null);
  const isEditing = editingId != null;

  // فیلترهای GET
  const [fFrom, setFFrom] = useState(() => isoDate(addDays(new Date(), -30)));
  const [fTo, setFTo] = useState(() => isoDate(new Date()));
  const [fAccountId, setFAccountId] = useState<string>("all");
  const [fDirection, setFDirection] = useState<Direction>("ALL");
  const [fMethod, setFMethod] = useState<Method>("ALL");
  const [take, setTake] = useState("200");

  useEffect(() => {
    if (presetProjectId && presetProjectId !== projectId) setProjectId(presetProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetProjectId]);

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (fFrom) sp.set("from", fFrom);
    if (fTo) sp.set("to", fTo);
    if (fAccountId !== "all") sp.set("accountId", String(fAccountId));
    if (fDirection !== "ALL") sp.set("direction", fDirection);
    if (fMethod !== "ALL") sp.set("method", fMethod);
    sp.set("take", take || "200");
    return sp.toString();
  }, [fFrom, fTo, fAccountId, fDirection, fMethod, take]);

  async function loadAccounts() {
    const bal = await fetch("/api/treasury/balances?scope=accounts").then((r) => r.json());
    setAccounts(safeArray<TreasuryAccount>(bal));
  }

  async function loadTx() {
    const tx = await fetch(`/api/treasury/payments?${query}`, { cache: "no-store" }).then((r) => r.json());
    setItems(safeArray<TxRow>(tx));
  }

  async function loadParties() {
    const res = await fetch("/api/parties?take=500", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    setParties(safeArray<Party>(data));
  }

  async function loadProjects() {
    const res = await fetch("/api/projects?take=500", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    setProjects(safeArray<Project>(data));
  }

  async function loadAll() {
    await Promise.all([loadAccounts(), loadTx(), loadParties(), loadProjects()]);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearForm() {
    setEditingId(null);
    setDirection("IN");
    setMethod("TRANSFER");
    setAmountDigits("");
    setDate(isoDate(new Date()));
    setNote("");
    setFromAccountId("");
    setToAccountId("");
    setPartyId("");
    setProjectId(presetProjectId ?? "");
  }

  function startEdit(t: TxRow) {
    setEditingId(t.id);

    // direction در دیتابیس ممکنه XFER باشد، ولی این UI مخصوص IN/OUT است
    const dir = t.direction === "OUT" ? "OUT" : "IN";
    setDirection(dir);

    setMethod(t.method);

    setAmountDigits(String(Math.round(Number(t.amount || 0)))); // برای نمایش هزارگان
    setDate(isoDate(new Date(t.date)));

    setNote(t.note || "");

    setPartyId(t.party?.id ? String(t.party.id) : "");
    setProjectId(t.project?.id ? String(t.project.id) : "");

    // حساب‌ها بر اساس جهت
    setFromAccountId(dir === "OUT" ? String(t.fromAccount?.id || "") : "");
    setToAccountId(dir === "IN" ? String(t.toAccount?.id || "") : "");
  }

  async function submit() {
    const amountNum = Number(amountDigits || "0");

    if (!amountDigits || amountNum <= 0) return alert("مبلغ را درست وارد کنید");
    if (direction === "IN" && !toAccountId) return alert("برای دریافت، «واریز به حساب» را انتخاب کنید");
    if (direction === "OUT" && !fromAccountId) return alert("برای پرداخت، «پرداخت از حساب» را انتخاب کنید");

    const payload: any = {
      date,
      direction,
      method,
      amount: amountNum,

      note,
      description: note,

      partyId: partyId ? Number(partyId) : null,
      projectId: projectId ? Number(projectId) : null,

      fromAccountId: direction === "OUT" ? Number(fromAccountId) : null,
      toAccountId: direction === "IN" ? Number(toAccountId) : null,
    };

    const url = isEditing ? `/api/treasury/payments/${editingId}` : "/api/treasury/payments";
    const httpMethod = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method: httpMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    clearForm();
    await loadTx();
  }

  async function removeTx(id: number) {
    const ok = confirm("این تراکنش حذف شود؟");
    if (!ok) return;

    const res = await fetch(`/api/treasury/payments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    await loadTx();
  }

  function resetFilters() {
    setFFrom(isoDate(addDays(new Date(), -30)));
    setFTo(isoDate(new Date()));
    setFAccountId("all");
    setFDirection("ALL");
    setFMethod("ALL");
    setTake("200");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* فرم ثبت/ویرایش */}
      <div className="rounded-3xl border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold">{isEditing ? "ویرایش تراکنش" : "ثبت دریافت/پرداخت"}</h2>
            {isEditing && <p className="text-xs text-zinc-500 mt-1">شناسه: {editingId}</p>}
          </div>

          {isEditing && (
            <button className="btn3" onClick={clearForm}>
              انصراف
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select className="input" value={direction} onChange={(e) => {
            const v = e.target.value as any;
            setDirection(v);
            // پاکسازی حساب سمت مقابل
            if (v === "IN") setFromAccountId("");
            if (v === "OUT") setToAccountId("");
          }}>
            <option value="IN">دریافت</option>
            <option value="OUT">پرداخت</option>
          </select>

          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="TRANSFER">حواله</option>
            <option value="CASH">نقدی</option>
            <option value="CARD">کارت</option>
            <option value="CHEQUE">چک</option>
          </select>
        </div>

        <div className="mt-2">
          <label className="text-xs text-zinc-500">تاریخ</label>
          <div className="mt-1">
            <JalaliDatePicker value={date} onChange={(v) => setDate(v)} />
          </div>
        </div>

        <input
          className="input mt-2"
          placeholder="مبلغ"
          dir="ltr"
          inputMode="numeric"
          value={formatThousandsFa(amountDigits)}
          onChange={(e) => setAmountDigits(keepDigitsOnly(e.target.value))}
        />

        {direction === "IN" && (
          <select className="input mt-2" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
            <option value="">واریز به حساب…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        )}

        {direction === "OUT" && (
          <select className="input mt-2" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
            <option value="">پرداخت از حساب…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        )}

        <select className="input mt-2" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
          <option value="">طرف حساب…</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select className="input mt-2" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">پروژه…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <input className="input mt-2" placeholder="توضیح" value={note} onChange={(e) => setNote(e.target.value)} />

        <button className="mt-3 w-full rounded-2xl bg-emerald-500 px-4 py-2 font-bold" onClick={submit}>
          {isEditing ? "ذخیره تغییرات" : "ثبت"}
        </button>
      </div>

      {/* لیست + فیلتر */}
      <div className="rounded-3xl border bg-white p-4 lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">تراکنش‌ها</h2>
          <div className="flex gap-2">
            <button className="btn2" onClick={loadTx}>
              اعمال فیلتر
            </button>
            <button
              className="btn3"
              onClick={() => {
                resetFilters();
                setTimeout(loadTx, 0);
              }}
            >
              ریست
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="md:col-span-1">
            <label className="text-xs text-zinc-500">از</label>
            <div className="mt-1">
              <JalaliDatePicker value={fFrom} onChange={(v) => setFFrom(v)} />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-zinc-500">تا</label>
            <div className="mt-1">
              <JalaliDatePicker value={fTo} onChange={(v) => setFTo(v)} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-zinc-500">حساب</label>
            <select className="input mt-1" value={fAccountId} onChange={(e) => setFAccountId(e.target.value)}>
              <option value="all">همه حساب‌ها</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-zinc-500">نوع</label>
            <select className="input mt-1" value={fDirection} onChange={(e) => setFDirection(e.target.value as any)}>
              <option value="ALL">همه</option>
              <option value="IN">دریافت</option>
              <option value="OUT">پرداخت</option>
              <option value="XFER">انتقال</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-zinc-500">روش</label>
            <select className="input mt-1" value={fMethod} onChange={(e) => setFMethod(e.target.value as any)}>
              <option value="ALL">همه</option>
              <option value="TRANSFER">حواله</option>
              <option value="CASH">نقدی</option>
              <option value="CARD">کارت</option>
              <option value="CHEQUE">چک</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-zinc-500">تعداد</label>
            <select className="input mt-1" value={take} onChange={(e) => setTake(e.target.value)}>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>

        <div className="overflow-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="text-zinc-500 bg-zinc-50">
              <tr>
                <th className="p-2 text-right">تاریخ</th>
                <th className="p-2 text-right">نوع</th>
                <th className="p-2 text-right">روش</th>
                <th className="p-2 text-right">مبلغ</th>
                <th className="p-2 text-right">حساب</th>
                <th className="p-2 text-right">طرف حساب</th>
                <th className="p-2 text-right">پروژه</th>
                <th className="p-2 text-right">ارجاع</th>
                <th className="p-2 text-right">توضیح</th>
                <th className="p-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-2">{toJalali(t.date)}</td>
                  <td className="p-2">{t.direction === "IN" ? "دریافت" : t.direction === "OUT" ? "پرداخت" : "انتقال"}</td>
                  <td className="p-2">{t.method}</td>
                  <td className="p-2">{Number(t.amount).toLocaleString("fa-IR")}</td>
                  <td className="p-2">{t.fromAccount?.title || t.toAccount?.title || "—"}</td>
                  <td className="p-2">{t.party?.name || "—"}</td>
                  <td className="p-2">{t.project?.title || "—"}</td>
                  <td className="p-2">{t.refNo || t.trackingNo || "—"}</td>
                  <td className="p-2">{t.note || "—"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button className="btnMini" onClick={() => startEdit(t)}>
                        ویرایش
                      </button>
                      <button className="btnMiniDanger" onClick={() => removeTx(t.id)}>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!items.length && (
                <tr>
                  <td className="p-4 text-zinc-500" colSpan={10}>
                    موردی برای نمایش وجود ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e4e4e7;
          padding: 10px 12px;
          border-radius: 16px;
        }
        .btn2 {
          border-radius: 16px;
          padding: 8px 12px;
          background: #111827;
          color: white;
          font-weight: 700;
        }
        .btn3 {
          border-radius: 16px;
          padding: 8px 12px;
          background: #f4f4f5;
          color: #111827;
          font-weight: 700;
          border: 1px solid #e4e4e7;
        }
        .btnMini {
          border-radius: 12px;
          padding: 6px 10px;
          background: #111827;
          color: white;
          font-weight: 800;
          font-size: 12px;
        }
        .btnMiniDanger {
          border-radius: 12px;
          padding: 6px 10px;
          background: #fee2e2;
          color: #991b1b;
          font-weight: 900;
          font-size: 12px;
          border: 1px solid #fecaca;
        }
      `}</style>
    </div>
  );
}

/* ================= TRANSFER ================= */

function TransferUI() {
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");

  const [amountDigits, setAmountDigits] = useState("");

  const [date, setDate] = useState(() => isoDate(new Date()));
  const [note, setNote] = useState("");
  const [createVoucher, setCreateVoucher] = useState(true);

  useEffect(() => {
    fetch("/api/treasury/balances?scope=accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.items || []));
  }, []);

  async function submit() {
    const amountNum = Number(amountDigits || "0");
    if (!amountDigits || amountNum <= 0) return alert("مبلغ را درست وارد کنید");
    if (!fromAccountId || !toAccountId) return alert("حساب مبدا و مقصد را انتخاب کنید");

    const res = await fetch("/api/treasury/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        amount: amountNum,
        fromAccountId: Number(fromAccountId),
        toAccountId: Number(toAccountId),
        note,
        description: note,
        createVoucher,
      }),
    });

    if (!res.ok) return alert(await res.text());

    setAmountDigits("");
    setNote("");
    alert("انتقال ثبت شد.");
  }

  return (
    <div className="rounded-3xl border bg-white p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">انتقال بین حساب‌ها (XFER)</h2>

        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={createVoucher} onChange={(e) => setCreateVoucher(e.target.checked)} />
          ساخت سند حسابداری
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <select className="input" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
          <option value="">از حساب…</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>

        <select className="input" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
          <option value="">به حساب…</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-zinc-500">تاریخ</label>
          <div className="mt-1">
            <JalaliDatePicker value={date} onChange={(v) => setDate(v)} />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500">مبلغ</label>
          <input
            className="input mt-1"
            placeholder="مبلغ"
            dir="ltr"
            inputMode="numeric"
            value={formatThousandsFa(amountDigits)}
            onChange={(e) => setAmountDigits(keepDigitsOnly(e.target.value))}
          />
        </div>
      </div>

      <input className="input" placeholder="توضیح" value={note} onChange={(e) => setNote(e.target.value)} />

      <button className="rounded-2xl bg-emerald-500 px-4 py-2 font-bold" onClick={submit}>
        ثبت انتقال
      </button>
    </div>
  );
}

/* ================= BALANCES ================= */

function BalancesUI() {
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [cashflow, setCashflow] = useState<any>(null);

  useEffect(() => {
    fetch("/api/treasury/balances?scope=accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.items || []));
    fetch("/api/treasury/cashflow").then((r) => r.json()).then(setCashflow);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-3xl border bg-white p-4">
        <h2 className="font-bold mb-3">مانده حساب‌ها</h2>
        {accounts.map((a) => (
          <div key={a.id} className="flex justify-between border-b py-2">
            <span>{a.title}</span>
            <span className="font-bold">{Number(a.balance).toLocaleString("fa-IR")}</span>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold mb-3">جریان نقدی (۳۰ روز)</h2>
          <a className="text-sm text-emerald-700 underline" href="/dashboard/treasury/pdf" target="_blank" rel="noreferrer">
            PDF گزارش خزانه
          </a>
        </div>

        {cashflow && (
          <>
            <div>ورودی: {cashflow.inflow.toLocaleString("fa-IR")}</div>
            <div>خروجی: {cashflow.outflow.toLocaleString("fa-IR")}</div>
            <div className="font-bold mt-2">خالص: {cashflow.net.toLocaleString("fa-IR")}</div>
          </>
        )}
      </div>
    </div>
  );
}
