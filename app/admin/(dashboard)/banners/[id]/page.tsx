// app/admin/(dashboard)/banners/[id]/page.tsx
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import UploadImageField from "@/components/admin/UploadImageField";

function guard() {
  const auth = cookies().get("admin_auth")?.value;
  if (auth !== "1") redirect("/admin/login");
}

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  guard();
  const { id } = await params;
  const bid = Number(id);

  const banner = await prisma.banner.findUnique({ where: { id: bid } });
  if (!banner) notFound();

  async function update(formData: FormData) {
    "use server";
    const auth = cookies().get("admin_auth")?.value;
    if (auth !== "1") redirect("/admin/login");

    const titleRaw = String(formData.get("title") ?? "").trim();
    const linkRaw = String(formData.get("link") ?? "").trim();
    const sort = Number(formData.get("sort") ?? 0) || 0;
    const imageUrlRaw = String(formData.get("imageUrl") ?? "").trim();

    const current = await prisma.banner.findUnique({
      where: { id: bid },
      select: { title: true, link: true, imageUrl: true },
    });

    const data: {
      title?: string;
      link?: string;
      sort?: number;
      imageUrl?: string;
    } = {
      title: titleRaw || current?.title || undefined,
      link: linkRaw || current?.link || undefined,
      sort,
      imageUrl: imageUrlRaw || current?.imageUrl || undefined,
    };

    await prisma.banner.update({
      where: { id: bid },
      data,
    });

    redirect("/admin/banners");
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">ویرایش بنر</h1>

      <form action={update} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">عنوان (اختیاری)</label>
          <input
            name="title"
            defaultValue={banner.title ?? ""}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">لینک (اختیاری)</label>
          <input
            name="link"
            defaultValue={banner.link ?? ""}
            className="w-full rounded-xl border px-3 py-2 ltr"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">مرتب‌سازی</label>
          <input
            name="sort"
            type="number"
            defaultValue={banner.sort ?? 0}
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>

        <UploadImageField
          kind="hero"
          label="تصویر بنر (Hero)"
          name="imageUrl"
          defaultValue={banner.imageUrl}
        />

        <button className="rounded-xl bg-indigo-600 text-white px-4 py-2">
          ذخیره
        </button>
      </form>
    </main>
  );
}
