import Link from "next/link";
import { prisma } from "@/lib/db";

/**
 * این کامپوننت Server Component است و دسته‌ها را از دیتابیس می‌خواند.
 * اگر هنوز دیتایی نداشته باشید (DB خالی)، به‌صورت امن یک لیست پیش‌فرض نمایش می‌دهد
 * تا UI صفحه اصلی نخوابد.
 */

export default async function CategoryGrid() {
  // لود دسته‌های ریشه به‌همراه زیرمجموعه‌ها
  const roots = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { id: "asc" },
    include: { children: { orderBy: { id: "asc" } } },
  });

  // اگر دیتابیس خالی بود → فال‌بک به آیتم‌های استاتیک
  const fallback = [
    { title: "ویلایی - کلبه‌ای", href: "/portfolio#vila-kolbeh" },
    { title: "ویلایی - رف‌گاردن", href: "/portfolio#vila-roofgarden" },
    { title: "ویلایی - سوئیسی", href: "/portfolio#vila-swiss" },
    { title: "ویلایی - فلت", href: "/portfolio#vila-flat" },
    { title: "کارگاهی", href: "/portfolio#workshop" },
    { title: "تجاری - فست‌فود", href: "/portfolio#food" },
    { title: "تجاری - فروشگاهی", href: "/portfolio#shop" },
  ];

  // از هر والد، اگر بچه داشت همان‌ها را نشان می‌دهیم؛ وگرنه خودِ والد را
  const leafs =
    roots.length > 0
      ? roots.flatMap((r: any) => (r.children.length ? r.children : [r]))
      : [];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(leafs.length ? leafs.map((c: any) => ({
        title: c.name,
        href: `/category/${c.slug}`,
      })): fallback).map((c: any) => (
        <Link key={c.title} href={c.href} className="card hover:-translate-y-1 transition">
          <div className="aspect-[4/3] rounded-xl2 bg-[linear-gradient(120deg,#2a2a2a,#3a3a3a)] mb-3" />
          <div className="font-bold">{c.title}</div>
          <div className="text-gray-400 text-sm">مشاهده نمونه‌ها</div>
        </Link>
      ))}
    </div>
  );
}
