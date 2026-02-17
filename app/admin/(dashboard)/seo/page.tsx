// app/admin/(dashboard)/seo/page.tsx
import SeoPagesTable from "@/components/admin/seo/SeoPagesTable";

export const dynamic = "force-dynamic";

export default function SeoDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
        <h1 className="text-lg font-bold text-slate-900">
          آنالیز سئوی صفحات سایت
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          این بخش مثل یک پنل داخلی جت‌سئو برای سایت خودت عمل می‌کند. همه‌ی
          صفحات مهم (دسته‌بندی‌ها، نمونه‌کارها، مقالات و صفحات استاتیک) در
          این‌جا لیست می‌شوند، می‌توانی برای هر صفحه کلمه‌ی کلیدی اصلی تعیین
          کنی، صفحه را تحلیل کنی و با یک کلیک به فرم ویرایش سئو و محتوا بروی.
        </p>
      </div>

      <SeoPagesTable />
    </div>
  );
}
