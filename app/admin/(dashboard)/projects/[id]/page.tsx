// app/admin/(dashboard)/projects/[id]/page.tsx
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { notFound } from "next/navigation";
import { updateProject, removeProject } from "../actions";
import ProjectImageField from "@/components/admin/ProjectImageField";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

/* ---------- UI (همسان با صفحه افزودن نمونه‌کار) ---------- */
const cls = {
  card:
    "rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] shadow-sm",
  sectionTitle:
    "text-sm md:text-base font-extrabold tracking-tight text-[color:var(--accent)]",
  header:
    "sticky top-0 z-10 -mx-4 -mt-6 mb-6 px-4 py-3 bg-[color:var(--surface)]/90 backdrop-blur border-b border-[color:var(--line)]",

  label: "block text-xs font-bold text-[color:var(--text)]/90 mb-1",
  hint: "text-xs text-[color:var(--muted)] mt-1",

  field:
    "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--text)] placeholder:text-[color:var(--muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/30 focus:border-transparent",
  area:
    "w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--text)] placeholder:text-[color:var(--muted)] text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/30 focus:border-transparent",

  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-[color:var(--accent)] text-black font-extrabold hover:brightness-105 transition",
  btnGhost:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 border border-[color:var(--line)] text-[color:var(--text)] hover:bg-black/5 transition",
};

