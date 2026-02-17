// components/NavbarServer.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import DropdownCategories, { Cat } from "@/components/DropdownCategories";
import MobileMenuClient from "@/components/MobileMenuClient";

type NavItem = {
  key: string;
  label: string;
  href?: string;
  kind?: "default" | "categories" | "cta";
  children?: NavItem[];
};

/** منوی پیش‌فرض وقتی mainNavJson خالی یا خراب است */
const DEFAULT_NAV: NavItem[] = [
  { key: "home", label: "صفحه اصلی", href: "/" },

  // کانکس‌ها: فقط دراپ‌داون دسته‌بندی‌ها
  { key: "products", label: "کانکس‌ها", kind: "categories" },

  // نمونه‌کارها: لیست پروژه‌ها (مسیر صحیح فرانت: /portfolio)
  { key: "projects", label: "نمونه‌کارها", href: "/portfolio" },

  // ✅ راهنماها (جدید) — هم لینک اصلی دارد (برای موبایل)، هم زیرمنو (برای دسکتاپ)
  {
    key: "guides",
    label: "راهنماها",
    href: "/guides",
    children: [
      { key: "guide-root", label: "همه راهنماها", href: "/guides" },
      { key: "guide-kanex", label: "کانکس چیست؟", href: "/guides/kanex" },
      {
        key: "guide-villa",
        label: "راهنمای کانکس ویلایی",
        href: "/guides/kanex-villa",
      },
      {
        key: "guide-price-villa",
        label: "قیمت کانکس ویلایی",
        href: "/guides/price-kanex-villa",
      },
    ],
  },

  // خدمات: زیرمنو برای انواع سفارش
  {
    key: "services",
    label: "خدمات",
    children: [
      {
        key: "order-conex",
        label: "ثبت سفارش کانکس",
        href: "/order?type=conex",
      },
      {
        key: "order-container",
        label: "ثبت سفارش کانتینر",
        href: "/order?type=container",
      },
      {
        key: "order-repair",
        label: "درخواست تعمیرات",
        href: "/order?type=repair",
      },
    ],
  },

  { key: "about", label: "درباره ما", href: "/about" },
  { key: "contact", label: "تماس با ما", href: "/contact" },
];

function normalizeNav(raw: any[]): NavItem[] {
  return raw
    .map((it, idx) => {
      if (!it || typeof it !== "object") return null;

      const key = String(it.key || `item-${idx}`);
      const label = typeof it.label === "string" ? it.label : "";
      if (!label) return null;

      const href =
        typeof it.href === "string" && it.href.trim().length
          ? it.href.trim()
          : undefined;

      const kind: NavItem["kind"] =
        it.kind === "categories" || it.kind === "cta" ? it.kind : "default";

      const children = Array.isArray(it.children)
        ? normalizeNav(it.children)
        : undefined;

      return { key, label, href, kind, children };
    })
    .filter(Boolean) as NavItem[];
}

export default async function NavbarServer() {
  let categories: Cat[] = [];
  let navItems: NavItem[] = DEFAULT_NAV;
  let logoUrl: string | null = null;

  // خواندن دسته‌بندی‌ها برای منوی کانکس‌ها
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
      // @ts-ignore – children در تایپ Cat به‌صورت ساده تعریف شده
      children: c.children ?? [],
    }));
  } catch (err) {
    console.error("خطا در خواندن دسته‌ها برای منو:", err);
  }

  // خواندن تنظیمات سایت برای لوگو و JSON منو
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 1 },
      select: {
        logoUrl: true,
        // mainNavJson: رشته JSON قابل‌تنظیم از ادمین
        mainNavJson: true as any,
      },
    });

    logoUrl = settings?.logoUrl ?? null;

    if (settings?.mainNavJson) {
      try {
        const parsed = JSON.parse(settings.mainNavJson);
        if (Array.isArray(parsed)) {
          const normalized = normalizeNav(parsed);
          if (normalized.length) {
            navItems = normalized;
          }
        }
      } catch (e) {
        console.error("NAV_JSON_PARSE_ERROR", e);
      }
    }
  } catch (err) {
    console.error("خطا در خواندن SiteSetting برای منو:", err);
  }

  // لینک‌های ساده برای منوی موبایل (فقط آیتم‌هایی که href دارند)
  // نکته: برای اینکه «راهنماها» در موبایل هم دیده شود، در DEFAULT_NAV برای آن href گذاشته شده.
  const mobileLinks = navItems
    .filter((it) => it.href)
    .map((it) => ({ href: it.href as string, label: it.label }));

  const finalLogoSrc = logoUrl || "/logos/logo.png";

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
          {/* @ts-ignore – تایپ Image در این پروژه با JSX قاطی کرده، در رانتایم مشکلی نیست */}
          <Image
            src={finalLogoSrc}
            alt="کانکس نیکان"
            width={140}
            height={56}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        {/* منوی دسکتاپ */}
        <nav className="hidden lg:flex items-center gap-6 text-[14px] text-slate-50">
          {navItems.map((item) => (
            <DesktopNavItem key={item.key} item={item} categories={categories} />
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
            <MobileMenuClient categories={categories} links={mobileLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}

/** رندر آیتم‌های منوی دسکتاپ (لینک ساده، دراپ‌داون خدمات، دراپ‌داون دسته‌بندی‌ها) */
function DesktopNavItem({
  item,
  categories,
}: {
  item: NavItem;
  categories: Cat[];
}) {
  // آیتم مخصوص «دسته‌بندی‌ها» که DropdownCategories را نشان می‌دهد
  if (item.kind === "categories") {
    return (
      <DropdownCategories
        categories={categories}
        label={item.label || "دسته‌بندی‌ها"}
      />
    );
  }

  // آیتم با زیرمنو (مثلاً «خدمات» یا «راهنماها»)
  if (item.children && item.children.length > 0) {
    return (
      <div className="relative group">
        <button
          type="button"
          className="nk-link px-1 py-1 font-medium inline-flex items-center gap-1"
        >
          <span>{item.label}</span>
          <span className="text-[10px]">▾</span>
        </button>

        <div
          className="
            invisible opacity-0 group-hover:visible group-hover:opacity-100
            absolute top-full right-0 mt-2 min-w-[200px]
            rounded-xl bg-white text-slate-900 shadow-lg border border-slate-200
            py-2 z-50
          "
        >
          {item.children.map(
            (child) =>
              child.href && (
                <Link
                  key={child.key}
                  href={child.href}
                  className="block px-3 py-1.5 text-sm hover:bg-slate-100"
                >
                  {child.label}
                </Link>
              )
          )}
        </div>
      </div>
    );
  }

  // لینک ساده
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="nk-link px-1 py-1 font-medium inline-flex items-center"
      >
        {item.label}
      </Link>
    );
  }

  return null;
}
