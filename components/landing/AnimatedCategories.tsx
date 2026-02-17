"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** لیست دسته‌بندی‌ها (دلخواه و قابل افزایش) */
const CATS: { title: string; href: string }[] = [
  { href: "/portfolio#vila-kolbeh", title: "ویلایی - کلبه‌ای" },
  { href: "/portfolio#vila-roofgarden", title: "ویلایی - روف‌گاردن" },
  { href: "/portfolio#vila-swiss", title: "ویلایی - سوئیسی" },
  { href: "/portfolio#vila-flat", title: "ویلایی - فلت" },
  { href: "/portfolio#workshop", title: "کارگاهی" },
  { href: "/portfolio#food", title: "تجاری - فست‌فود" },
  { href: "/portfolio#shop", title: "تجاری - فروشگاهی" },
];

export default function AnimatedCategories() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // آیا درها باز شده‌اند؟
  const [opened, setOpened] = useState(false);
  // چند کارت تا الان بیرون آمده‌اند (برای نمایش پلّه‌ای)
  const [revealed, setRevealed] = useState(0);

  // تشخیص جهت اسکرول
  const lastYRef = useRef<number>(0);
  const scrollDirRef = useRef<"up" | "down">("down");

  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      scrollDirRef.current = y > lastYRef.current ? "down" : "up";
      lastYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // وقتی سکشن وارد دید شد و جهت، رو به پایین بود → درها باز شوند
  useEffect(() => {
    if (!rootRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const goingDown = scrollDirRef.current === "down";
        if (entry.isIntersecting && goingDown && !opened) {
          setOpened(true);
        }
      },
      { threshold: 0.25 }
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [opened]);

  // پس از باز شدن درها، کارت‌ها یکی‌یکی بیرون بیایند
  useEffect(() => {
    if (!opened) return;
    setRevealed(0);
    const total = CATS.length;
    const step = 140; // فاصله زمانی بین هر کارت (ms)
    let i = 0;
    const t = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= total) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [opened]);

  return (
    <section ref={rootRef} className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">دسته‌بندی‌ها</h2>
        <a href="/portfolio" className="menu-link text-brand">همه نمونه‌کارها</a>
      </div>

      {/* محفظه کانکس */}
      <div className="relative mb-10">
        <div className="mx-auto w-full md:w-[880px] h-[200px] rounded-[28px] bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-black/10 shadow-soft overflow-hidden">
          {/* سقف */}
          <div className="absolute -top-4 inset-x-10 h-4 rounded-full bg-gradient-to-b from-slate-300 to-slate-200 shadow" />
          {/* کف */}
          <div className="absolute -bottom-2 inset-x-6 h-3 rounded-full bg-slate-300/70 blur-[1px]" />
          {/* خط‌های بدنه */}
          <div className="absolute inset-0 opacity-35 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="rib" width="36" height="200" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="200" fill="#cbd5e1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#rib)" />
            </svg>
          </div>

          {/* درِ راست */}
          <div
            className={`door right ${opened ? "open-right" : ""} absolute inset-y-0 right-0 w-1/2 bg-white/80 backdrop-blur ring-1 ring-black/10`}
          />
          {/* درِ چپ */}
          <div
            className={`door left ${opened ? "open-left" : ""} absolute inset-y-0 left-0 w-1/2 bg-white/80 backdrop-blur ring-1 ring-black/10`}
          />

          {/* دستگیره‌ها */}
          <div className="absolute top-1/2 -translate-y-1/2 right-[calc(50%+14px)] w-2 h-8 bg-slate-400/80 rounded" />
          <div className="absolute top-1/2 -translate-y-1/2 left-[calc(50%+14px)]  w-2 h-8 bg-slate-400/80 rounded" />
        </div>
        <div className="mx-auto md:w-[880px] h-6 bg-black/10 blur-xl rounded-full -z-10" />
      </div>

      {/* کارت‌ها؛ فقط تا تعدادِ revealed نمایش/انیمیت می‌شوند */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATS.map((c, i) => (
          <CategoryCard key={c.href} {...c} index={i} active={i < revealed} />
        ))}
      </div>

      <style jsx>{`
        .door {
          transform-style: preserve-3d;
          will-change: transform, opacity, clip-path;
          transition: transform 900ms cubic-bezier(.22,.61,.36,1), opacity 300ms;
          background-image: linear-gradient(180deg, rgba(255,255,255,.92), rgba(248,250,252,.86));
        }
        .door.right { transform-origin: right center; border-left: 1px solid rgba(0,0,0,.06); }
        .door.left  { transform-origin: left  center; border-right:1px solid rgba(0,0,0,.06); }

        .open-right { transform: perspective(1100px) rotateY(-96deg) translateX(8px); opacity: .85; }
        .open-left  { transform: perspective(1100px) rotateY( 96deg) translateX(-8px); opacity: .85; }

        @keyframes popOut {
          0%   { opacity: 0; transform: translateY(28px) scale(.96) rotate(-0.8deg); }
          60%  { opacity: 1; transform: translateY(-6px) scale(1.005) rotate(.3deg); }
          100% { opacity: 1; transform: translateY(0)    scale(1)     rotate(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .door, .open-right, .open-left { transition: none !important; transform: none !important; }
          .pop { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}

/** کارت واحد */
function CategoryCard({
  title,
  href,
  index,
  active, // فقط وقتی true شد، انیمیشن اجرا می‌شود
}: {
  title: string;
  href: string;
  index: number;
  active: boolean;
}) {
  const delayMs = 80 + index * 60; // کمی تاخیر اضافه برای ظرافت بیشتر

  return (
    <Link
      href={href}
      className={`group relative rounded-2xl p-[1px] overflow-hidden ${
        active ? "pop" : "opacity-0 translate-y-7"
      }`}
      style={{
        background:
          "linear-gradient(140deg, rgba(37,99,235,.35), rgba(212,160,23,.25))",
        animation: active ? `popOut 720ms ${delayMs}ms both` : "none",
      }}
    >
      <div className="rounded-2xl bg-white/90 backdrop-blur ring-1 ring-black/5 p-3 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="aspect-[4/3] rounded-xl2 bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center text-slate-400 text-sm select-none">
          تصویر نمونه
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="font-bold">{title}</div>
          <span className="text-xs text-brand">مشاهده نمونه‌ها</span>
        </div>
      </div>

      {/* هاله زیبای هاور */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 blur-2xl"
        style={{
          background:
            "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(37,99,235,.25), transparent 40%)",
        }}
        onMouseMove={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--x", `${e.clientX - rect.left}px`);
          el.style.setProperty("--y", `${e.clientY - rect.top}px`);
        }}
      />
    </Link>
  );
}