export default async function ProjectEditPage({ params }: PageProps) {
  await requireAdmin();

  const idNum = Number(params.id);
  if (!Number.isFinite(idNum)) notFound();

  const project = await prisma.project.findUnique({
    where: { id: idNum },
    include: { category: true },
  });

  if (!project) notFound();

  const images = await prisma.image.findMany({
    where: { projectId: idNum },
    orderBy: { id: "asc" },
  });

  const coverUrl = images[0]?.url || "";

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // bullets در create به صورت JSON رشته‌ای ذخیره می‌شود → اینجا تبدیلش می‌کنیم به خطوط
  let bulletsText = "";
  if (typeof project.bullets === "string" && project.bullets.trim()) {
    try {
      const arr = JSON.parse(project.bullets);
      if (Array.isArray(arr)) {
        bulletsText = arr.join("\n");
      } else {
        bulletsText = project.bullets;
      }
    } catch {
      bulletsText = project.bullets;
    }
  }

  // ✅ ALT پیشنهادی برای تصویر هدر
  const suggestedHeroAlt =
    project.heroAlt ||
    `${project.category?.name ? `کانکس ${project.category.name}` : "کانکس"} ${project.title} – کانکس نیکان`;

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 text-[color:var(--text)]">
      {/* Header */}
      <div className={cls.header}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-[color:var(--accent)]">
              ویرایش نمونه‌کار
            </h1>
            <p className="text-xs text-[color:var(--muted)]">
              اطلاعات این نمونه‌کار را ویرایش کنید و تغییرات را ذخیره کنید.
            </p>
          </div>

          {/* دکمه حذف پروژه */}
          <form action={removeProject}>
            <input type="hidden" name="id" value={project.id} />
            <button className="px-4 py-2 text-xs md:text-sm bg-red-600 text-white rounded-xl">
              حذف نمونه‌کار
            </button>
          </form>
        </div>
      </div>

      {/* فرم ویرایش – ساختارش کاملاً مشابه فرم افزودن است */}
      <form action={updateProject} className="space-y-5">
        <input type="hidden" name="id" value={project.id} />

        {/* اطلاعات پایه */}
        <section className={cls.card + " p-4"}>
          <h2 className={cls.sectionTitle}>اطلاعات پایه</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>عنوان</label>
              <input
                name="title"
                className={cls.field}
                required
                defaultValue={project.title}
              />
              <p className={cls.hint}>
                مثلاً: «کانکس ویلایی ۳۶ متری – تهران»
              </p>
            </div>

            <div className="md:px-4">
              <label className={cls.label}>اسلاگ</label>
              <input
                name="slug"
                className={cls.field + " ltr"}
                placeholder="villa-conex-6x3"
                defaultValue={project.slug}
              />
              <p className={cls.hint}>
                اگر خالی یا تکراری باشد، لاجیک سمت سرور می‌تواند آن را اصلاح کند.
              </p>
            </div>

            <div className="md:px-4">
              <label className={cls.label}>دسته‌بندی</label>
              <select
                name="categoryId"
                className={cls.field}
                defaultValue={project.categoryId ?? ""}
              >
                <option value="">— بدون دسته —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>شهر</label>
              <input
                name="city"
                className={cls.field}
                placeholder="تهران"
                defaultValue={project.city ?? ""}
              />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>متراژ (متر)</label>
              <input
                name="meters"
                type="number"
                className={cls.field + " ltr"}
                placeholder="36"
                defaultValue={project.meters ?? ""}
              />
            </div>
            {/* در فرم افزودن، الگوی اسلاگ داشت؛ برای ساده‌سازی در ویرایش از اسلاگ مستقیم استفاده می‌کنیم */}
          </div>
        </section>

        {/* SEO */}
        <section className={cls.card + " p-4"}>
          <h2 className={cls.sectionTitle}>سئو</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>Meta Title</label>
              <input
                name="metaTitle"
                className={cls.field}
                placeholder="ساخت کانکس ..."
                defaultValue={project.metaTitle ?? ""}
              />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>Meta Description</label>
              <input
                name="metaDesc"
                className={cls.field}
                placeholder="گزارش اجرای کانکس ..."
                defaultValue={project.metaDesc ?? ""}
              />
            </div>
          </div>
        </section>

        {/* خلاصه و بولت‌ها */}
        <section className={cls.card + " p-4"}>
          <h2 className={cls.sectionTitle}>خلاصه پروژه</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>شرح کوتاه</label>
              <textarea
                name="summary"
                rows={4}
                className={cls.area}
                placeholder="متراژ، کاربری، محل اجرا ..."
                defaultValue={project.summary ?? ""}
              />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>
                بولت‌ها (هر خط یک مورد، حداکثر ۶)
              </label>
              <textarea
                name="bullets"
                rows={4}
                className={cls.area}
                placeholder={"متراژ: 36 متر\nزمان اجرا: 12 روز\n..."}
                defaultValue={bulletsText}
              />
              <p className={cls.hint}>
                از بولت‌ها در لیست خلاصه صفحه استفاده می‌شود.
              </p>
            </div>
          </div>
        </section>

        {/* تصویر شاخص */}
        <section className={cls.card + " p-4"}>
          <h2 className={cls.sectionTitle}>تصویر شاخص</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <ProjectImageField
                label="تصویر هدر (1920×960)"
                name="imageUrl"
                defaultUrl={coverUrl}
              />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>Alt تصویر</label>
              <input
                name="heroAlt"
                className={cls.field}
                placeholder="مثلاً: کانکس ویلایی ۳۶ متری – نمای اصلی"
                defaultValue={suggestedHeroAlt} // ✅ اگر قبلاً چیزی وارد شده، همان؛ اگر نه، پیشنهاد خودکار
              />
              <p className={cls.hint}>
                این متن در ویژگی ALT تصویر استفاده می‌شود و برای سئو خیلی مهم است. سعی کنید
                نوع کانکس، متراژ یا شهر را در آن ذکر کنید.
              </p>
            </div>
          </div>
        </section>

        {/* توضیحات و مشخصات */}
        <section className={cls.card + " p-4"}>
          <h2 className={cls.sectionTitle}>توضیحات و مشخصات</h2>
          <div className="mt-4 space-y-4">
            <textarea
              name="description"
              rows={8}
              className={cls.area}
              placeholder="جزئیات سازه، متریال، زمان تحویل، گارانتی و ..."
              defaultValue={project.description ?? ""}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
              <div className="md:px-4">
                <label className={cls.label}>سازه و شاسی</label>
                <input
                  name="specFrame"
                  className={cls.field}
                  defaultValue={project.specFrame ?? ""}
                />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>دیوار/سقف/عایق</label>
                <input
                  name="specWalls"
                  className={cls.field}
                  defaultValue={project.specWalls ?? ""}
                />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>
                  داخلی (کف/دیوارپوش/درب/پنجره)
                </label>
                <input
                  name="specInterior"
                  className={cls.field}
                  defaultValue={project.specInterior ?? ""}
                />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>تأسیسات (برق/آب/گرمایش)</label>
                <input
                  name="specMEP"
                  className={cls.field}
                  defaultValue={project.specMEP ?? ""}
                />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>حمل و نصب</label>
                <input
                  name="specLogistic"
                  className={cls.field}
                  defaultValue={project.specLogistic ?? ""}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button className={cls.btnPrimary}>ذخیره تغییرات</button>
          <a href="/admin/projects" className={cls.btnGhost}>
            انصراف
          </a>
        </div>
      </form>
    </main>
  );
}
