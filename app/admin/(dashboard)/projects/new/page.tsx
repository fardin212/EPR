import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProjectImageField from "@/components/admin/ProjectImageField";
import { requireAdmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";

/* ---------- Utils ---------- */
function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\-_\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "");
}

async function ensureUniqueSlug(base: string) {
  let s = base || "project";
  let i = 2;
  while (await prisma.project.findUnique({ where: { slug: s } })) {
    s = `${base}-${i}`;
    i++;
    if (i > 99) throw new Error("Too many similar slugs");
  }
  return s;
}

/* ---------- UI helpers ---------- */
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

export default async function NewProjectPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  async function create(formData: FormData) {
    "use server";
    await requireAdmin();

    /* ---------- خواندن فیلدهای اصلی ---------- */
    const title = String(formData.get("title") || "").trim();
    const rawSlug = String(formData.get("slug") || "").trim();
    const usePattern = String(formData.get("usePattern") || "") === "on";
    const pattern = String(formData.get("pattern") || "").trim();
    const categoryId = Number(formData.get("categoryId")) || null;

    if (!title) throw new Error("عنوان الزامی است");

    const city = String(formData.get("city") || "").trim() || null;
    const meters = Number(formData.get("meters")) || null;

    const metaTitle = String(formData.get("metaTitle") || "").trim() || null;
    const metaDesc = String(formData.get("metaDesc") || "").trim() || null;
    const heroAlt = String(formData.get("heroAlt") || "").trim() || null;

    const bulletsText = String(formData.get("bullets") || "").trim();
    const bulletsArray = bulletsText
      ? bulletsText.split(/\r?\n/).slice(0, 6)
      : null;

    const specFrame = String(formData.get("specFrame") || "").trim() || null;
    const specWalls = String(formData.get("specWalls") || "").trim() || null;
    const specInterior =
      String(formData.get("specInterior") || "").trim() || null;
    const specMEP = String(formData.get("specMEP") || "").trim() || null;
    const specLogistic =
      String(formData.get("specLogistic") || "").trim() || null;

    const priceRange =
      String(formData.get("priceRange") || "").trim() || null;
    const priceFactors =
      String(formData.get("priceFactors") || "").trim() || null;

    const challenges =
      String(formData.get("challenges") || "").trim() || null;

    const clientName =
      String(formData.get("clientName") || "").trim() || null;
    const clientQuote =
      String(formData.get("clientQuote") || "").trim() || null;

    const ctaWhatsapp =
      String(formData.get("ctaWhatsapp") || "").trim() || null;

    const faqText = String(formData.get("faq") || "").trim();
    const faq = faqText
      ? faqText
          .split(/\r?\n/)
          .map((line) => {
            const [q, a] = line.split("—");
            if (!q || !a) return null;
            return { q: q.trim(), a: a.trim() };
          })
          .filter(Boolean)
      : null;

    const summary =
      String(formData.get("summary") || "").trim() || null;
    const description =
      String(formData.get("description") || "").trim() || null;

    const imageUrl =
      String(formData.get("imageUrl") || "").trim() || null;

    /* ---------- جدول مدل‌ها (workshopTypesJson) ---------- */
    const wtEnabled = String(formData.get("wtEnabled") || "") === "on";

    function getStr(name: string) {
      return String(formData.get(name) || "").trim();
    }

    function parseItems(text: string) {
      return text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    }

    let workshopTypesJson: string | null = null;

    if (wtEnabled) {
      const workshopTypes: any[] = [];

      const lTitle = getStr("wtLightTitle");
      const lImg = getStr("wtLightImage");
      const lIt = getStr("wtLightItems");

      const hTitle = getStr("wtHeavyTitle");
      const hImg = getStr("wtHeavyImage");
      const hIt = getStr("wtHeavyItems");

      const eTitle = getStr("wtEquipTitle");
      const eImg = getStr("wtEquipImage");
      const eIt = getStr("wtEquipItems");

      if (lTitle || lImg || lIt) {
        workshopTypes.push({
          key: "light",
          title: lTitle || "مدل ۱",
          imageUrl: lImg || null,
          items: parseItems(lIt),
        });
      }

      if (hTitle || hImg || hIt) {
        workshopTypes.push({
          key: "heavy",
          title: hTitle || "مدل ۲",
          imageUrl: hImg || null,
          items: parseItems(hIt),
        });
      }

      if (eTitle || eImg || eIt) {
        workshopTypes.push({
          key: "equip",
          title: eTitle || "مدل ۳",
          imageUrl: eImg || null,
          items: parseItems(eIt),
        });
      }

      if (workshopTypes.length > 0) {
        workshopTypesJson = JSON.stringify(workshopTypes);
      }
    }

    /* ---------- ساخت اسلاگ ---------- */
    let slugBase: string;
    if (usePattern && pattern) {
      const cat = categoryId
        ? await prisma.category.findUnique({
            where: { id: categoryId },
            select: { slug: true, name: true },
          })
        : null;

      const catSlug = cat?.slug || cat?.name || "category";

      slugBase = pattern
        .replace(/\{city\}/g, city || "")
        .replace(/\{category\}/g, String(catSlug))
        .replace(/\{meters\}/g, String(meters ?? ""))
        .replace(/--+/g, "-");

      slugBase = normalizeSlug(slugBase);
    } else {
      slugBase = normalizeSlug(rawSlug || title);
    }

    const slug = await ensureUniqueSlug(slugBase || "project");

    /* ---------- ساخت دیتای نهایی ---------- */
    const data = {
      title,
      slug,
      summary,
      description,
      ...(categoryId ? { categoryId } : {}),
      city,
      meters,
      metaTitle,
      metaDesc,
      heroAlt,
      bullets: bulletsArray ? JSON.stringify(bulletsArray) : null,
      specFrame,
      specWalls,
      specInterior,
      specMEP,
      specLogistic,
      priceRange,
      priceFactors,
      challenges,
      clientName,
      clientQuote,
      ctaWhatsapp,
      faq: faq as any,
      imageUrl,
      workshopTypesJson,
    };

    const proj = await prisma.project.create({ data });

    if (imageUrl) {
      await prisma.image.create({
        data: {
          url: imageUrl,
          projectId: proj.id,
          alt: heroAlt || title,
        },
      });

      await prisma.projectImage.create({
        data: {
          url: imageUrl,
          alt: heroAlt || title,
          projectId: proj.id,
        },
      });
    }

    redirect("/admin/projects");
  }

  /* ---------- UI فرم ---------- */
  return (
    <main className="max-w-5xl mx-auto px-4 py-6 text-[color:var(--text)]">
      {/* Header */}
      <div className={cls.header}>
        <h1 className="text-lg md:text-xl font-extrabold text-[color:var(--accent)]">
          افزودن نمونه‌کار
        </h1>
        <p className="text-xs text-[color:var(--muted)]">
          ایجاد نمونه‌کار جدید با فیلدهای کامل و جدول مدل‌ها
        </p>
      </div>

      <form action={create} className="space-y-5">
        {/* اطلاعات پایه */}
        <section className={cls.card + " p-4"}>
          <h2 className={cls.sectionTitle}>اطلاعات پایه</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>عنوان</label>
              <input name="title" className={cls.field} required />
              <p className={cls.hint}>
                مثلاً: «کانکس ویلایی ۳۶ متری – تهران»
              </p>
            </div>

            <div className="md:px-4">
              <label className={cls.label}>اسلاگ (دلخواه)</label>
              <input
                name="slug"
                className={cls.field + " ltr"}
                placeholder="villa-conex-6x3"
              />
              <p className={cls.hint}>
                اگر خالی یا تکراری باشد، خودکار اصلاح می‌شود.
              </p>
            </div>

            <div className="md:px-4">
              <label className={cls.label}>الگوی اسلاگ (اختیاری)</label>
              <div className="flex items-center gap-3">
                <input type="checkbox" name="usePattern" className="h-4 w-4" />
                <input
                  name="pattern"
                  className={cls.field + " ltr"}
                  placeholder="{city}-{category}-{meters}"
                />
              </div>
              <p className={cls.hint}>
                از فیلدهای شهر/متراژ/دسته در الگو استفاده می‌شود.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>شهر</label>
              <input name="city" className={cls.field} placeholder="تهران" />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>متراژ (متر)</label>
              <input
                name="meters"
                type="number"
                className={cls.field + " ltr"}
                placeholder="36"
              />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>دسته‌بندی</label>
              <select name="categoryId" className={cls.field}>
                <option value="">— بدون دسته —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* سئو */}
        <section className={cls.card + " p-4"}>
          <h2 className={cls.sectionTitle}>سئو</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
            <div className="md:px-4">
              <label className={cls.label}>Meta Title</label>
              <input name="metaTitle" className={cls.field} />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>Meta Description</label>
              <input name="metaDesc" className={cls.field} />
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
              />
              <p className={cls.hint}>
                این موارد به‌صورت لیست در صفحه پروژه نمایش داده می‌شوند.
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
              />
            </div>
            <div className="md:px-4">
              <label className={cls.label}>Alt تصویر</label>
              <input
                name="heroAlt"
                className={cls.field}
                placeholder="کانکس ویلایی ۳۶ متری – نمای اصلی"
              />
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
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:divide-x md:divide-[color:var(--line)] rtl:md:divide-x-reverse">
              <div className="md:px-4">
                <label className={cls.label}>سازه و شاسی</label>
                <input name="specFrame" className={cls.field} />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>دیوار/سقف/عایق</label>
                <input name="specWalls" className={cls.field} />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>
                  داخلی (کف/دیوارپوش/درب/پنجره)
                </label>
                <input name="specInterior" className={cls.field} />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>تأسیسات (برق/آب/گرمایش)</label>
                <input name="specMEP" className={cls.field} />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>حمل و نصب</label>
                <input name="specLogistic" className={cls.field} />
              </div>
              <div className="md:px-4">
                <label className={cls.label}>رِنج قیمتی</label>
                <input name="priceRange" className={cls.field} />
              </div>
            </div>
          </div>
        </section>

        {/* جدول مدل‌های کانکس / Workshop types */}
        <section className={cls.card + " p-4"}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={cls.sectionTitle}>مدل‌های کانکس / جدول سه‌ستونه</h2>
            <label className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
              <input
                type="checkbox"
                name="wtEnabled"
                className="h-4 w-4 rounded border-[color:var(--line)]"
              />
              فعال‌سازی جدول مدل‌ها برای این نمونه‌کار
            </label>
          </div>
          <p className="mt-2 text-[11px] text-[color:var(--muted)]">
            اگر فعال باشد، در صفحه این نمونه‌کار یک جدول سه‌ستونه با مدل‌ها نمایش داده می‌شود.
          </p>

          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {/* مدل ۱ */}
            <div className="space-y-3 md:px-3">
              <h3 className="text-xs font-extrabold text-amber-300">مدل ۱</h3>
              <label className={cls.label}>عنوان مدل</label>
              <input name="wtLightTitle" className={cls.field} />
              <label className={cls.label}>تصویر مدل</label>
              <ProjectImageField name="wtLightImage" label="آپلود تصویر" />
              <label className={cls.label}>ویژگی‌ها (هر خط یک مورد)</label>
              <textarea
                name="wtLightItems"
                rows={4}
                className={cls.area}
                placeholder={"ویژگی ۱\nویژگی ۲\n..."}
              />
            </div>

            {/* مدل ۲ */}
            <div className="space-y-3 md:px-3">
              <h3 className="text-xs font-extrabold text-amber-300">مدل ۲</h3>
              <label className={cls.label}>عنوان مدل</label>
              <input name="wtHeavyTitle" className={cls.field} />
              <label className={cls.label}>تصویر مدل</label>
              <ProjectImageField name="wtHeavyImage" label="آپلود تصویر" />
              <label className={cls.label}>ویژگی‌ها (هر خط یک مورد)</label>
              <textarea
                name="wtHeavyItems"
                rows={4}
                className={cls.area}
                placeholder={"ویژگی ۱\nویژگی ۲\n..."}
              />
            </div>

            {/* مدل ۳ */}
            <div className="space-y-3 md:px-3">
              <h3 className="text-xs font-extrabold text-amber-300">مدل ۳</h3>
              <label className={cls.label}>عنوان مدل</label>
              <input name="wtEquipTitle" className={cls.field} />
              <label className={cls.label}>تصویر مدل</label>
              <ProjectImageField name="wtEquipImage" label="آپلود تصویر" />
              <label className={cls.label}>ویژگی‌ها (هر خط یک مورد)</label>
              <textarea
                name="wtEquipItems"
                rows={4}
                className={cls.area}
                placeholder={"ویژگی ۱\nویژگی ۲\n..."}
              />
            </div>
          </div>
        </section>

        {/* دکمه‌ها */}
        <div className="flex items-center gap-3">
          <button className={cls.btnPrimary}>ثبت نمونه‌کار</button>
          <a href="/admin/projects" className={cls.btnGhost}>
            انصراف
          </a>
        </div>
      </form>
    </main>
  );
}
