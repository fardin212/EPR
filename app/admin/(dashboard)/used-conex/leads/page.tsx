import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteLead, updateLeadStatus } from "./actions";

function cleanPhone(p: string) {
  return (p || "").replace(/[^\d]/g, "");
}

function waLink(phone: string, text: string) {
  const p = cleanPhone(phone);
  // ایران: اگر با 0 شروع شد → 98
  const normalized = p.startsWith("0") ? "98" + p.slice(1) : p;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

function tgLink(text: string) {
  return `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
}

function csvLink(status?: string) {
  const p = new URLSearchParams();
  if (status && status !== "all") p.set("status", status);
  return `/admin/used-conex/leads/export?${p.toString()}`;
}

export default async function AdminUsedConexLeadsPage({
  searchParams,
}: {
  searchParams?: { status?: string; q?: string };
}) {
  const status = searchParams?.status || "all";
  const q = (searchParams?.q || "").trim();

  const where: any = {};
  if (status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { phone: { contains: q } },
      { name: { contains: q } },
      { city: { contains: q } },
      { slug: { contains: q } },
    ];
  }

  const leads = await prisma.usedConexLead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">لیدهای کانکس دست دوم</h1>
        <div className="flex gap-2">
          <Link className="rounded-xl border px-4 py-2 text-sm font-semibold" href="/admin/used-conex">
            مدیریت کانکس‌ها
          </Link>
          <a className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white" href={csvLink(status)}>
            خروجی CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <section className="mt-6 rounded-2xl border bg-white p-4">
        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-600">وضعیت</label>
            <select
              name="status"
              defaultValue={status}
              className="mt-1 rounded-xl border px-3 py-2 text-sm"
            >
              <option value="all">همه</option>
              <option value="new">جدید</option>
              <option value="contacted">تماس گرفته شد</option>
              <option value="qualified">مناسب / پیگیری</option>
              <option value="closed">بسته شد</option>
              <option value="spam">اسپم</option>
            </select>
          </div>

          <div className="min-w-[260px]">
            <label className="block text-xs text-gray-600">جستجو</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="شماره / نام / شهر / اسلاگ"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <button className="rounded-xl border px-4 py-2 text-sm font-semibold">
            اعمال فیلتر
          </button>

          <div className="ml-auto text-sm text-gray-600">{leads.length} لید</div>
        </form>
      </section>

      {/* List */}
      <section className="mt-6 grid gap-3">
        {leads.map((l) => {
          const text = `سلام وقتتون بخیر 🌿\nبرای کانکس دست دوم (${l.slug || "-"}) پیام دادید.\nشماره شما: ${l.phone}\nاگر امکان دارد ابعاد/نوع و شهر مدنظر را بفرمایید تا قیمت دقیق اعلام کنم.`;

          return (
            <div key={l.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {l.name || "بدون نام"} — <span className="font-mono">{l.phone}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {l.city || "-"} • {l.slug || "-"} • {new Date(l.createdAt).toLocaleString("fa-IR")}
                  </div>
                  {l.message && <div className="mt-2 text-sm text-gray-700">{l.message}</div>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    className="rounded-xl border px-3 py-2 text-sm font-semibold"
                    href={waLink(l.phone, text)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    واتساپ
                  </a>
                  <a
                    className="rounded-xl border px-3 py-2 text-sm font-semibold"
                    href={tgLink(text)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    تلگرام
                  </a>
                  {l.slug && (
                    <Link
                      className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white"
                      href={`/used-conex/buy/${l.slug}`}
                      target="_blank"
                    >
                      صفحه
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <form
                  action={async (fd) => {
                    "use server";
                    const status = String(fd.get("status") || "new");
                    await updateLeadStatus(l.id, status);
                  }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <label className="text-xs text-gray-600">وضعیت:</label>
                  <select
                    name="status"
                    defaultValue={l.status}
                    className="rounded-xl border px-3 py-2 text-sm"
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="qualified">qualified</option>
                    <option value="closed">closed</option>
                    <option value="spam">spam</option>
                  </select>
                  <button className="rounded-xl border px-3 py-2 text-sm font-semibold">
                    ذخیره
                  </button>
                </form>

                <form action={async () => { "use server"; await deleteLead(l.id); }}>
                  <button className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-rose-50">
                    حذف
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
