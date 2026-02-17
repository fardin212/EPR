"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; icon: JSX.Element; exact?: boolean };

const items: Item[] = [
  // مدیریت
  { href: "/admin", label: "داشبورد", icon: <IconHome />, exact: true },

  // محتوا
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: <IconFolder /> },
  {
    href: "/admin/projects",
    label: "پروژه‌ها / نمونه‌کارها",
    icon: <IconGallery />,
  },
  { href: "/admin/banners", label: "بنرها", icon: <IconImage /> },
  { href: "/admin/articles", label: "مقالات", icon: <IconDoc /> },

  // عملیات
  { href: "/admin/orders", label: "سفارش‌ها", icon: <IconCart /> },
  { href: "/admin/chat", label: "پیام‌ها / چت", icon: <IconChat /> },

  // سیستمی
  { href: "/admin/settings", label: "تنظیمات", icon: <IconSettings /> },
];

export default function AdminTopbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(it: Item) {
    return it.exact ? pathname === it.href : pathname.startsWith(it.href);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-3 h-14 flex items-center justify-between gap-3">
        {/* Brand + burger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer"
            aria-label="باز کردن منو"
          >
            <IconMenu />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white grid place-items-center font-bold">
              N
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-extrabold leading-none">
                کانکس نیکان
              </div>
              <div className="text-[11px] text-gray-500 leading-none mt-0.5">
                پنل مدیریت
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm transition cursor-pointer select-none
              ${
                isActive(it)
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="opacity-80">{it.icon}</span>
              <span className="whitespace-nowrap">{it.label}</span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <form action="/api/admin/logout" method="POST">
            <button
              className="px-3 py-1.5 rounded-xl border text-sm hover:bg-gray-50 text-gray-700 cursor-pointer select-none"
              title="خروج"
            >
              خروج
            </button>
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/20 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-72 bg-white border-l shadow-xl
          transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
          dir="rtl"
        >
          <div className="h-14 px-3 border-b flex items-center justify-between">
            <div className="font-bold">منوی مدیریت</div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="بستن"
            >
              <IconClose />
            </button>
          </div>

          <nav className="p-2 space-y-1">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-2xl text-sm cursor-pointer select-none
                ${
                  isActive(it)
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="opacity-80">{it.icon}</span>
                  <span className="truncate">{it.label}</span>
                </span>
              </Link>
            ))}

            <form
              action="/api/admin/logout"
              method="POST"
              className="pt-2 border-t mt-2"
            >
              <button className="w-full text-right px-3 py-2 rounded-2xl border text-sm hover:bg-gray-50 cursor-pointer select-none">
                خروج از حساب
              </button>
            </form>
          </nav>
        </aside>
      </div>
    </header>
  );
}

/* ---------------- Icons (inline SVG – بدون وابستگی) ---------------- */
function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="m6.4 5 12.6 12.6-1.4 1.4L5 6.4z" />
      <path d="M18.6 5 5 18.6l1.4 1.4L20 6.4z" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="m12 3 8 7v11h-6v-7H10v7H4V10z" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4l2 2h8a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h5z" />
    </svg>
  );
}
function IconGallery() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 19V5a2 2 0 0 0-2-2H5C3.9 3 3 3.9 3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8 7a2 2 0 1 1 .001 4.001A2 2 0 0 1 8 7zm11 10-5-6-4 5-2-2-3 3h14z" />
    </svg>
  );
}
function IconImage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14a2 2 0 0 1 2 2v14l-4-3-3 2-4-5-5 4V5a2 2 0 0 1 2-2z" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h15A2.5 2.5 0 0 1 22 4.5v9A2.5 2.5 0 0 1 19.5 16H8l-4.8 3.6A1 1 0 0 1 2 18.8z" />
    </svg>
  );
}
function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4h13l-1.5 9h-12z" />
      <circle cx="10" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
      <path d="M5 4H3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8.94 2.34-1.15-.66.02-.18a7.96 7.96 0 0 0-.54-2.01l.82-.96-1.41-1.41-.96.82c-.64-.32-1.31-.46-2.01-.54L15.32 3h-2.64l-.39 1.16c-.7.08-1.37.22-2.01.54l-.96-.82-1.41 1.41.82.96c-.32.64-.46 1.31-.54 2.01l-1.16.39v2.64l1.16.39c.08.7.22 1.37.54 2.01l-.82.96 1.41 1.41.96-.82c.64.32 1.31.46 2.01.54l.39 1.16h2.64l.39-1.16c.7-.08 1.37-.22 2.01-.54l.96.82 1.41-1.41-.82-.96c.32-.64.46-1.31.54-2.01l1.16-.39v-2.64z" />
    </svg>
  );
}
