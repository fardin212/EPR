"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { FaBell, FaCircleUser } from "react-icons/fa6";

const titles: Record<string, string> = {
  "/dashboard": "نمای کلی عملیات نیکان",

  // CRM
  "/dashboard/crm": "نمای کلی CRM",
  "/dashboard/crm/leads": "لیست سرنخ‌ها",
  "/dashboard/crm/customers": "مشتریان",
  "/dashboard/crm/pipeline": "کانبان فروش",
  "/dashboard/crm/activities": "فعالیت‌ها / پیگیری‌ها",
  "/dashboard/crm/analytics": "گزارش تحلیلی فروش",

  // Projects
  "/dashboard/projects": "پروژه‌ها و کانکس‌ها",

  // Estimates
  "/dashboard/container-estimates": "قیمت‌گذاری کانکس / پیش‌فاکتور",

  // Inventory
  "/dashboard/inventory": "انبار و موجودی",
  "/dashboard/inventory/categories": "دسته‌بندی‌های انبار",
  "/dashboard/inventory/purchase": "ثبت خرید انبار",
  "/dashboard/inventory/move": "جابجایی انبار",
  "/dashboard/inventory/stocktaking": "انبارگردانی",
  "/dashboard/inventory/import": "ایمپورت کالا",

  // BOM
  "/dashboard/bom": "لیست مواد – BOM",

  // Materials
  "/dashboard/materials": "مواد و قیمت روز",
  "/dashboard/materials/daily": "PDF قیمت روز مواد",

  // Parties
  "/dashboard/parties": "طرف حساب‌ها",
  "/dashboard/parties/new": "ثبت طرف حساب",
  "/dashboard/accounting/locks": "قفل حسابداری (بستن ماه)",

  // Treasury
  "/dashboard/treasury": "خزانه‌داری (پرداخت/دریافت، چک‌ها، مانده)",

  // Management
  "/dashboard/management": "مدیریت و گزارش‌ها",

  // Settings / Accounting
  "/dashboard/settings": "تنظیمات سیستم",
  "/dashboard/accounting": "حسابداری",
};

type DueChequesResp = {
  count: number;
  items: Array<{
    id: number;
    number: string;
    dueDate: string;
    amount: number;
    partyName: string | null;
    status: string;
  }>;
};

type Role = "ADMIN" | "MANAGER" | "STAFF";
type MeResp = { user?: { name?: string; email?: string; role?: Role } };

export default function Topbar() {
  const pathname = usePathname();

  const title = useMemo(() => {
    if (titles[pathname]) return titles[pathname];
    const exact = Object.keys(titles)
      .sort((a, b) => b.length - a.length)
      .find((k) => pathname.startsWith(k) && k !== "/dashboard");
    return (exact && titles[exact]) || "ERP نیکان";
  }, [pathname]);

  const [due, setDue] = useState<DueChequesResp>({ count: 0, items: [] });

  const [me, setMe] = useState<{ name: string; email: string; role: Role }>({
    name: "کاربر",
    email: "unknown",
    role: "STAFF",
  });

  useEffect(() => {
    fetch("/api/treasury/cheques/due?days=3")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data && typeof data.count === "number") setDue(data);
      })
      .catch(() => setDue({ count: 0, items: [] }));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: MeResp) => {
        const u = data?.user;
        setMe({
          name: u?.name || "کاربر",
          email: u?.email || "unknown",
          role: (u?.role as Role) || "STAFF",
        });
      })
      .catch(() => {
        setMe({ name: "کاربر", email: "unknown", role: "STAFF" });
      });
  }, []);

  return (
    <header
      className="
        rounded-2xl bg-white/70 border border-slate-200 shadow-sm
        px-4 py-3 sm:px-5 sm:py-3.5
        flex items-center justify-between gap-3
        backdrop-blur
      "
      dir="rtl"
    >
      <div className="space-y-0.5">
        <p className="text-xs text-slate-400">داشبورد</p>
        <h1 className="text-sm sm:text-base font-semibold text-slate-800">{title}</h1>
        <p className="text-[11px] text-slate-400">نقش: {me.role}</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>سیستم فعال است</span>
        </div>

        <button
          type="button"
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 text-sm"
          title={due.count > 0 ? `چک‌های نزدیک سررسید: ${due.count}` : "اعلان‌ها"}
        >
          <FaBell />
          {due.count > 0 && (
            <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold inline-flex items-center justify-center">
              {due.count > 99 ? "99+" : due.count}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-1 border-r border-slate-200">
          <div className="text-right">
            <div className="text-xs font-medium text-slate-800">{me.name}</div>
            <div className="text-[11px] text-slate-400">{me.email}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg">
            <FaCircleUser />
          </div>
        </div>
      </div>
    </header>
  );
}
