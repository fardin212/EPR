// app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "نمای کلی عملیات نیکان | ERP نیکان",
};

type ModuleCard = {
  title: string;
  desc: string;
  badge: string;
  href: string;
  badgeVariant?: "active" | "dev" | "admin";
};

const dailyModules: ModuleCard[] = [
  {
    title: "CRM و مشتریان",
    desc: "سرنخ‌ها، مشتریان، کانبان فروش و پیگیری‌ها.",
    badge: "فعال",
    href: "/dashboard/crm",
    badgeVariant: "active",
  },
  {
    title: "پروژه‌ها",
    desc: "پروژه‌ها، مراحل، چک‌لیست و تصاویر پروژه.",
    badge: "فعال",
    href: "/dashboard/projects",
    badgeVariant: "active",
  },
  {
    title: "انبار و موجودی",
    desc: "خرید، جابجایی انبار، انبارگردانی و دسته‌بندی‌ها.",
    badge: "فعال",
    href: "/dashboard/inventory",
    badgeVariant: "active",
  },
  {
    title: "پیش‌فاکتور و قیمت‌گذاری",
    desc: "ایجاد پیش‌فاکتور، BOM، هزینه‌ها و خروجی PDF.",
    badge: "فعال",
    href: "/dashboard/container-estimates",
    badgeVariant: "active",
  },
  {
    title: "خزانه‌داری",
    desc: "چک‌ها، پرداخت/دریافت، مانده صندوق و بانک.",
    badge: "فعال",
    href: "/dashboard/treasury",
    badgeVariant: "active",
  },
  {
    title: "مواد و قیمت روز",
    desc: "لیست مواد، تاریخچه قیمت و خروجی PDF روزانه.",
    badge: "فعال",
    href: "/dashboard/materials",
    badgeVariant: "active",
  },
];

const controlModules: ModuleCard[] = [
  {
    title: "BOM – لیست مواد استاندارد",
    desc: "تعریف BOMها و استفاده در قیمت‌گذاری و پروژه‌ها.",
    badge: "فعال",
    href: "/dashboard/bom",
    badgeVariant: "active",
  },
  {
    title: "طرف حساب‌ها",
    desc: "مشتری/تأمین‌کننده/پیمانکار در قالب طرف حساب.",
    badge: "فعال",
    href: "/dashboard/parties",
    badgeVariant: "active",
  },
  {
    title: "مدیریت و گزارش‌ها",
    desc: "داشبورد مدیریتی و گزارش‌ها (در حال تکمیل).",
    badge: "مدیریتی",
    href: "/dashboard/management",
    badgeVariant: "dev",
  },
];

const systemModules: ModuleCard[] = [
  {
    title: "حسابداری",
    desc: "سندهای مالی، حساب‌ها و اتصال هزینه‌ها (در توسعه).",
    badge: "ADMIN",
    href: "/dashboard/accounting",
    badgeVariant: "admin",
  },
  {
    title: "تنظیمات سیستم",
    desc: "تنظیمات پایه، QC، کاربران و نقش‌ها.",
    badge: "ADMIN",
    href: "/dashboard/settings",
    badgeVariant: "admin",
  },
  {
    title: "ثبت محصول",
    desc: "ثبت محصول جدید (صفحه new).",
    badge: "مدیریت",
    href: "/dashboard/products/new",
    badgeVariant: "dev",
  },
];

function Badge({ v, text }: { v?: ModuleCard["badgeVariant"]; text: string }) {
  const cls =
    v === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : v === "admin"
      ? "bg-rose-50 text-rose-700 border-rose-100"
      : "bg-indigo-50 text-indigo-700 border-indigo-100";

  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${cls}`}>
      {text}
    </span>
  );
}

function ModuleSection({ title, modules }: { title: string; modules: ModuleCard[] }) {
  return (
    <section className="space-y-3" dir="rtl">
      <h2 className="text-xs font-semibold text-slate-600">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {modules.map((m) => (
          <a
            key={m.title}
            href={m.href}
            className="group rounded-2xl bg-slate-50 hover:bg-white shadow-sm hover:shadow-md border border-slate-100 px-4 py-4 flex flex-col justify-between transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge v={m.badgeVariant} text={m.badge} />
              <span className="text-xs text-slate-400 group-hover:text-indigo-500">مشاهده</span>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-800">{m.title}</h3>
              <p className="text-[11px] leading-relaxed text-slate-500">{m.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8" dir="rtl">
      <header className="space-y-3">
        <p className="text-xs text-slate-500">داشبورد ERP نیکان</p>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
          نمای کلی عملیات نیکان
        </h1>
        <p className="text-[11px] text-slate-500 max-w-xl">
          دسترسی سریع به ماژول‌های اصلی: CRM، پروژه‌ها، انبار، قیمت‌گذاری، خزانه‌داری و مواد.
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          <span className="rounded-full bg-emerald-50 text-emerald-700 text-[11px] px-3 py-1">
            ماژول‌های فعال: CRM، پروژه‌ها، انبار، BOM، مواد، خزانه‌داری، قیمت‌گذاری
          </span>
          <span className="rounded-full bg-indigo-50 text-indigo-700 text-[11px] px-3 py-1">
            نسخه اختصاصی ERP نیکان
          </span>
        </div>
      </header>

      <ModuleSection title="عملیات روزانه" modules={dailyModules} />
      <ModuleSection title="برنامه‌ریزی و کنترل" modules={controlModules} />
      <ModuleSection title="سیستم پایه و مدیریتی" modules={systemModules} />
    </div>
  );
}
