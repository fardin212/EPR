import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateUsedConex } from "../actions";

export default async function EditUsedConexPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.usedConex.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ kind: "asc" }, { sort: "asc" }] },
      refurbItems: { orderBy: { sort: "asc" } },
    },
  });

  if (!item) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p>یافت نشد</p>
        <Link className="underline" href="/admin/used-conex">برگشت</Link>
      </main>
    );
  }

  const galleryText = item.images
    .filter((x) => x.kind === "gallery")
    .sort((a,b)=>a.sort-b.sort)
    .map((x) => x.url)
    .join("\n");

  const beforeUrl = item.images.find((x) => x.kind === "before")?.url || "";
  const afterUrl = item.images.find((x) => x.kind === "after")?.url || "";

  const refurbText = item.refurbItems
    .sort((a,b)=>a.sort-b.sort)
    .map((x) => `${x.title}${x.desc ? " | " + x.desc : ""}`)
    .join("\n");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">ویرایش</h1>
        <Link className="text-sm underline" href="/admin/used-conex">برگشت</Link>
      </div>

      <form action={async (fd) => { "use server"; await updateUsedConex(id, fd); }}
            className="mt-6 rounded-2xl border bg-white p-5 grid gap-4">
        <input className="rounded-xl border px-3 py-2" name="slug" defaultValue={item.slug} required />
        <input className="rounded-xl border px-3 py-2" name="title" defaultValue={item.title} required />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2" name="type" defaultValue={item.type} required />
          <input className="rounded-xl border px-3 py-2" name="size" defaultValue={item.size} required />
          <input className="rounded-xl border px-3 py-2" name="city" defaultValue={item.city} required />
          <input className="rounded-xl border px-3 py-2" name="price" defaultValue={item.price} required />
        </div>

        <select className="rounded-xl border px-3 py-2" name="status" defaultValue={item.status}>
          <option value="ready">ready</option>
          <option value="minor_fix">minor_fix</option>
          <option value="refurbished">refurbished</option>
          <option value="temporary">temporary</option>
        </select>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isReady" defaultChecked={item.isReady} /> تحویل فوری
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="refurbished" defaultChecked={item.refurbished} /> بازسازی‌شده
          </label>
        </div>

        <textarea className="rounded-xl border px-3 py-2" name="note" rows={3} defaultValue={item.note || ""} />

        <textarea className="rounded-xl border px-3 py-2" name="images" rows={4} defaultValue={galleryText}
                  placeholder="URL تصاویر گالری (هر خط یک URL)" />

        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2" name="beforeUrl" defaultValue={beforeUrl} placeholder="URL تصویر قبل" />
          <input className="rounded-xl border px-3 py-2" name="afterUrl" defaultValue={afterUrl} placeholder="URL تصویر بعد" />
        </div>

        <textarea className="rounded-xl border px-3 py-2" name="refurbItems" rows={4} defaultValue={refurbText}
                  placeholder="هر خط: عنوان | توضیح" />

        <button className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white">
          ذخیره تغییرات
        </button>
      </form>
    </main>
  );
}
