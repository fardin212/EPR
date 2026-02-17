"use client";

import Sidebar from "@/app/ui/Sidebar";
import Topbar from "@/app/ui/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* کانتینر اصلی داشبورد */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row-reverse gap-4 lg:gap-6">
          {/* سایدبار (راست در دسکتاپ، بالا در موبایل) */}
          <aside className="lg:w-64">
            <Sidebar />
          </aside>

          {/* بخش اصلی: تاپ‌بار + محتوا */}
          <div className="flex-1 flex flex-col gap-4">
            <Topbar />

            <main className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <div className="space-y-6">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
