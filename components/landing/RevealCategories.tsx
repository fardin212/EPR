"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export type CategoryItem = {
  title: string;
  href: string;
  cover?: string;
};

type Props = {
  title?: string;
  items: CategoryItem[];
  cols?: 2 | 3;
  once?: boolean;
  stepMs?: number;
};

export default function RevealCategories({
  title = "دسته‌بندی‌ها",
  items,
  cols = 3,
  once = true,
  stepMs = 90,
}: Props) {
  const [visible, setVisible] = useState<boolean[]>(
    () => new Array(items.length).fill(false)
  );

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  refs.current = useMemo(() => Array(items.length).fill(null), [items.length]);

  const lastY = useRef(0);
  const dir = useRef<"down" | "up">("down");
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      dir.current = y > lastY.current ? "down" : "up";
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (dir.current !== "down") return;
        const toReveal: number[] = [];
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.index);
          if (!visible[idx]) toReveal.push(idx);
        }
        if (toReveal.length) {
          toReveal
            .sort((a, b) => a - b)
            .forEach((i, k) => {
              setTimeout(() => {
                setVisible((prev) => {
                  const next = [...prev];
                  next[i] = true;
                  return next;
                });
                if (once && refs.current[i]) io.unobserve(refs.current[i]!);
              }, k * stepMs);
            });
        }
      },
      { threshold: 0.25 }
    );

    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, once, stepMs]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12" id="categories">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {title}
        </h2>
        <Link href="/portfolio" className="menu-link text-brand">
          همه نمونه‌کارها
        </Link>
      </div>

      <div
        className={`grid gap-5 sm:grid-cols-2 ${
          cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        {items.map((it, i) => (
          <div
            key={it.href + i}
            data-index={i}
            ref={(el) => { refs.current[i] = el; }}
            className={`relative rounded-2xl p-[1px] overflow-hidden transition ${
              visible[i] ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background:
                "linear-gradient(140deg, rgba(37,99,235,.28), rgba(212,160,23,.22))",
            }}
          >
            <Link
              href={it.href}
              className={`block rounded-2xl bg-white/90 backdrop-blur ring-1 ring-black/5 p-3 transform-gpu ${
                visible[i]
                  ? "animate-[popOut_700ms_both]"
                  : "translate-y-6 blur-[2px]"
              }`}
              style={
                visible[i]
                  ? { animationDelay: `${i * stepMs * 0.4}ms` }
                  : undefined
              }
            >
              <div className="aspect-[4/3] rounded-xl2 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center">
                {it.cover ? (
                  <img
                    src={it.cover}
                    alt={it.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-400 text-sm select-none">
                    تصویر نمونه
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="font-bold">{it.title}</div>
                <span className="text-xs text-brand">مشاهده نمونه‌ها</span>
              </div>
            </Link>

            <div
              className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition duration-300 blur-2xl"
              style={{
                background:
                  "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(37,99,235,.22), transparent 40%)",
              }}
              onMouseMove={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                const r = el.getBoundingClientRect();
                el.style.setProperty("--x", `${e.clientX - r.left}px`);
                el.style.setProperty("--y", `${e.clientY - r.top}px`);
              }}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes popOut {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.96);
            filter: blur(2px);
          }
          60% {
            opacity: 1;
            transform: translateY(-6px) scale(1.01);
            filter: blur(0.5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\[popOut_700ms_both\] {
            animation: none !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </section>
  );
}
