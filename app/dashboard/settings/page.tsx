// app/dashboard/settings/page.tsx
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminGuard";
import UsersAdminClient from "./ui/UsersAdminClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تنظیمات و مدیریت کاربران | ERP نیکان",
};

export default async function SettingsPage() {
  // ✅ گارد واقعی: فقط ADMIN
  await requireAdmin();

  return (
    <div className="space-y-6" dir="rtl">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">تنظیمات سیستم و کاربران</h2>
        <p className="text-[13px] text-slate-500">
          این بخش فقط برای مدیر سیستم (ADMIN) فعال است: تعریف کاربر جدید، تعیین سطح دسترسی و مدیریت کاربران.
        </p>
      </header>

      <UsersAdminClient />
    </div>
  );
}
