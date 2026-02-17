"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Item = {
  title: string;
  tag?: string;
  cover: string;
  href: string;
};

type Props = {
  items: Item[];
  speed?: number; // px/sec (auto-scroll). اگر نمی‌خواهید حرکت کند، 0 بدهید
};

export default function RailShowcase({ items, speed = 60 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [loopW, setLoopW] = useState(0);
  const xRef = useRef(0);

  const base = items.length < 4 ? [...items, ...items] : items;
  const tripled = [...base, ...base, ...base];

  // اندازهٔ یک لوپ (عرض یک بار لیست)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // جمع عرض کارت‌های یک بار لیست
    const cards = Array.from(el.children).slice(0, base.length) as HTMLElement[];
    const gap = 20;
    const w =
      cards.reduce((s, c) => s + c.getBoundingClientRect().width, 0) +
      gap * (cards.length - 1);
    if (w > 0) setLoopW(Math.round(w + gap));
  }, [items.length]);

  // اسکرول خودکار
  useEffect(() => {
    if (speed <= 0) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused && loopW > 0 && trackRef.current) {
        xRef.current -= speed * dt;
        if (xRef.current <= -loopW) xRef.current = xRef.current % -loopW;
        trackRef.current.style.transform = `translate3d(${xRef.current}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed, loopW]);

  return (
    <div
      className="rail-wrap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={trackRef} className="rail-track">
        {tripled.map((it, i) => (
          <Link href={it.href} key={`${it.href}-${i}`} className="card">
            <div className="thumb">
              <Image
                src={it.cover}
                alt={it.title}
                fill
                sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 90vw"
                className="object-cover"
                priority={i < base.length}
              />
              <div className="scrim" />
              {it.tag && <span className="chip">{it.tag}</span>}
            </div>
            <div className="body">
              <div className="title">{it.title}</div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .rail-wrap {
          position: relative;
          overflow: hidden;
          padding-block: 8px;
        }
        .rail-track {
          display: flex;
          gap: 20px;
          will-change: transform;
        }
        .card {
          flex: 0 0 auto;
          width: min(36rem, 90vw);
          border-radius: 18px;
          overflow: hidden;
          background: #0b1119;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
          color: #e5e7eb;
          text-decoration: none;
        }
        .thumb {
          position: relative;
          aspect-ratio: 16 / 9;
          background: #111827;
        }
        .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.55),
            rgba(0, 0, 0, 0.05)
          );
        }
        .chip {
          position: absolute;
          left: 12px;
          bottom: 12px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 800;
          border-radius: 999px;
          background: rgba(212, 160, 25, 0.18);
          color: #ffd48a;
          border: 1px solid rgba(212, 160, 25, 0.35);
          z-index: 2;
        }
        .body {
          padding: 10px 14px 14px;
        }
        .title {
          font-weight: 900;
          font-size: 16px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
