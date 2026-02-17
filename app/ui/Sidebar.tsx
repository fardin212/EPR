"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBox,
  FaUser,
  FaGear,
  FaToolbox,
  FaHouse,
  FaListCheck,
  FaChevronDown,
  FaChartLine,
  FaUsers,
  FaMoneyBillWave,
  FaCalculator,
  FaWarehouse,
  FaTruckRampBox,
  FaClipboardList,
  FaReceipt,
  FaScrewdriverWrench,
  FaCubesStacked,
  FaTags,
  FaUserTie,
} from "react-icons/fa6";
import { useEffect, useMemo, useState } from "react";

type Role = "ADMIN" | "MANAGER" | "STAFF";
type MeResp = { user?: { name?: string; email?: string; role?: Role } };

type NavItem = {
  label: string;
  href: string;
  icon: any;
  roles?: Role[]; // اگر خالی باشه یعنی همه نقش‌ها
};

function hasAccess(item: NavItem, role: Role) {
  return !item.roles || item.roles.includes(role);
}

export default function Sidebar() {
  const path = usePathname();

  // نقش کاربر از /api/auth/me
  const [role, setRole] = useState<Role>("STAFF");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: MeResp) => {
        const r = data?.user?.role;
        if (r === "ADMIN" || r === "MANAGER" || r === "STAFF") setRole(r);
      })
      .catch(() => setRole("STAFF"));
  }, []);

  // ---------- منوهای اصلی ----------
  const mainItems: NavItem[] = useMemo(
    () => [
      { label: "نمای کلی", icon: FaHouse, href: "/dashboard" },

      { label: "CRM و مشتریان", icon: FaUsers, href: "/dashboard/crm" },

      { label: "پروژه‌ها", icon: FaToolbox, href: "/dashboard/projects" },

      { label: "پیش‌فاکتور و قیمت‌گذاری", icon: FaCalculator, href: "/dashboard/container-estimates" },

      { label: "خزانه‌داری", icon: FaMoneyBillWave, href: "/dashboard/treasury" },

      // انبار
      { label: "انبار و موجودی", icon: FaBox, href: "/dashboard/inventory" },

      // BOM
      { label: "BOM (مواد استاندارد)", icon: FaListCheck, href: "/dashboard/bom" },

      // مواد و قیمت روز
      { label: "مواد و قیمت روز", icon: FaCubesStacked, href: "/dashboard/materials" },

      // طرف حساب‌ها
      { label: "طرف حساب‌ها", icon: FaUserTie, href: "/dashboard/parties" },

      // محصولات (فعلاً صفحه new داری)
      { label: "ثبت محصول", icon: FaTags, href: "/dashboard/products/new", roles: ["ADMIN", "MANAGER"] },

      // داشبورد مدیریت / گزارش‌ها
      { label: "مدیریت و گزارش‌ها", icon: FaChartLine, href: "/dashboard/management", roles: ["ADMIN", "MANAGER"] },

      // حسابداری
      { label: "حسابداری", icon: FaReceipt, href: "/dashboard/accounting", roles: ["ADMIN"] },
	  { label: "قفل حسابداری", icon: FaReceipt, href: "/dashboard/accounting/locks", roles: ["ADMIN"] },

      // تنظیمات
      { label: "تنظیمات", icon: FaGear, href: "/dashboard/settings", roles: ["ADMIN"] },
    ],
    []
  );

  // ---------- زیرمنو: CRM ----------
  const crmItems: NavItem[] = useMemo(
    () => [
      { label: "نمای کلی CRM", href: "/dashboard/crm", icon: FaUsers },
      { label: "سرنخ‌ها", href: "/dashboard/crm/leads", icon: FaUsers },
      { label: "مشتریان", href: "/dashboard/crm/customers", icon: FaUser },
      { label: "کانبان فروش", href: "/dashboard/crm/pipeline", icon: FaListCheck },
      { label: "فعالیت‌ها / پیگیری‌ها", href: "/dashboard/crm/activities", icon: FaClipboardList },
      { label: "گزارش تحلیلی فروش", href: "/dashboard/crm/analytics", icon: FaChartLine, roles: ["ADMIN", "MANAGER"] },
    ],
    []
  );

  // ---------- زیرمنو: انبار ----------
  const inventoryItems: NavItem[] = useMemo(
    () => [
      { label: "نمای کلی انبار", href: "/dashboard/inventory", icon: FaWarehouse },
      { label: "دسته‌بندی‌ها", href: "/dashboard/inventory/categories", icon: FaTags, roles: ["ADMIN", "MANAGER"] },
      { label: "ثبت خرید", href: "/dashboard/inventory/purchase", icon: FaReceipt },
      { label: "جابجایی انبار", href: "/dashboard/inventory/move", icon: FaTruckRampBox },
      { label: "انبارگردانی", href: "/dashboard/inventory/stocktaking", icon: FaClipboardList, roles: ["ADMIN", "MANAGER"] },
      { label: "ایمپورت کالا", href: "/dashboard/inventory/import", icon: FaScrewdriverWrench, roles: ["ADMIN"] },
    ],
    []
  );

  // ---------- باز/بسته بودن زیرمنوها ----------
  const [openCRM, setOpenCRM] = useState(path.startsWith("/dashboard/crm"));
  const [openInv, setOpenInv] = useState(path.startsWith("/dashboard/inventory"));

  useEffect(() => {
    if (path.startsWith("/dashboard/crm")) setOpenCRM(true);
    if (path.startsWith("/dashboard/inventory")) setOpenInv(true);
  }, [path]);

  function isActive(href: string) {
    return path === href || (href !== "/dashboard" && path.startsWith(href + "/"));
  }

  return (
    <nav
      className="
        rounded-2xl bg-white/80 border border-slate-200 shadow-sm
        px-4 py-5 sm:px-5 sm:py-6
        backdrop-blur
      "
      dir="rtl"
    >
      {/* سربرگ */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div>
          <div className="text-xs text-slate-400 mb-1">سیستم یکپارچه</div>
          <div className="text-lg font-bold text-indigo-700">ERP نیکان</div>
          <div className="text-[11px] text-slate-400 mt-1">نقش شما: {role}</div>
        </div>

        <div className="inline-flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1">
          نسخه آزمایشی
        </div>
      </div>

      <div className="hidden lg:flex flex-col gap-2">
        {/* آیتم‌های اصلی */}
        {mainItems
          .filter((it) => hasAccess(it, role))
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            // آیتم‌های دارای زیرمنو: CRM و Inventory رو به صورت دکمه جدا نمایش می‌دیم
            if (item.href === "/dashboard/crm") {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setOpenCRM(!openCRM)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition
                      ${active ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}
                    `}
                    type="button"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-base ${active ? "bg-white/15" : "bg-white text-indigo-500"}`}>
                        <Icon />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <FaChevronDown className={`transition text-xs ${openCRM ? "rotate-180" : ""}`} />
                  </button>

                  {openCRM && (
                    <div className="mt-2 ml-3 flex flex-col gap-1">
                      {crmItems
                        .filter((sub) => hasAccess(sub, role))
                        .map((sub) => {
                          const SubIcon = sub.icon;
                          const subActive = isActive(sub.href);
                          return (
                            <Link key={sub.href} href={sub.href}>
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition
                                  ${
                                    subActive
                                      ? "bg-indigo-600 text-white shadow-sm"
                                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                                  }
                                `}
                              >
                                <SubIcon className="text-xs" />
                                <span>{sub.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            }

            if (item.href === "/dashboard/inventory") {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setOpenInv(!openInv)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition
                      ${active ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}
                    `}
                    type="button"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-base ${active ? "bg-white/15" : "bg-white text-indigo-500"}`}>
                        <Icon />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <FaChevronDown className={`transition text-xs ${openInv ? "rotate-180" : ""}`} />
                  </button>

                  {openInv && (
                    <div className="mt-2 ml-3 flex flex-col gap-1">
                      {inventoryItems
                        .filter((sub) => hasAccess(sub, role))
                        .map((sub) => {
                          const SubIcon = sub.icon;
                          const subActive = isActive(sub.href);
                          return (
                            <Link key={sub.href} href={sub.href}>
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition
                                  ${
                                    subActive
                                      ? "bg-indigo-600 text-white shadow-sm"
                                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                                  }
                                `}
                              >
                                <SubIcon className="text-xs" />
                                <span>{sub.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            }

            // بقیه آیتم‌ها
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all
                    ${active ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-base ${active ? "bg-white/15" : "bg-white text-indigo-500"}`}>
                      <Icon />
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {active && <span className="w-1.5 h-6 rounded-full bg-white/80" />}
                </div>
              </Link>
            );
          })}
      </div>
    </nav>
  );
}
