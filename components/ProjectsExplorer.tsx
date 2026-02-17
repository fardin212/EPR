"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type ProjectForClient = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  cover: string;
  coverAlt: string;
};

export default function ProjectsExplorer({
  projects,
}: {
  projects: ProjectForClient[];
}) {
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  const [sortMode, setSortMode] = useState<"newest" | "oldest">("newest");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(projects.map((p) => p.category).filter(Boolean))
      ) as string[],
    [projects]
  );

  const filtered = useMemo(() => {
    let list = [...projects];

    if (activeCat !== "all") {
      list = list.filter((p) => p.category === activeCat);
    }

    if (search.trim()) {
      const s = search.trim();
      list = list.filter(
        (p) =>
          p.title.includes(s) ||
          (p.summary && p.summary.includes(s)) ||
          (p.category && p.category.includes(s))
      );
    }

    list.sort((a, b) =>
      sortMode === "newest" ? b.id - a.id : a.id - b.id
    );

    return list;
  }, [projects, activeCat, sortMode, search]);

  return (
    <div className="flex flex-col gap-4">
      {/* فیلترها / تب‌ها */}
      <div
        className="
          rounded-3xl bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]
          px-3 py-3 sm:px-5 sm:py-4
        "
      >
        {/* تب‌های دسته‌بندی – اسکرول افقی در موبایل */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveCat("all")}
            className={`
              flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold
              ${
                activeCat === "all"
                  ? "border-transparent bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white shadow-md"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }
            `}
          >
            همه پروژه‌ها
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(cat)}
              className={`
                flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold
                ${
                  activeCat === cat
                    ? "border-transparent bg-slate-900 text-white shadow"
                    : "border-slate-200 bg-white text-slate-700"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ردیف جستجو + مرتب‌سازی؛ روی موبایل ستونی می‌شود */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="جستجوی عنوان یا نوع کانکس"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full rounded-2xl border border-slate-200 bg-slate-50/80
              px-4 py-2 text-sm outline-none
              focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100
            "
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortMode("newest")}
              className={`
                flex-1 rounded-2xl px-3 py-2 text-xs font-semibold
                ${
                  sortMode === "newest"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }
              `}
            >
              جدیدترین اول
            </button>
            <button
              type="button"
              onClick={() => setSortMode("oldest")}
              className={`
                flex-1 rounded-2xl px-3 py-2 text-xs font-semibold
                ${
                  sortMode === "oldest"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }
              `}
            >
              قدیمی‌ترها
            </button>
          </div>
        </div>
      </div>

      {/* گرید پروژه‌ها – روی موبایل ۱ستونه، تبلت ۲، دسکتاپ ۳ */}
      <div
        className="
          grid gap-4
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        {filtered.map((p) => (
          <article
            key={p.id}
            className="
              group flex flex-col overflow-hidden
              rounded-3xl bg-white
              shadow-[0_20px_60px_rgba(15,23,42,0.12)]
              transition
              hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.16)]
            "
          >
            {/* تصویر کاور – نسبت ۴:۳ و فول‌عرض، ریسپانسیو */}
            <div className="relative w-full overflow-hidden">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={p.cover}
                  alt={p.coverAlt}
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="
                    h-full w-full object-cover
                    transition-transform duration-500
                    group-hover:scale-105
                  "
                />
              </div>

              {p.category && (
                <span
                  className="
                    absolute bottom-3 left-3 rounded-full
                    bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white
                    backdrop-blur
                  "
                >
                  {p.category}
                </span>
              )}
            </div>

            {/* متن کارت */}
            <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
              <h2 className="line-clamp-2 text-sm font-extrabold text-slate-900">
                {p.title}
              </h2>

              {p.summary && (
                <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
                  {p.summary}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-2">
                <Link
                  href={`/portfolio/${encodeURIComponent(p.slug)}`}
                  className="
                    text-xs font-bold text-sky-600
                    hover:text-sky-700
                  "
                >
                  مشاهده جزئیات پروژه
                </Link>

                <span className="text-[10px] text-slate-400">
                  کد پروژه: #{p.id}
                </span>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            هیچ پروژه‌ای با این فیلترها پیدا نشد.
          </div>
        )}
      </div>
    </div>
  );
}
