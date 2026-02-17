/* Server Component */
import Link from "next/link";

const MENU = [
  { href: "/", label: "صفحه اصلی" },
  {
    href: "/portfolio",
    label: "نمونه‌کارها",
    children: [
      {
        title: "ویلایی",
        items: [
          { href: "/portfolio#vila-kolbeh", label: "کلبه‌ای" },
          { href: "/portfolio#vila-roofgarden", label: "روف‌گاردن" },
          { href: "/portfolio#vila-swiss", label: "سوئیسی" },
          { href: "/portfolio#vila-flat", label: "فلت" },
        ],
      },
      {
        title: "کارگاهی",
        items: [{ href: "/portfolio#workshop", label: "کانکس کارگاهی" }],
      },
      {
        title: "تجاری",
        items: [
          { href: "/portfolio#food", label: "غرفه فست‌فود" },
          { href: "/portfolio#shop", label: "کانکس فروشگاهی" },
        ],
      },
    ],
  },
  { href: "/used", label: "دست دوم" },
  { href: "/repairs", label: "تعمیرات" },
  { href: "/about", label: "درباره ما" },
];

export default async function NavbarServer() {
  return (
    <header className="site-header">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* برند */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="لوگو" className="w-7 h-7" />
          <span className="font-bold text-[15px]">کانکس نیکان</span>
        </Link>

        {/* منو دسکتاپ */}
        <nav className="hidden md:flex items-center gap-6">
          {MENU.map((m) =>
            m.children ? (
              <div key={m.href} className="relative nav-item">
                <button className="menu-link font-medium">{m.label}</button>
                {/* مگامنو */}
                <div className="nav-dropdown">
                  {m.children.map((col) => (
                    <div key={col.title}>
                      <div className="text-[var(--brand-2)] font-bold mb-2">{col.title}</div>
                      <ul className="space-y-1">
                        {col.items.map((it) => (
                          <li key={it.href}>
                            <Link className="menu-link text-sm" href={it.href}>
                              {it.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={m.href} className="menu-link font-medium" href={m.href}>
                {m.label}
              </Link>
            )
          )}

          {/* CTA طلایی */}
          <Link href="/contact" className="btn btn-brand">تماس با ما</Link>
        </nav>

        {/* موبایل: CTA کافی است، منو در مرحله بعدی اگر لازم شد اضافه می‌کنیم */}
        <div className="md:hidden">
          <Link href="/contact" className="btn btn-brand text-sm py-2">تماس</Link>
        </div>
      </div>
    </header>
  );
}
