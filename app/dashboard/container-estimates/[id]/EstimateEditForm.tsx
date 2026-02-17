"use client";

import { useMemo, useState, useTransition } from "react";
import { updateEstimateAndItemsAction } from "./actions";

type Item = { title: string; amount: string };

type EstimateEditDTO = {
  id: number;
  customerName: string;
  customerPhone: string;
  projectLocation: string | null;
  usageType: string | null;
  deliveryDays: number | null;
  paymentTerms: string | null;
  warrantyTerms: string | null;
  transportTerms: string | null;
  notesForCustomer: string | null;

  // displayItems
  items: Item[];
};

function toDigitsOnly(v: string) {
  // اجازه فقط عدد + علامت منفی (اگر لازم شد)
  return String(v ?? "").replace(/[^\d-]/g, "");
}

function formatFa(v: string) {
  const n = Number(toDigitsOnly(v));
  return (Number.isFinite(n) ? n : 0).toLocaleString("fa-IR");
}

export default function EstimateEditForm({ initial }: { initial: EstimateEditDTO }) {
  const [pending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState(initial.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(initial.customerPhone ?? "");
  const [projectLocation, setProjectLocation] = useState(initial.projectLocation ?? "");
  const [usageType, setUsageType] = useState(initial.usageType ?? "");
  const [deliveryDays, setDeliveryDays] = useState(
    initial.deliveryDays === null || initial.deliveryDays === undefined ? "" : String(initial.deliveryDays)
  );

  const [paymentTerms, setPaymentTerms] = useState(initial.paymentTerms ?? "");
  const [warrantyTerms, setWarrantyTerms] = useState(initial.warrantyTerms ?? "");
  const [transportTerms, setTransportTerms] = useState(initial.transportTerms ?? "");
  const [notesForCustomer, setNotesForCustomer] = useState(initial.notesForCustomer ?? "");

  const [items, setItems] = useState<Item[]>(
    initial.items?.length
      ? initial.items.map((x) => ({ title: x.title, amount: toDigitsOnly(x.amount) }))
      : [{ title: "جمع کل", amount: "0" }]
  );

  const total = useMemo(() => {
    const sum = items.reduce((s, it) => {
      const n = Number(toDigitsOnly(it.amount));
      return s + (Number.isFinite(n) ? n : 0);
    }, 0);
    return sum;
  }, [items]);

  function addRow() {
    setItems((prev) => [...prev, { title: "", amount: "" }]);
  }

  function removeRow(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  return (
    <form
      className="space-y-4"
      action={(fd) => {
        // payload items (amount digits-only)
        const payload = items
          .map((x) => ({ title: x.title.trim(), amount: toDigitsOnly(x.amount) }))
          .filter((x) => x.title.length > 0);

        fd.set("estimateId", String(initial.id));
        fd.set("customerName", customerName);
        fd.set("customerPhone", customerPhone);
        fd.set("projectLocation", projectLocation);
        fd.set("usageType", usageType);
        fd.set("deliveryDays", deliveryDays);
        fd.set("paymentTerms", paymentTerms);
        fd.set("warrantyTerms", warrantyTerms);
        fd.set("transportTerms", transportTerms);
        fd.set("notesForCustomer", notesForCustomer);
        fd.set("itemsJson", JSON.stringify(payload));

        startTransition(async () => {
          await updateEstimateAndItemsAction(fd);
        });
      }}
    >
      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold text-blue-700 mb-3">ویرایش اطلاعات مشتری</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm">
            نام مشتری
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>

          <label className="text-sm">
            موبایل
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </label>

          <label className="text-sm">
            محل پروژه
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
            />
          </label>

          <label className="text-sm">
            کاربری
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={usageType}
              onChange={(e) => setUsageType(e.target.value)}
            />
          </label>

          <label className="text-sm">
            زمان تحویل (روز)
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value.replace(/[^\d]/g, ""))}
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-semibold text-blue-700">ویرایش آیتم‌های پیش‌فاکتور</h2>
          <button type="button" className="rounded-lg border px-3 py-2 hover:bg-gray-50" onClick={addRow}>
            + افزودن ردیف
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-right">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">عنوان</th>
                <th className="px-3 py-2">مبلغ (تومان)</th>
                <th className="px-3 py-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-t align-top">
                  <td className="px-3 py-2">{i + 1}</td>

                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      value={it.title}
                      onChange={(e) => updateRow(i, { title: e.target.value })}
                      placeholder="مثلاً: طبقه همکف – ۱۵ متر × ۶,۵۰۰,۰۰۰"
                    />
                  </td>

                  <td className="px-3 py-2">
                    {/* ورودی خام برای تایپ راحت */}
                    <input
                      className="w-full rounded-lg border px-3 py-2 text-left"
                      inputMode="numeric"
                      value={it.amount}
                      onChange={(e) => updateRow(i, { amount: toDigitsOnly(e.target.value) })}
                      placeholder="مثلاً: 97500000"
                    />
                    {/* نمایش فرمت‌شده برای فهم بهتر */}
                    <div className="mt-1 text-xs text-gray-500 text-left">
                      {formatFa(it.amount)} تومان
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
                      onClick={() => removeRow(i)}
                      disabled={items.length <= 1}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 text-sm">
          <span className="text-gray-600">جمع کل:</span>
          <span className="font-bold">{total.toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold text-blue-700 mb-3">شرایط و توضیحات</h2>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">
            شرایط پرداخت
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </label>

          <label className="text-sm">
            گارانتی
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={warrantyTerms}
              onChange={(e) => setWarrantyTerms(e.target.value)}
            />
          </label>

          <label className="text-sm">
            حمل
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={transportTerms}
              onChange={(e) => setTransportTerms(e.target.value)}
            />
          </label>

          <label className="text-sm">
            توضیحات
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[90px]"
              value={notesForCustomer}
              onChange={(e) => setNotesForCustomer(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>

        <a href={`/dashboard/container-estimates/${initial.id}`} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
          انصراف
        </a>
      </div>
    </form>
  );
}
