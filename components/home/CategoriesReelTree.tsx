"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type CatNodeLite = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  level: number;           // 0 = ریشه، 1 = زیر‌دسته، 2 = زیر‌زیر‌دسته...
  parentPath?: string[];   // برای نمایش مسیر والد‌ها
};

export default function CategoriesReelTree({ items }: { items: CatNodeLite[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // افکت ظاهرشدن آرام
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll("[data-cat-card]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const t = e.target as HTMLElement;
            t.classList.add("opacity-100", "translate-y-0");
            t.classList.remove("opacity-0", "translate-y-2");
          }
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const dx = Math.round(el.clientWidth * 0.85) * dir;
    el.scrollBy({ left: dx, behavior: "smooth" });
  };

  // اندازه کارت بر اساس level
  const sizeFor = (lvl: number) => {
    if (lvl <= 0) return "w-56 h-36";     // ریشه بزرگ‌تر
    if (lvl === 1) return "w-48 h-32";
    return "w-44 h-28";                    // سطوح عمیق‌تر
  };

  return (
    <div className="relative">
      <button
        onClick={() => scrollBy(-1)}
        disabled={!canLeft}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 text-zinc-800 shadow border border-zinc-200 disabled:opacity-40"
        aria-label="اسکرول به چپ"
      >
        ‹
      </button>
      <button
        onClick={() => scrollBy(1)}
        disabled={!canRight}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 text-zinc-800 shadow border border-zinc-200 disabled:opacity-40"
        aria-label="اسکرول به راست"
      >
        ›
      </button>

      <div
        ref={scrollerRef}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-3 px-1 py-2"
      >
        {items.map((c, i) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="snap-start shrink-0 group"
          >
            <article
              data-cat-card
              style={{ transitionDelay: `${i * 40}ms` }}
              className={`${sizeFor(c.level)} relative opacity-0 translate-y-2 transition-all duration-500 rounded-2xl border border-zinc-200/70 bg-white overflow-hidden`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={
                    c.imageUrl || "/images/placeholders/category-4x3.webp"
                  }
                  alt={c.name}
                  fill
                  className="object-cover"
                  sizes="(min-width:1024px) 20vw, (min-width:640px) 40vw, 80vw"
                />
                {/* روشنایی پایین برای خوانایی متن */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                {/* مسیر والد‌ها (اختیاری) */}
                {c.parentPath?.length ? (
                  <div className="absolute top-1.5 right-2 left-2 text-[11px] text-white/80 truncate">
                    {c.parentPath.join(" / ")}
                  </div>
                ) : null}

                <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between">
                  <h3 className="text-white font-bold drop-shadow">{c.name}</h3>
                  <span className="text-white/90 text-[11px] bg-black/30 rounded-full px-2 py-0.5">
                    مشاهده
                  </span>
                </div>

                {/* نواری باریک برای تمایز سطح */}
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5"
                  style={{
                    background:
                      c.level === 0
                        ? "var(--accent)"
                        : c.level === 1
                        ? "rgba(255,255,255,.65)"
                        : "rgba(255,255,255,.35)",
                  }}
                />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
