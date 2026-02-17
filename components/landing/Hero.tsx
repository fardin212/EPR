"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export type BannerLite = {
  id: number;
  title: string | null;
  link: string | null;
  imageUrl: string;
};

export default function Hero({
  banners,
  heroUrl,
}: {
  banners: BannerLite[];
  heroUrl: string;
}) {
  const items = useMemo(() => (banners?.length ? banners : []), [banners]);
  const [idx, setIdx] = useState(0);
  const hasBanners = items.length > 0;

  const norm = (u?: string | null) => {
    if (!u) return "";
    return u.startsWith("/") ? u : `/${u}`;
  };

  const current = hasBanners ? items[idx] : null;
  const currentSrc = hasBanners ? norm(current?.imageUrl) : norm(heroUrl);

  // اسلایدر
  useEffect(() => {
    if (!hasBanners || items.length <= 1) return;
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % items.length);
    }, 6500);
    return () => clearInterval(t);
  }, [hasBanners, items.length]);

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-[var(--page-bg)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_80%_0,#ffffff,transparent)] opacity-40" />

      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
        
        {/* TEXT */}
        <div className="text-center">

          {/* Badges */}
          <div className="flex justify-center flex-wrap gap-2 mb-6">
            {["شاسی سنگین", "ورق گالوانیزه", "جوش CO₂"].map((txt) => (
              <span
                key={txt}
                className="px-3 py-1 text-xs rounded-md font-bold bg-[#E5E8EC] text-[var(--primary)] border border-[#cfd5dd]"
              >
                {txt}
              </span>
            ))}
          </div>

          {/* H1 سئویی */}
          <h1 className="hero-title text-4xl md:text-5xl leading-[1.3] font-black">
            ساخت تخصصی کانکس{" "}
            <span className="text-[var(--primary)]">ویلایی، اداری و سفارشی</span>
          </h1>

          {/* Sub text */}
          <p className="mt-4 text-[15px] text-[var(--text-mid)] leading-7 max-w-2xl mx-auto">
            تولید مستقیم در کارگاه • کنترل کیفیت مرحله‌ای • تحویل در محل پروژه  
            <br className="hidden sm:block" />
            همراه با مشاوره تخصصی قبل از خرید
          </p>

          {/* CTA */}
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <a href="/order" className="btn btn-primary text-sm px-5">
              ثبت سفارش
            </a>

            <a href="/portfolio" className="btn btn-ghost text-sm px-4">
              نمونه‌کارها
            </a>

            {/* ✅ CTA جدید برای Guides */}
            <a
              href="/guides"
              className="btn btn-ghost text-sm px-4 border border-dashed"
            >
              راهنمای خرید کانکس
            </a>
          </div>

          {/* Trust stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl mx-auto text-center">
            {[
              { k: "ظرفیت تولید", v: "350+ واحد/سال" },
              { k: "زمان تحویل", v: "2–4 هفته" },
              { k: "گارانتی سازه", v: "18 ماه" },
            ].map((item) => (
              <div
                key={item.k}
                className="bg-white border border-[var(--steel)] rounded-xl py-3 shadow-sm"
              >
                <div className="text-[13px] text-[var(--text-light)]">
                  {item.k}
                </div>
                <div className="font-extrabold text-[var(--text-strong)] text-base mt-1">
                  {item.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="relative rounded-2xl overflow-hidden border border-[var(--steel)] shadow-xl">
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={currentSrc}
              alt={current?.title || "ساخت و اجرای کانکس"}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover transition-all duration-500"
            />

            {current?.link && (
              <a
                href={current.link}
                className="absolute inset-0"
                aria-label="banner-link"
              />
            )}

            {current?.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-3 text-sm backdrop-blur">
                {current.title}
              </div>
            )}

            {hasBanners && items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIdx((idx - 1 + items.length) % items.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white grid place-items-center text-black shadow"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((idx + 1) % items.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white grid place-items-center text-black shadow"
                >
                  ›
                </button>

                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  {items.map((b, i) => (
                    <button
                      key={b.id}
                      onClick={() => setIdx(i)}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        i === idx ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="absolute inset-0 ring-1 ring-[#ffffff33]" />
        </div>
      </div>
    </section>
  );
}
