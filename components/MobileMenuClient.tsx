"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Cat } from "./DropdownCategories";

export default function MobileMenuClient({
  categories,
  links,
}: {
  categories: Cat[];
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // برای portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // قفل اسکرول وقتی منو باز است
  useEffect(() => {
    if (!mounted) return;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, mounted]);

  // فقط دکمه همبرگر داخل هدر
  const trigger = (
    <button
      onClick={() => setOpen(true)}
      aria-label="باز کردن منو"
      className="
        inline-flex items-center justify-center
        h-10 w-10 rounded-xl
        bg-slate-900/70 hover:bg-slate-800
        text-slate-100
        ring-1 ring-white/10
        transition
      "
    >
      <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );

  // اگر هنوز روی کلاینت mount نشده فقط دکمه را نشان بده
  if (!mounted) return trigger;

  return (
    <>
      {trigger}

      {open &&
        createPortal(
          <>
            {/* بک‌دراپ تار */}
            <div
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[100000] bg-black/50 backdrop-blur-sm"
            />

            {/* پنل کشویی */}
            <aside
              className="
                fixed inset-y-0 right-0 z-[100001]
                w-full max-w-xs
                transform translate-x-0
              "
            >
              <div
                className="
                  flex h-full flex-col
                  bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900
                  text-slate-50 shadow-2xl border-l border-white/10
                  pt-4 pb-6 px-5
                  overflow-y-auto
                "
              >
                {/* هدر منو */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logos/logo.png"
                      alt="کانکس نیکان"
                      className="h-8 w-auto"
                    />
                    <span className="text-sm font-extrabold">کانکس نیکان</span>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    aria-label="بستن منو"
                    className="
                      inline-flex h-9 w-9 items-center justify-center
                      rounded-lg bg-white/5 hover:bg-white/10
                      text-slate-100 transition
                    "
                  >
                    ✕
                  </button>
                </div>

                {/* دسته‌بندی‌ها */}
                {categories.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-3 text-xs font-bold text-slate-100/90">
                      دسته‌بندی کانکس‌ها
                    </p>
                    <ul className="space-y-2">
                      {categories.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/category/${c.slug}`}
                            onClick={() => setOpen(false)}
                            className="
                              block rounded-xl border border-white/20
                              bg-white/8 px-3 py-2
                              text-sm font-semibold
							  text-slate-50
							  shadow-md shadow-black/40
                              hover:bg-white/15 hover:border-white/40 transition
                            "
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* لینک‌های ثابت */}
                {links.length > 0 && (
                  <nav className="mb-4">
                    <ul className="space-y-2">
                      {links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="
                              block rounded-1g
                              px-3 py-2.5
                              text-sm font-semibold
							  text-slate-100
                              hover:bg-white/10 hover:text-white transition
                            "
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}

                {/* CTA پایین */}
                <div className="mt-auto pt-3">
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="
                      inline-flex w-full items-center justify-center
                      rounded-xl px-4 py-2 text-sm font-extrabold
                      bg-gradient-to-r from-sky-500 via-emerald-400 to-lime-400
                      text-slate-950 shadow-lg
                      hover:from-emerald-400 hover:to-sky-500 transition
                    "
                  >
                    مشاوره و تماس
                  </Link>
                </div>
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}
