// components/landing/BrandsMarquee.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * مارکویز تأمین‌کنندگان — با لوگو + نام
 * لوگوها را داخل /public/logos/suppliers قرار بدهید.
 * مثال: /public/logos/suppliers/zobahan-esfahan.png
 */
type Supplier = {
  name: string;
  logo?: string;   // مسیر نسبی از public (اختیاری)
  href?: string;   // لینک اختیاری به سایت/شبکه اجتماعی
};

const SUPPLIERS: Supplier[] = [
  { name: "فولاد یار گسترش", logo: "/logos/suppliers/fulad-yar.png", href: "#" },
  { name: "آریا آکان", logo: "/logos/suppliers/aria-akan.png", href: "#" },
  { name: "ذوب‌آهن اصفهان", logo: "/logos/suppliers/zobahan-esfahan.png", href: "#" },
  { name: "ورق گالوانیزه سمنان", logo: "/logos/suppliers/galvanize-semnan.png", href: "#" },
  { name: "پروفیل ساوه", logo: "/logos/suppliers/profile-saveh.png", href: "#" },
];

export default function BrandsMarquee() {
  // دو بار پشت‌سرهم برای اسکرول بی‌نهایت
  const items = SUPPLIERS.concat(SUPPLIERS);

  return (
    <section className="py-8 bg-[color:var(--brand-dark)]/40 relative">
      {/* محو دو لبه برای تمیز شدن حرکت */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[color:var(--brand-dark)]/40 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[color:var(--brand-dark)]/40 to-transparent z-10" />

      <div className="overflow-hidden">
        <ul className="marquee flex items-center whitespace-nowrap will-change-transform hover:[animation-play-state:paused]">
          {items.map((s, i) => {
            const body = (
              <span className="mx-8 inline-flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-lg bg-white/90 border border-white/20 overflow-hidden grayscale hover:grayscale-0 transition">
                  {s.logo ? (
                    <Image
                      src={s.logo}
                      alt={`لوگوی ${s.name}`}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs font-black text-slate-800">
                      {s.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                    </span>
                  )}
                </span>
                <span className="font-bold text-[color:var(--text)]/70 hover:text-[color:var(--accent)] transition">
                  {s.name}
                </span>
              </span>
            );

            return (
              <li key={`${s.name}-${i}`} className="inline-block">
                {s.href ? (
                  <Link href={s.href} className="inline-block" aria-label={s.name}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* styled-jsx برای انیمیشن پیوسته */}
      <style jsx>{`
        .marquee {
          animation: scroll 22s linear infinite;
        }
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
