import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    categories,
    projects,
    banners,
    orders,
    articles,
    openChats,

    // ✅ Guides
    guides,

    // ✅ Used Conex
    usedConexCount,
    usedConexLeadsCount,
    usedConexNewLeadsCount,

    // ✅ Reviews
    reviewsPending,
    reviewsApproved,
  ] = await Promise.all([
    safeCount(() => prisma.category.count()),
    safeCount(() => prisma.project.count()),
    safeCount(() => prisma.banner.count()),
    safeCount(() => prisma.order.count()),
    safeCount(() => prisma.post.count()),
    safeCount(() =>
      prisma.chatSession.count({
        // where: { status: "OPEN" }
      })
    ),

    // ✅ NEW: guides
    safeCount(() => (prisma as any).guide.count()),

    // ✅ NEW: used conex
    safeCount(() => prisma.usedConex.count()),
    safeCount(() => prisma.usedConexLead.count()),
    safeCount(() => prisma.usedConexLead.count({ where: { status: "new" as any } })),

    // ✅ NEW: reviews
    safeCount(() => prisma.siteReview.count({ where: { status: "pending" as any } })),
    safeCount(() => prisma.siteReview.count({ where: { status: "approved" as any } })),
  ]);

  const sessionsRaw = await safeAny(() =>
    prisma.chatSession.findMany({
      take: 50,
      orderBy: { id: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, createdAt: true, content: true },
        },
      },
    })
  );

  const sessions = (sessionsRaw as any[])
    .map((s) => {
      const lastMsgAt = s.messages?.[0]?.createdAt
        ? new Date(s.messages[0].createdAt).getTime()
        : 0;
      const upd = s.updatedAt ? new Date(s.updatedAt).getTime() : 0;
      const crt = s.createdAt ? new Date(s.createdAt).getTime() : 0;
      const lastActive = new Date(Math.max(lastMsgAt, upd, crt) || Date.now());
      return { ...s, lastActive };
    })
    .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
    .slice(0, 5);

  return (
    <main className="space-y-6 text-foreground">
      {/* Header */}
      <header className="rounded-2xl bg-gradient-to-l from-[var(--btn-grad-from)] via-[var(--btn-grad-via)] to-[var(--btn-grad-to)] px-5 py-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold">داشبورد کانکس نیکان</h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1">
            نمای کلی از وضعیت سایت، سفارش‌ها، پیام‌ها و نظرات مشتریان
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-white/85">
          <span className="px-2 py-1 rounded-full bg-white/10 border border-white/20">
            دسته‌ها: {categories}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/10 border border-white/20">
            نمونه‌کارها: {projects}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/10 border border-white/20">
            نظرات در انتظار: {reviewsPending}
          </span>
        </div>
      </header>

      {/* Stats */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="دسته‌ها" value={categories} href="/admin/categories" />
        <StatCard title="نمونه‌کارها" value={projects} href="/admin/projects" />
        <StatCard title="بنرها" value={banners} href="/admin/banners" />
        <StatCard title="سفارش‌ها" value={orders} href="/admin/orders" />
        <StatCard title="مقالات" value={articles} href="/admin/articles" />

        {/* ✅ NEW: Guides */}
        <StatCard title="راهنماها (Guides)" value={guides} href="/admin/guides" />

        <StatCard title="گفت‌وگوهای باز" value={openChats} href="/admin/chat" />

        {/* ✅ Used Conex */}
        <StatCard title="کانکس‌های دست دوم" value={usedConexCount} href="/admin/used-conex" />
        <StatCard title="لیدهای کانکس دست دوم" value={usedConexLeadsCount} href="/admin/used-conex/leads" />
        <StatCard
          title="لیدهای جدید (دست دوم)"
          value={usedConexNewLeadsCount}
          href="/admin/used-conex/leads?status=new"
        />

        {/* ✅ Reviews */}
        <StatCard
          title="نظرات در انتظار تایید"
          value={reviewsPending}
          href="/admin/reviews?status=pending"
        />
        <StatCard
          title="نظرات تایید شده"
          value={reviewsApproved}
          href="/admin/reviews?status=approved"
        />
      </section>

      {/* Quick actions */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-foreground">دسترسی سریع</h2>
          <div className="text-xs text-muted-foreground">میانبرهای مدیریتی برای سرعت بیشتر</div>
        </div>

        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <QuickLink href="/admin/guides" label="مدیریت راهنماها (Guides)" />
          <QuickLink href="/admin/guides/new" label="ایجاد راهنمای جدید" />

          <QuickLink href="/admin/reviews" label="مدیریت نظرات سایت" />
          <QuickLink href="/admin/reviews?status=pending" label="نظرات در انتظار تایید" />

          <QuickLink href="/admin/used-conex" label="مدیریت کانکس دست دوم" />
          <QuickLink href="/admin/used-conex/leads" label="مدیریت لیدهای دست دوم" />
          <QuickLink href="/admin/used-conex/leads/dashboard" label="داشبورد لیدها" />
          <QuickLink href="/admin/telegram-test" label="تست تلگرام (ادمین)" />
        </div>
      </section>

      {/* Chats + Tasks */}
      <section className="grid lg:grid-cols-2 gap-4">
        {/* Latest chats */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground">آخرین پیام‌های چت</h2>
            <Link href="/admin/chat" className="text-sm text-[var(--brand-blue)] hover:underline">
              مدیریت چت‌ها
            </Link>
          </div>

          <div className="divide-y divide-border">
            {sessions.length ? (
              sessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/chat/${s.id}`}
                  className="block py-3 hover:bg-muted/40 rounded-lg px-2 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-foreground">
                      {s.name || "کاربر"} <span className="text-muted-foreground">#{s.id}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.lastActive.toLocaleString("fa-IR")}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {s.messages?.[0]?.content || "—"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-6 text-center">پیامی یافت نشد.</div>
            )}
          </div>
        </div>

        {/* Pending tasks */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground">وظایف در انتظار</h2>
            <Link href="/admin/projects" className="text-sm text-[var(--brand-blue)] hover:underline">
              مشاهده همه
            </Link>
          </div>

          <ul className="space-y-2 text-sm text-foreground">
            <li className="rounded-lg bg-muted/40 border border-border p-3">
              تکمیل توضیحات برخی نمونه‌کارها
            </li>
            <li className="rounded-lg bg-muted/40 border border-border p-3">
              بررسی سفارش‌های جدید
            </li>
            <li className="rounded-lg bg-muted/40 border border-border p-3">
              آپلود یا بروزرسانی بنر صفحه اصلی
            </li>
            <li className="rounded-lg bg-muted/40 border border-border p-3">
              بررسی لیدهای جدید کانکس دست دوم و تماس سریع
            </li>
            <li className="rounded-lg bg-muted/40 border border-border p-3">
              بررسی نظرات جدید سایت و تایید موارد معتبر
            </li>
            <li className="rounded-lg bg-muted/40 border border-border p-3">
              ساخت و تکمیل راهنماهای جدید (Guides) برای کلیدواژه‌های اصلی
            </li>
          </ul>

          <div className="mt-3">
            <Link
              href="/admin/reviews?status=pending"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-blue)] hover:underline"
            >
              رفتن به نظرات در انتظار تایید
              <span className="px-2 py-0.5 rounded-full bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 text-xs">
                {reviewsPending}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* helpers */
async function safeCount(fn: () => Promise<number>) {
  try {
    return await fn();
  } catch {
    return 0;
  }
}

async function safeAny<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch {
    return [] as any;
  }
}

function StatCard({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-4 hover:border-[var(--brand-blue)] hover:shadow-md transition block"
    >
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-extrabold text-[var(--brand-blue)]">{value}</span>
        <span className="text-xs text-muted-foreground">مورد</span>
      </div>
    </Link>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm hover:bg-muted/60 hover:border-[var(--brand-blue)] transition"
    >
      {label}
    </Link>
  );
}
