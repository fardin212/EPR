// app/admin/layout.tsx
import { ReactNode } from "react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background/60 text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 grid gap-4 lg:grid-cols-[260px,1fr]">

        {/* Sidebar */}
        <aside
          className="
            admin-sidebar              /* 👈 کلاس مخصوص سایدبار */
            h-fit sticky top-24
            rounded-2xl bg-card/90 backdrop-blur-md
            border border-border/80 shadow-sm
            px-3 py-4 flex flex-col gap-4
            relative z-[5]           /* 👈 بیار بالا روی تمام لایه‌ها */
          "
        >
          <div className="px-2">
            <p className="text-xs font-bold text-foreground">مدیریت سایت</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              افزودن دسته‌ها، نمونه‌کارها و بررسی سفارش‌ها و پیام‌های مشتریان
            </p>
          </div>

          <hr className="border-t border-border/70 my-1" />
          <AdminNav />
        </aside>

        {/* Main */}
        <section className="rounded-2xl bg-card border border-border/80 shadow-sm p-4 lg:p-6 text-foreground relative z-[10]">
          {children}
        </section>
      </div>
    </div>
  );
}
