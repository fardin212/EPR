"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Image as ImageIcon,
  ShoppingCart,
  BookOpen,
  MessagesSquare,
  Settings,
  LineChart, // آیکن سئو
  PackageSearch, // ✅ used conex
  ClipboardList, // ✅ leads
  Send, // ✅ telegram test
  Star, // ✅ reviews
} from "lucide-react";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  group?: "main" | "content" | "ops" | "settings";
  exact?: boolean;
};

const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "داشبورد",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
    group: "main",
  },

  {
    key: "categories",
    label: "دسته‌بندی‌ها",
    href: "/admin/categories",
    icon: Layers,
    group: "content",
  },
  {
    key: "projects",
    label: "پروژه‌ها / نمونه‌کارها",
    href: "/admin/projects",
    icon: FolderKanban,
    group: "content",
  },
  {
    key: "banners",
    label: "بنرها",
    href: "/admin/banners",
    icon: ImageIcon,
    group: "content",
  },
  {
    key: "articles",
    label: "مقالات",
    href: "/admin/articles",
    icon: BookOpen,
    group: "content",
  },

  // ✅ NEW: Guides (راهنماها)
  {
    key: "guides",
    label: "راهنماها (Guides)",
    href: "/admin/guides",
    icon: BookOpen,
    group: "content",
  },

  // ✅ NEW: Used Conex (دست دوم)
  {
    key: "used_conex",
    label: "کانکس‌های دست دوم",
    href: "/admin/used-conex",
    icon: PackageSearch,
    group: "content",
  },
  {
    key: "used_conex_leads",
    label: "لیدهای کانکس دست دوم",
    href: "/admin/used-conex/leads",
    icon: ClipboardList,
    group: "ops",
  },
  {
    key: "used_conex_leads_dashboard",
    label: "داشبورد لیدهای دست دوم",
    href: "/admin/used-conex/leads/dashboard",
    icon: LineChart,
    group: "ops",
  },

  // 👇 آیتم سئو
  {
    key: "seo",
    label: "سئو سایت",
    href: "/admin/seo",
    icon: LineChart,
    group: "content",
  },

  {
    key: "orders",
    label: "سفارش‌ها",
    href: "/admin/orders",
    icon: ShoppingCart,
    group: "ops",
  },
  {
    key: "chat",
    label: "پیام‌ها / چت",
    href: "/admin/chat",
    icon: MessagesSquare,
    group: "ops",
  },

  // ✅ NEW: Reviews
  {
    key: "reviews",
    label: "نظرات سایت",
    href: "/admin/reviews",
    icon: Star,
    group: "ops",
  },

  // ✅ NEW: Telegram test (admin only page you built)
  {
    key: "telegram_test",
    label: "تست تلگرام (ادمین)",
    href: "/admin/telegram-test",
    icon: Send,
    group: "settings",
  },

  {
    key: "settings",
    label: "تنظیمات",
    href: "/admin/settings",
    icon: Settings,
    group: "settings",
  },
];

const groupTitles: Record<NonNullable<NavItem["group"]>, string> = {
  main: "مدیریت",
  content: "محتوا",
  ops: "عملیات",
  settings: "سیستمی",
};

export default function AdminNav() {
  const pathname = usePathname();

  const grouped = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group || "main";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <nav className="flex flex-col gap-4">
      {Object.entries(grouped).map(([groupKey, items]) => (
        <div key={groupKey} className="flex flex-col gap-1">
          {groupTitles[groupKey as keyof typeof groupTitles] && (
            <div className="px-2 text-[11px] font-extrabold text-muted-foreground">
              {groupTitles[groupKey as keyof typeof groupTitles]}
            </div>
          )}

          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              const Icon = item.icon;

              return (
                <li key={item.key} className="w-full">
                  <Link
                    href={item.href}
                    className={[
                      "group flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition cursor-pointer",
                      "border border-transparent hover:border-[var(--brand-blue)] hover:bg-muted/60",
                      isActive
                        ? "bg-[var(--brand-blue)]/10 border-[var(--brand-blue)] text-foreground"
                        : "text-foreground/80",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={[
                          "grid place-items-center h-8 w-8 rounded-lg transition shrink-0",
                          isActive
                            ? "bg-[var(--brand-blue)] text-white"
                            : "bg-muted text-foreground group-hover:bg-[var(--brand-blue)] group-hover:text-white",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="truncate">{item.label}</span>
                    </span>

                    {isActive && (
                      <span className="ms-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
