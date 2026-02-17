// app/admin/(dashboard)/banners/new/page.tsx
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UploadImageField from "@/components/admin/UploadImageField";

function guard() {
  const auth = cookies().get("admin_auth")?.value;
  if (auth !== "1") redirect("/admin/login");
}

export default async function NewBannerPage() {
  guard();

  async function create(formData: FormData) {
    "use server";
    const auth = cookies().get("admin_auth")?.value;
    if (auth !== "1") redirect("/admin/login");

    const titleRaw = String(formData.get("title") ?? "").trim();
    const linkRaw = String(formData.get("link") ?? "").trim();
    const sort = Number(formData.get("sort") ?? 0) || 0;
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();

    if (!imageUrl) throw new Error("تصویر بنر الزامی است.");

    const data: {
      title?: string;
      link?: string;
      sort?: number;
      imageUrl: string;
      active?: boolean;
    } = {
      title: titleRaw || undefined,
      link: linkRaw || undefined,
      sort,
      imageUrl,
      active: true,
    };

    await prisma.banner.create({ data });
    redirect("/admin/banners");
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">بنر جدید</h1>

      <form action={create} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">عنوان (اختیاری)</label>
          <input
            name="title"
            className="w-full rounded-xl border px-3 py-2"
            placeholder="مثلاً کمپین پاییزه"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">لینک (اختیاری)</label>
          <input
            name="link"
            className="w-full rounded-xl border px-3 py-2 ltr"
            placeholder="/order یا https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">مرتب‌سازی</label>
          <input
            name="sort"
            type="number"
            defaultValue={0}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <UploadImageField kind="hero" label="تصویر بنر (Hero)" name="imageUrl" />

        <button className="rounded-xl bg-indigo-600 text-white px-4 py-2">
          ثبت بنر
        </button>
      </form>
    </main>
  );
}
