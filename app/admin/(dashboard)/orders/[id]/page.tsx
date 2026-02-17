// app/admin/(dashboard)/orders/[id]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminGuard";
import { setStatusAction, archiveAction, deleteAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function OrderDetail({
  params,
}: { params: { id: string } }) {
  await requireAdmin(); // ✅ گارد ادمین

  const orderId = Number(params.id);
  if (!orderId) notFound();

  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (!o) notFound();

  // ✅ imagesJson الان از نوع Json? هست، نه رشته
  const images: string[] = Array.isArray(o.imagesJson)
    ? (o.imagesJson as any[]).filter((v) => typeof v === "string")
    : [];

  const pair = (k: string, v?: string | number | null) => (
    <li key={k} className="flex gap-2">
      <span className="text-[color:var(--muted)] min-w-[110px]">{k}:</span>
      <span className={k === "تلفن" ? "ltr" : undefined}>{v ?? "—"}</span>
    </li>
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-[color:var(--text)]">
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-[color:var(--accent)]">
          جزئیات سفارش #{o.id}
        </h1>

        <div className="flex flex-wrap gap-2">
          <form action={setStatusAction}>
            <input type="hidden" name="orderId" value={String(orderId)} />
            <input type="hidden" name="status" value="done" />
            <button className="btn-gold !h-9 !px-3 text-sm">انجام شد</button>
          </form>

          <form action={setStatusAction}>
            <input type="hidden" name="orderId" value={String(orderId)} />
            <input type="hidden" name="status" value="in_progress" />
            <button className="btn-ghost-dark !h-9 !px-3 text-sm">
              در حال انجام
            </button>
          </form>

          <form action={setStatusAction}>
            <input type="hidden" name="orderId" value={String(orderId)} />
            <input type="hidden" name="status" value="not_done" />
            <button className="btn-ghost-dark !h-9 !px-3 text-sm">
              انجام نشده
            </button>
          </form>

          <form action={archiveAction}>
            <input type="hidden" name="orderId" value={String(orderId)} />
            <button className="rounded-lg border border-[color:var(--line)] bg-white/5 text-white hover:bg-white/10 px-3 h-9 text-sm">
              بایگانی
            </button>
          </form>

          <form action={deleteAction}>
            <input type="hidden" name="orderId" value={String(orderId)} />
            <button className="rounded-lg bg-red-500/90 hover:bg-red-500 text-white px-3 h-9 text-sm font-bold">
              حذف سفارش
            </button>
          </form>
        </div>
      </div>

      {/* این‌جا می‌تونی ادامهٔ جزئیات سفارش رو مثل قبل رندر کنی:
          - اطلاعات تماس
          - مشخصات فنی انتخاب‌شده
          - گالری تصاویر (از روی images)
      */}

      {images.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">تصاویر ارسالی مشتری</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`تصویر سفارش ${o.id} - ${i + 1}`}
                className="w-full h-32 object-cover rounded-xl border border-[color:var(--line)]"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
