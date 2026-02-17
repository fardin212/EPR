"use client";

import { toJalali } from "@/lib/date";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Activity = {
  id: number;
  type: string;
  title: string;
  detail?: string | null;
  doneAt: string;
};

type Lead = {
  id: number;
  name: string;
  status: string;
};

type Customer = {
  id: number;
  name: string;
  type?: string | null;
  phone?: string | null;
  email?: string | null;
  companyName?: string | null;
  lastDealAt?: string | null;
  note?: string | null;
  createdAt: string;
  leads: Lead[];
  activities: Activity[];
};

export default function CustomerDetailClient({ customer }: { customer: Customer }) {
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>(customer.activities || []);
  const [actType, setActType] = useState("CALL");
  const [actTitle, setActTitle] = useState("");
  const [actDetail, setActDetail] = useState("");
  const [actLoading, setActLoading] = useState(false);

  async function addActivity(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!actTitle.trim()) return;

    setActLoading(true);
    try {
      const res = await fetch(`/api/crm/customers/${customer.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: actType, title: actTitle, detail: actDetail || null }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.activity) {
        setActivities((prev) => [data.activity, ...prev]);
        setActTitle("");
        setActDetail("");
      }
    } finally {
      setActLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">CRM / جزئیات مشتری</p>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 mt-1">
            {customer.name}
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            ایجاد شده در{" "}
            {toJalali(customer.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/crm")}
          className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-600 hover:text-slate-900 hover:border-slate-400"
        >
          ← بازگشت به CRM
        </button>
      </section>

      {/* اطلاعات + سرنخ‌های مرتبط */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* اطلاعات */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3 text-[12px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Info label="نام" value={customer.name} />
            <Info label="نوع" value={customer.type || "—"} />
            <Info label="نام شرکت" value={customer.companyName || "—"} />
            <Info label="تلفن" value={customer.phone || "—"} />
            <Info label="ایمیل" value={customer.email || "—"} />
            <Info
              label="آخرین معامله"
              value={
                customer.lastDealAt
                  ? toJalali(customer.lastDealAt)
                  : "—"
              }
            />
          </div>
          {customer.note && (
            <div>
              <div className="text-[11px] text-slate-500 mb-1">توضیحات</div>
              <p className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-[12px] text-slate-700">
                {customer.note}
              </p>
            </div>
          )}
        </div>

        {/* سرنخ‌ها */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3 text-[12px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-slate-800">
              سرنخ‌های مرتبط
            </h2>
            <span className="text-[11px] text-slate-400">
              {customer.leads.length} مورد
            </span>
          </div>
          {customer.leads.length === 0 ? (
            <p className="text-[12px] text-slate-500">
              هیچ سرنخی به این مشتری متصل نیست.
            </p>
          ) : (
            <ul className="space-y-2">
              {customer.leads.map((l) => (
                <li
                  key={l.id}
                  className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 flex items-center justify-between"
                >
                  <span className="text-slate-800">{l.name}</span>
                  <span className="text-[11px] text-slate-500">
                    {leadStatusLabel(l.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ثبت پیگیری */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3 text-[12px]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          ثبت پیگیری جدید برای این مشتری
        </h2>
        <form onSubmit={addActivity} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">
                نوع فعالیت
              </label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
              >
                <option value="CALL">تماس تلفنی</option>
                <option value="MEETING">جلسه</option>
                <option value="WHATSAPP">واتس‌اپ</option>
                <option value="EMAIL">ایمیل</option>
                <option value="NOTE">یادداشت</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-500 mb-1 block">
                عنوان *
              </label>
              <input
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
                placeholder="مثلاً جلسه برای عقد قرارداد..."
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 mb-1 block">
              توضیحات
            </label>
            <textarea
              value={actDetail}
              onChange={(e) => setActDetail(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={actLoading}
            className="rounded-full bg-emerald-600 text-white text-[12px] px-5 py-2 hover:bg-emerald-700 disabled:opacity-60"
          >
            {actLoading ? "در حال ثبت..." : "ثبت پیگیری"}
          </button>
        </form>
      </section>

      {/* تاریخچه پیگیری‌ها */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3 text-[12px]">
        <h2 className="text-[13px] font-semibold text-slate-800">
          تاریخچه پیگیری‌ها
        </h2>
        {activities.length === 0 ? (
          <p className="text-[12px] text-slate-500">
            هنوز هیچ پیگیری برای این مشتری ثبت نشده است.
          </p>
        ) : (
          <ul className="space-y-2">
            {activities.map((a) => (
              <li
                key={a.id}
                className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {a.title}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {toJalali(a.doneAt, true)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {activityLabel(a.type)}
                </div>
                {a.detail && (
                  <div className="text-[12px] text-slate-700 mt-1">
                    {a.detail}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
      <div className="text-[11px] text-slate-500 mb-0.5">{label}</div>
      <div className="text-[12px] text-slate-800">{value}</div>
    </div>
  );
}

function leadStatusLabel(status: string) {
  const key = (status || "").toUpperCase();
  if (key === "NEW") return "جدید";
  if (key === "IN_PROGRESS") return "در حال پیگیری";
  if (key === "WON") return "تبدیل به مشتری";
  if (key === "LOST") return "از دست رفته";
  return "نامشخص";
}

function activityLabel(t: string) {
  const map: Record<string, string> = {
    CALL: "تماس تلفنی",
    MEETING: "جلسه",
    WHATSAPP: "پیام واتس‌اپ",
    EMAIL: "ایمیل",
    NOTE: "یادداشت",
  };
  return map[t] || "فعالیت";
}
