// components/landing/ProjectsShowcase.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export type ShowcaseItem = {
  title: string;
  tag?: string;
  cover: string;
  href: string;
  // اختیاری: توضیح خیلی کوتاه (زیر عنوان)
  subtitle?: string;
};

export default function ProjectsShowcase({
  items,
}: {
  items: ShowcaseItem[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {items.map((it, i) => (
        <Link
          href={it.href}
          key={`${it.href}-${i}`}
          className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/7 transition-all duration-200 shadow-[0_10px_28px_rgba(0,0,0,.28)] hover:shadow-[0_16px_40px_rgba(0,0,0,.35)]"
        >
          {/* کاور */}
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            <Image
              src={it.cover}
              alt={it.title}
              fill
              sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 90vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              priority={i < 2}
            />
            {/* اسکرین و تگ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            {it.tag ? (
              <span className="absolute left-3 bottom-3 rounded-full border border-[var(--accent)]/35 bg-[var(--accent)]/18 text-[var(--accent)] px-3 py-1 text-xs font-extrabold">
                {it.tag}
              </span>
            ) : null}
          </div>

          {/* بدنه کارت */}
          <div className="p-3.5">
            <div className="line-clamp-2 font-extrabold text-white leading-7">
              {it.title}
            </div>
            {it.subtitle ? (
              <div className="mt-1 text-sm text-[var(--steel)] line-clamp-1">
                {it.subtitle}
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
