"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type ReelItem = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  subtitle?: string | null;
};

type Props = {
  items: ReelItem[];
  /** px/sec */
  speed?: number;          // default 50
  pauseOnHover?: boolean;  // default true
  gap?: number;            // فاصله کارت‌ها (px)
};

export default function CategoriesReel({
  items,
  speed = 60,
  pauseOnHover = false,
  gap = 18,
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [loopW, setLoopW] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const xRef = useRef(0);

  const base = items.length < 6 ? [...items, ...items] : items;
  const tripled = [...base, ...base, ...base];

  const measure = () => {
    const track = trackRef.current;
    if (!track || base.length === 0) return;

    const cards = Array.from(track.children).slice(0, base.length) as HTMLElement[];
    if (!cards.length) return;

    const widths = cards.map((el) => el.getBoundingClientRect().width);
    const sum = widths.reduce((a, b) => a + b, 0);
    const total = Math.round(sum + gap * (cards.length - 1));

    const a = cards[0].getBoundingClientRect();
    const b = cards[cards.length - 1].getBoundingClientRect();
    const bboxWidth = Math.round(b.right - a.left);

    const w = Math.max(total, bboxWidth);
    if (w > 0) {
      setLoopW(w + gap);
      setReady(true);
    }
  };

  useLayoutEffect(() => {
    measure();
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1000);
    const t3 = setTimeout(measure, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, gap]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!paused && loopW > 0) {
        xRef.current -= speed * dt;
        if (xRef.current <= -loopW) xRef.current = xRef.current % -loopW;
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${xRef.current}px,0,0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed, loopW]);

  return (
    <div
      ref={outerRef}
      className={`nk-reel-outer ${pauseOnHover ? "can-pause" : ""}`}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      style={{ ["--gap" as any]: `${gap}px` }}
    >
      <div ref={trackRef} className={`nk-reel-track ${ready ? "is-ready" : ""}`}>
        {tripled.map((c, i) => (
          <Link href={`/category/${c.slug}`} key={`${c.id}-${i}`} className="nk-reel-card" title={c.name}>
            <div className="nk-reel-thumb">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  sizes="(min-width:1280px) 220px, (min-width:768px) 260px, 44vw"
                  className="object-cover"
                  priority={i < base.length}
                />
              ) : <div className="nk-fallback" />}
              {c.subtitle ? <span className="nk-badge">{c.subtitle}</span> : null}
              <div className="nk-scrim" />
            </div>
            <div className="nk-reel-title">{c.name}</div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        /* کانتینر مرکزی با حداکثر 1200px */
        .nk-reel-outer {
          position: relative;
          overflow: hidden;
          padding: 10px 16px;
          border-radius: 20px;
          max-width: 1200px;
          margin-inline: auto;
        }

        .nk-reel-track {
          display: flex;
          align-items: stretch;
          width: max-content;
          gap: var(--gap);
          will-change: transform;
          transform: translate3d(0,0,0);
        }

        /* تعداد کارت در هر ردیف — پیش‌فرض موبایل: 2 */
        :root { --per: 2; }
        @media (min-width: 768px) { :root { --per: 3; } }   /* تبلت: 3 */
        @media (min-width: 1280px) { :root { --per: 5; } }  /* دسکتاپ: 5 */

        /* عرض کارت‌ها: دقیقاً 5 کارت در ردیف دسکتاپ */
        .nk-reel-card {
          flex: 0 0 auto;
          /* فرمول: از عرض کانتینر مرکزی (min(1200px, 100vw - 32px))، فاصله‌های بین کارت‌ها را کم، تقسیم بر تعداد کارت‌ها */
          width: calc((min(1200px, 100vw - 32px) - (var(--per) - 1) * var(--gap)) / var(--per));
          border-radius: 18px;
          overflow: hidden;
          background: #0f1720;
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 12px 28px rgba(0,0,0,.28);
          color: #e5e7eb;
          text-decoration: none;
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
        }
        .nk-reel-card:hover {
          transform: translateY(-2px);
          border-color: rgba(212,160,25,.6);
          box-shadow: 0 16px 36px rgba(0,0,0,.32);
        }

        .nk-reel-thumb { position: relative; aspect-ratio: 4 / 3; background:#0b1119; }
        .nk-fallback { width:100%; height:100%; background: linear-gradient(135deg, #1f2937, #111827); }
        .nk-scrim { position:absolute; inset:0; background: linear-gradient(to top, rgba(0,0,0,.50), rgba(0,0,0,.08)); }

        .nk-badge {
          position: absolute; top: 10px; right: 10px;
          padding: 4px 10px; font-size: 12px; font-weight: 800;
          border-radius: 999px; background: rgba(212,160,25,.18);
          color: #ffd48a; border: 1px solid rgba(212,160,25,.35); z-index: 2;
        }
        .nk-reel-title { font-weight: 900; font-size: 17px; padding: 12px 14px 14px; }

        @media (prefers-reduced-motion: reduce) {
          .nk-reel-track { transform: none !important; }
        }
      `}</style>
    </div>
  );
}
