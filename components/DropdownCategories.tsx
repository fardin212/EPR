"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export type Cat = {
  id: number;
  name: string;
  slug: string;
  children?: Cat[];
};

interface Props {
  categories: Cat[];
  label?: string;
}

export default function DropdownCategories({ categories, label }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // بسته شدن منو با کلیک بیرون
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* دکمه‌ی باز/بستن منو */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          nk-link
          inline-flex items-center gap-1
          font-semibold text-slate-50
        "
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label ?? "دسته‌بندی‌ها"}
        <span
          className={`transition-transform text-xs ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* مگا منو */}
      {open && (
        <div
          className="
            absolute top-[120%] right-0
            w-[520px] max-w-[92vw]
            rounded-2xl border border-slate-200
            bg-white shadow-2xl
            py-4 px-4
            text-right z-[60]
            animate-fadeIn
          "
          role="menu"
        >
          {/* عنوان بالای مگا منو */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">
                انتخاب نوع سازه
              </p>
              <p className="text-xs text-slate-500">
                دسته‌بندی‌های اصلی سازه‌های کانکسی و کانتینری
              </p>
            </div>

            {/* لینک مشاهده همه دسته‌ها */}
            <Link
              href="/category"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
              onClick={() => setOpen(false)}
            >
              مشاهده همه دسته‌ها
            </Link>
          </div>

          {/* اگر دسته‌ای وجود نداشت */}
          {categories.length === 0 && (
            <p className="px-1 py-2 text-xs text-slate-500">
              هنوز دسته‌ای ثبت نشده است.
            </p>
          )}

          {/* لیست دسته‌ها */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pe-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="
                  group rounded-xl border border-slate-100
                  bg-slate-50/40 hover:bg-slate-100
                  hover:border-blue-300
                  transition p-3 flex flex-col gap-1.5
                "
              >
                {/* لینک دسته اصلی */}
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between gap-2"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <span className="
                      inline-flex h-2 w-2 rounded-full
                      bg-blue-500 group-hover:bg-blue-600
                    " />
                    <span className="text-sm font-semibold text-slate-800">
                      {cat.name}
                    </span>
                  </span>

                  <span className="text-[11px] text-slate-400 group-hover:text-slate-600">
                    مشاهده
                  </span>
                </Link>

                {/* زیر دسته‌ها */}
                {cat.children && cat.children.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {cat.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        className="
                          inline-flex items-center rounded-full
                          bg-white text-[11px] text-slate-600
                          px-2 py-0.5 border border-slate-200
                          hover:border-blue-300 hover:text-blue-700
                          transition
                        "
                        onClick={() => setOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
