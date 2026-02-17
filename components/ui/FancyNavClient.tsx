// components/NavbarServer.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import DropdownCategories, { Cat } from "@/components/DropdownCategories";
import MobileMenuClient from "@/components/MobileMenuClient";

export default async function NavbarServer() {
  let categories: Cat[] = [];

  try {
    const dbCats = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: {
        children: {
          orderBy: { name: "asc" },
        },
      },
    });

    categories = dbCats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      // @ts-ignore
      children: c.children ?? [],
    }));
  } catch (err) {
    console.error("خطا در خواندن دسته‌ها برای منو:", err);
  }

  const links = [
    { href: "/", label: "صفحه اصلی" },
    { href: "/portfolio", label: "نمونه‌کارها" },
    { href: "/repairs", label: "تعمیرات" },
    { href: "/order", label: "ثبت سفارش" },
    { href: "/about", label: "درباره ما" },
    { href: "/contact", label: "تماس" },
  ];

  return (
    <header
      className="
        sticky top-0 z-40
        bg-gradient-to-l from-slate-900 via-blue-900 to-blue-700
        shadow-xl border-b border-slate-900/60
        backdrop-blur-xl
      "
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-[72px] flex items-center justify-between gap-4">
        {/* لوگو */}
        <Link href="/" className="shrink-0 flex items-center">
          <img
            src="/logos/logo.png"
            alt="کانکس نیکان"
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        {/* منوی دسکتاپ */}
        <nav className="hidden lg:flex items-center gap-6 text-[14px] text-slate-50">
          <DropdownCategories categories={categories} label="دسته‌بندی‌ها" />

          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nk-link px-1 py-1 font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA و منوی موبایل */}
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="
              hidden sm:inline-flex items-center justify-center
              rounded-full px-4 py-2 text-sm font-bold
              text-sky-100 shadow-md
              bg-gradient-to-r from-sky-500 via-emerald-400 to-lime-400
              hover:from-emerald-400 hover:to-sky-500
              transition
            "
          >
            مشاوره و تماس
          </Link>

          {/* منوی موبایل */}
          <div className="lg:hidden">
            <MobileMenuClient categories={categories} links={links} />
          </div>
        </div>
      </div>
    </header>
  );
}
