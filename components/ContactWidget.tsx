"use client";

import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function track(event: string, params?: Record<string, any>) {
  try {
    window.gtag?.("event", event, {
      page: typeof window !== "undefined" ? window.location.pathname : undefined,
      ...params,
    });
  } catch {
    // ignore
  }
}

export default function ContactWidget() {
  const [open, setOpen] = useState(false);

  // شماره ثابت فعلی شما (طبق فایل قبلی)
  const phone = "09124237146";
  const waHref = useMemo(() => `https://wa.me/98${phone.replace(/^0/, "")}`, [phone]);

  useEffect(() => {
    // اگر خواستی بعداً رویداد نمایش اولیه هم بزنیم:
    // track("contact_widget_view");
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* دکمه شناور */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            track(next ? "open_contact_widget" : "close_contact_widget");
            return next;
          });
        }}
        className="rounded-full bg-emerald-500 text-white w-14 h-14 shadow-lg hover:bg-emerald-400 transition flex items-center justify-center"
        aria-label="پشتیبانی و تماس"
      >
        💬
      </button>

      {/* پنل */}
      {open && (
        <div className="mt-3 w-72 rounded-2xl border bg-white shadow-xl p-4">
          <div className="font-extrabold text-slate-900 text-sm">مشاوره سریع کانکس نیکان</div>
          <div className="text-[12px] text-slate-600 mt-1 leading-6">
            برای قیمت و مشاوره، مشخصات سازه (ابعاد/کاربری/امکانات) را بفرستید.
          </div>

          <div className="mt-3 grid gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click_whatsapp")}
              className="rounded-xl bg-emerald-500 text-white text-center py-2 text-[12px] font-extrabold hover:bg-emerald-400 transition"
            >
              گفت‌وگو در واتساپ
            </a>

            <a
              href="/order"
              onClick={() => track("click_order_from_widget")}
              className="rounded-xl border text-center py-2 text-[12px] font-bold hover:bg-slate-50 transition"
            >
              ثبت سفارش / استعلام قیمت
            </a>

            <a
              href="/contact"
              onClick={() => track("click_contact_page_from_widget")}
              className="rounded-xl border text-center py-2 text-[12px] font-bold hover:bg-slate-50 transition"
            >
              صفحه تماس با ما
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
