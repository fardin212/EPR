"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Props = { large?: boolean };

const slides = [
  { id: "vila-kolbeh-1", title: "ویلایی کلبه‌ای", tag: "ویلایی", color: "#2f3136" },
  { id: "vila-roofgarden-1", title: "ویلایی رف‌گاردن", tag: "ویلایی", color: "#33363b" },
  { id: "vila-swiss-1", title: "ویلایی سوئیسی", tag: "ویلایی", color: "#2b2d31" },
  { id: "vila-flat-1", title: "ویلایی فلت", tag: "ویلایی", color: "#32353a" },
  { id: "workshop-1", title: "کانکس کارگاهی", tag: "کارگاهی", color: "#2f343a" },
  { id: "food-1", title: "غرفه فست‌فود", tag: "تجاری", color: "#2c3036" },
  { id: "shop-1", title: "کانکس فروشگاهی", tag: "تجاری", color: "#2b2f34" },
];

export default function PortfolioCarousel({ large }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), 3500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    trackRef.current?.scrollTo({
      left: (trackRef.current.clientWidth + 16) * index,
      behavior: "smooth",
    });
  }, [index]);

  return (
    <div className="relative">
      <div ref={trackRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
        {slides.map((s, i) => (
          <div key={s.id} className={clsx("snap-center min-w-[80%] sm:min-w-[45%] lg:min-w-[30%]",
            large && "min-w-[92%] sm:min-w-[80%] lg:min-w-[60%]")}>
            <div className="card">
              <div className="aspect-[16/9] rounded-xl2" style={{ background: s.color }} />
              <div className="flex items-center justify-between mt-3">
                <div className="font-bold">{s.title}</div>
                <span className="text-xs text-brand">{s.tag}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
