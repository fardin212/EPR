import Section from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import Empty from "@/components/ui/Empty";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "دسته‌بندی کانکس‌ها و سازه‌های پیش‌ساخته | کانکس نیکان",
  description:
    "همه دسته‌بندی‌های کانکس و سازه‌های پیش‌ساخته کانکس نیکان؛ شامل کانکس ویلایی، اداری، کارگاهی، فروشگاهی، نگهبانی و سایر مدل‌ها به‌همراه زیر‌دسته‌ها و نمونه‌کارهای مرتبط.",
};

export default async function CategoriesPage() {
  // همه‌ی دسته‌های مادر به‌همراه فرزندان + خلاصه + تصویر + تعداد پروژه‌ها
  const parents = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      summary: true,
      imageUrl: true,
      _count: {
        select: {
          children: true,
          projects: true,
        },
      },
      children: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return (
    <Section
      title="دسته‌بندی کانکس‌ها و سازه‌های پیش‌ساخته"
      subtitle="از اینجا می‌توانید مناسب‌ترین دسته را بر اساس نوع کاربری، متراژ و محل نصب انتخاب کنید."
    >
      {parents.length === 0 ? (
        <Empty hint="ابتدا از پنل ادمین دسته‌ها را بسازید." />
      ) : (
        <div className="space-y-4">
          {parents.map((p: any) => (
            <Card
              key={p.id}
              className="overflow-hidden border border-[var(--line)] bg-[var(--surface)]/70 hover:shadow-md transition-shadow"
            >
              <CardBody>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* تصویر دسته مادر */}
                  <div className="w-full md:w-48 shrink-0">
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                      <Image
                        src={p.imageUrl || "/images/fallback-metal.jpg"}
                        alt={`کانکس ${p.name}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 190px, 100vw"
                      />
                    </div>
                  </div>

                  {/* متن و لینک‌ها */}
                  <div className="flex-1 flex flex-col gap-3">
                    {/* عنوان + لینک اصلی */}
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/category/${p.slug}`}
                        className="font-bold text-[15px] md:text-base hover:text-[var(--brand)] transition"
                      >
                        {p.name}
                      </Link>

                      <Link
                        href={`/category/${p.slug}`}
                        className="text-[11px] md:text-xs text-[var(--muted)] hover:text-[var(--brand)] transition"
                        aria-label={`مشاهده «${p.name}»`}
                      >
                        ← ورود به صفحه {p.name}
                      </Link>
                    </div>

                    {/* خلاصه دسته */}
                    {p.summary && (
                      <p className="text-xs md:text-sm text-[var(--muted)] leading-6">
                        {p.summary}
                      </p>
                    )}

                    {/* آمار کوچک سئویی: تعداد زیر‌دسته و پروژه */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] md:text-xs text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg)] px-2 py-1 border border-[var(--line)]">
                        <span className="w-1 h-1 rounded-full bg-[var(--brand)]" />
                        {p._count.children > 0 ? (
                          <>
                            {p._count.children} زیر‌دسته ثبت شده
                          </>
                        ) : (
                          <>بدون زیر‌دسته</>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg)] px-2 py-1 border border-[var(--line)]">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        {p._count.projects > 0 ? (
                          <>
                            {p._count.projects} نمونه‌کار در این دسته
                          </>
                        ) : (
                          <>هنوز نمونه‌کاری ثبت نشده</>
                        )}
                      </span>
                    </div>

                    {/* زیرمجموعه‌ها */}
                    {p.children.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {p.children.map((c: any) => (
                          <Link
                            key={c.id}
                            href={`/category/${c.slug}`}
                            className="px-3 py-1 rounded-full border border-[var(--line)] bg-[var(--bg)] text-[11px] md:text-xs hover:text-[var(--brand)] hover:border-[var(--brand)] transition"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 text-[11px] md:text-xs text-[var(--muted)]">
                        برای این دسته هنوز زیر‌دسته‌ای تعریف نشده است.
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
