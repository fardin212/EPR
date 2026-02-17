// =======================================
// file: components/landing/CategoryShowcase.tsx
// گراید کارت‌های دسته‌بندی با هاله/اورا و افکت شناور
// =======================================
"use client";
import Link from "next/link";

const cats = [
  { href: "/portfolio#vila-kolbeh", title: "ویلایی - کلبه‌ای" },
  { href: "/portfolio#vila-roofgarden", title: "ویلایی - روف‌گاردن" },
  { href: "/portfolio#vila-swiss", title: "ویلایی - سوئیسی" },
  { href: "/portfolio#vila-flat", title: "ویلایی - فلت" },
  { href: "/portfolio#workshop", title: "کارگاهی" },
  { href: "/portfolio#food", title: "تجاری - فست‌فود" },
  { href: "/portfolio#shop", title: "تجاری - فروشگاهی" },
];

export default function CategoryShowcase() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cats.map((c, i) => (
        <Card key={i} href={c.href} title={c.title} />
      ))}
    </div>
  );
}

function Card({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="group relative rounded-2xl p-[1px] overflow-hidden"
      style={{
        background:
          "linear-gradient(140deg, rgba(37,99,235,.35), rgba(212,160,23,.25))",
      }}
    >
      <div className="rounded-2xl bg-white/90 backdrop-blur ring-1 ring-black/5 p-3 transition group-hover:translate-y-[-2px] group-hover:shadow-lg">
        <div className="aspect-[4/3] rounded-xl2 bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center text-slate-400 text-sm select-none">
          تصویر نمونه
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="font-bold">{title}</div>
          <span className="text-xs text-brand">مشاهده نمونه‌ها</span>
        </div>
      </div>
      {/* هاله بیرونی هنگام هاور */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 blur-2xl"
        style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(37,99,235,.25), transparent 40%)" }}
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
