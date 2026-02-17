"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type TreasuryAccount = {
  id: number;
  title: string;
  type: "CASH" | "BANK";
  bankName?: string | null;
  accountNo?: string | null;
  isActive: boolean;
};

export default function TreasuryAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<TreasuryAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"CASH" | "BANK">("CASH");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [isActive, setIsActive] = useState(true);

  const isEditing = editingId !== null;

  async function load() {
    setLoading(true);
    const res = await fetch("/api/treasury/accounts", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    setItems(Array.isArray(data) ? data : data?.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // اگر از خزانه با ?new=1 آمد
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      clearForm();
    }
  }, [searchParams]);

  function clearForm() {
    setEditingId(null);
    setTitle("");
    setType("CASH");
    setBankName("");
    setAccountNo("");
    setIsActive(true);
  }

  function startEdit(a: TreasuryAccount) {
    setEditingId(a.id);
    setTitle(a.title);
    setType(a.type);
    setBankName(a.bankName || "");
    setAccountNo(a.accountNo || "");
    setIsActive(a.isActive);
  }

  async function submit() {
    if (!title.trim()) return alert("عنوان حساب الزامی است");

    const payload = {
      title: title.trim(),
      type,
      bankName: type === "BANK" ? bankName || null : null,
      accountNo: type === "BANK" ? accountNo || null : null,
      isActive,
    };

    const res = await fetch(
      isEditing ? `/api/treasury/accounts/${editingId}` : "/api/treasury/accounts",
      {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    clearForm();
    await load();
  }

  async function remove(id: number) {
    const ok = confirm("این حساب حذف شود؟");
    if (!ok) return;

    const res = await fetch(`/api/treasury/accounts/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    await load();
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">حساب‌های خزانه</h1>
          <p className="text-sm text-zinc-500">
            تعریف صندوق، بانک و حساب‌های مالی کارگاه
          </p>
        </div>

        <button
          className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white"
          onClick={() => router.push("/dashboard/treasury")}
        >
          بازگشت به خزانه‌داری
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* form */}
        <div className="rounded-3xl border bg-white p-4 space-y-2">
          <h2 className="font-bold">
            {isEditing ? "ویرایش حساب" : "افزودن حساب جدید"}
          </h2>

          <input
            className="input"
            placeholder="عنوان حساب (مثلاً صندوق کارگاه)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="CASH">صندوق (نقدی)</option>
            <option value="BANK">بانک</option>
          </select>

          {type === "BANK" && (
            <>
              <input
                className="input"
                placeholder="نام بانک"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <input
                className="input"
                placeholder="شماره حساب / شبا"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
              />
            </>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            حساب فعال باشد
          </label>

          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2 font-bold"
              onClick={submit}
            >
              {isEditing ? "ذخیره تغییرات" : "ثبت حساب"}
            </button>

            {isEditing && (
              <button
                className="flex-1 rounded-2xl bg-zinc-100 px-4 py-2 font-bold"
                onClick={clearForm}
              >
                انصراف
              </button>
            )}
          </div>
        </div>

        {/* list */}
        <div className="rounded-3xl border bg-white p-4 lg:col-span-2">
          <h2 className="font-bold mb-3">لیست حساب‌ها</h2>

          {loading ? (
            <div className="text-sm text-zinc-500">در حال بارگذاری…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="p-2 text-right">عنوان</th>
                  <th className="p-2 text-right">نوع</th>
                  <th className="p-2 text-right">بانک</th>
                  <th className="p-2 text-right">وضعیت</th>
                  <th className="p-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{a.title}</td>
                    <td className="p-2">
                      {a.type === "CASH" ? "صندوق" : "بانک"}
                    </td>
                    <td className="p-2">{a.bankName || "—"}</td>
                    <td className="p-2">
                      {a.isActive ? "فعال" : "غیرفعال"}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          className="btnMini"
                          onClick={() => startEdit(a)}
                        >
                          ویرایش
                        </button>
                        <button
                          className="btnMiniDanger"
                          onClick={() => remove(a.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!items.length && (
                  <tr>
                    <td colSpan={5} className="p-4 text-zinc-500">
                      حسابی ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* styles */}
      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e4e4e7;
          padding: 10px 12px;
          border-radius: 16px;
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
