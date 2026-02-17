// app/admin/(dashboard)/settings/page.tsx
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import UploadImageField from "@/components/admin/UploadImageField";
import { requireAdmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";

// آداپتر سازگار با دو امضای مختلف saveImage
async function saveImageCompat(file: File, kind: "logo" | "hero") {
  const mod: any = await import("@/lib/saveImage").catch(() => ({}));
  const fn: any = mod?.saveImage;
  if (!fn) throw new Error("saveImage module not found");
  try {
    // امضای قدیمی: (file, kind)
    return await fn(file, kind);
  } catch {
    // امضای جدید: (file, { kind })
    return await fn(file, { kind });
  }
}

export default async function SettingsPage() {
  await requireAdmin(); // ✅ گارد ادمین

  // singleton settings (تنظیمات کلی سایت)
  let settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.siteSetting.create({
      data: {
        id: 1,
        siteName: "کانکس نیکان",
        brandPrimary: "#0B1220",
        brandAccent: "#FF7A1A",
        chatEnabled: false,
      },
    });
  }

  // ========= Server Actions =========

  async function saveGeneral(formData: FormData) {
    "use server";
    await requireAdmin(); // ✅ گارد جدید

    const siteName = String(formData.get("siteName") || "").trim() || null;

    await prisma.siteSetting.update({
      where: { id: 1 },
      data: { siteName },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
  }

  async function saveBranding(formData: FormData) {
    "use server";
    await requireAdmin(); // ✅ گارد جدید

    const brandPrimary =
      String(formData.get("brandPrimary") || "").trim() || "#0B1220";
    const brandAccent =
      String(formData.get("brandAccent") || "").trim() || "#FF7A1A";

    // لوگو
    let logoUrl: string | null = settings!.logoUrl ?? null;
    const logoField = formData.get("logoUrl");
    if (logoField instanceof File && logoField.size > 0) {
      logoUrl = await saveImageCompat(logoField, "logo");
    } else if (typeof logoField === "string" && logoField.trim()) {
      logoUrl = logoField.trim();
    }

    // هرو
    let heroUrl: string | null = settings!.heroUrl ?? null;
    const heroField = formData.get("heroUrl");
    if (heroField instanceof File && heroField.size > 0) {
      heroUrl = await saveImageCompat(heroField, "hero");
    } else if (typeof heroField === "string" && heroField.trim()) {
      heroUrl = heroField.trim();
    }

    await prisma.siteSetting.update({
      where: { id: 1 },
      data: { logoUrl, heroUrl, brandPrimary, brandAccent },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
  }

  async function saveSEO() {
    "use server";
    await requireAdmin(); // ✅ گارد جدید
    // TODO: فیلدهای واقعی SEO را اضافه کن
    revalidatePath("/admin/settings");
  }

  async function saveContact(formData: FormData) {
    "use server";
    await requireAdmin(); // ✅ گارد جدید

    // شماره واتساپ
    const waRaw = String(formData.get("whatsapp") || "");
    const whatsappNumber = waRaw.replace(/[^\d]/g, "") || null;

    // نام کاربری تلگرام
    const tgRaw = String(formData.get("telegram") || "").trim();
    const telegramUsername = tgRaw.replace(/^@+/, "") || null;

    // شماره تماس فوری
    const phoneRaw = String(formData.get("phone") || "").trim();
    const supportPhone = phoneRaw.replace(/[^\d]/g, "") || null;

    // وضعیت فعال بودن چت آنلاین
    const chatEnabled = String(formData.get("chatEnabled") || "") === "on";

    await prisma.siteSetting.update({
      where: { id: 1 },
      data: {
        whatsappNumber,
        telegramUsername,
        supportPhone,
        chatEnabled,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
  }

  // ✅ مدیریت منوی اصلی (JSON)
  async function saveMainNav(formData: FormData) {
    "use server";
    await requireAdmin();

    const raw = String(formData.get("mainNavJson") || "").trim();
    const mainNavJson = raw || null; // خالی = استفاده از منوی پیش‌فرض در فرانت

    await prisma.siteSetting.update({
      where: { id: 1 },
      data: { mainNavJson },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
  }

  // ========= UI =========
  const statusDot =
    settings.chatEnabled ? (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />{" "}
        فعال
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-zinc-500">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-zinc-300" />{" "}
        غیرفعال
      </span>
    );

  const whatsappDefault = settings.whatsappNumber ?? "";
  const telegramDefault = settings.telegramUsername ?? "";
  const phoneDefault = settings.supportPhone ?? "";

  return (
    <main className="max-w-6xl mx-auto px-1 md:px-4 py-3 md:py-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-zinc-900">
            تنظیمات سایت
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            مدیریت لوگو، بنر هدر، رنگ برند، راه‌های ارتباطی و تنظیمات عمومی.
          </p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* General */}
        <section className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-bold mb-2 text-zinc-900">عمومی</h2>
            <p className="text-sm text-zinc-600">نام سایت و اطلاعات پایه.</p>
          </div>
        </section>
        <section className="md:col-span-2">
          <form
            action={saveGeneral}
            className="rounded-2xl border bg-white p-4 space-y-4"
          >
            <div>
              <label className="block text-sm mb-1 text-zinc-700">
                نام سایت
              </label>
              <input
                name="siteName"
                defaultValue={settings.siteName ?? ""}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400"
                placeholder="مثلاً: کانکس نیکان"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-zinc-900 text-white px-4 py-2">
                ذخیره
              </button>
              <span className="text-xs text-zinc-600">
                پس از ذخیره، صفحه اصلی به‌روزرسانی می‌شود.
              </span>
            </div>
          </form>
        </section>

        {/* Branding */}
        <section className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-bold mb-2 text-zinc-900">برندسازی</h2>
            <p className="text-sm text-zinc-600">لوگو، بنر هرو و رنگ‌های برند.</p>
          </div>
        </section>
        <section className="md:col-span-2">
          <form
            action={saveBranding}
            className="rounded-2xl border bg-white p-4 space-y-5"
          >
            <UploadImageField
              kind="logo"
              label="لوگو"
              name="logoUrl"
              defaultValue={settings.logoUrl ?? ""}
            />
            <p className="text-xs text-zinc-500 mt-1">
              حداقل 256×128، حداکثر 200KB.
            </p>

            <UploadImageField
              kind="hero"
              label="تصویر بنر (Hero)"
              name="heroUrl"
              defaultValue={settings.heroUrl ?? ""}
            />
            <p className="text-xs text-zinc-500 mt-1">
              حداقل 1920×960، حداکثر 700KB.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-zinc-700">
                  رنگ اصلی (Primary)
                </label>
                <input
                  name="brandPrimary"
                  defaultValue={settings.brandPrimary ?? "#0B1220"}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 ltr"
                  placeholder="#0B1220"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-zinc-700">
                  رنگ تأکید (Accent)
                </label>
                <input
                  name="brandAccent"
                  defaultValue={settings.brandAccent ?? "#FF7A1A"}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 ltr"
                  placeholder="#FF7A1A"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-zinc-900 text-white px-4 py-2">
                ذخیره
              </button>
              <span className="text-xs text-zinc-600">
                پس از ذخیره، رنگ‌ها و تصاویر جدید اعمال می‌شوند.
              </span>
            </div>
          </form>
        </section>

        {/* Contact */}
        <section className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-bold mb-2 text-zinc-900">راه‌های ارتباطی</h2>
            <p className="text-sm text-zinc-600">
              وضعیت چت آنلاین: {statusDot}
            </p>
          </div>
        </section>
        <section className="md:col-span-2">
          <form
            action={saveContact}
            className="rounded-2xl border bg-white p-4 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-zinc-700">
                  شماره واتس‌اپ
                </label>
                <input
                  name="whatsapp"
                  defaultValue={whatsappDefault}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 ltr"
                  placeholder="مثلاً: 989121234567 (فقط رقم، بدون + و فاصله)"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  فقط رقم وارد کنید؛ سایر کاراکترها حذف می‌شوند.
                </p>
              </div>
              <div>
                <label className="block text-sm mb-1 text-zinc-700">
                  نام کاربری تلگرام
                </label>
                <input
                  name="telegram"
                  defaultValue={telegramDefault}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 ltr"
                  placeholder="مثلاً: nikan_conex (بدون @)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-zinc-700">
                شماره تماس فوری
              </label>
              <input
                name="phone"
                defaultValue={phoneDefault}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 ltr"
                placeholder="مثلاً: 021XXXXXXX یا 98912XXXXXXX"
              />
              <p className="text-xs text-zinc-500 mt-1">
                این شماره در تب «تماس فوری» ویجت استفاده می‌شود.
              </p>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="chatEnabled"
                defaultChecked={!!settings.chatEnabled}
                className="size-4 accent-emerald-600"
              />
              <span className="text-sm text-zinc-800">
                فعال‌بودن چت آنلاین
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-zinc-900 text-white px-4 py-2">
                ذخیره
              </button>
              <span className="text-xs text-zinc-600">
                پس از ذخیره، ویجت چت و اطلاعات تماس در سایت به‌روزرسانی می‌شود.
              </span>
            </div>
          </form>
        </section>

        {/* Main Nav (JSON) */}
        <section className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-bold mb-2 text-zinc-900">منوی اصلی سایت</h2>
            <p className="text-sm text-zinc-600">
              ساختار منوی هدر (آیتم‌ها، ترتیب، زیرمنوها) را به صورت JSON تنظیم
              کنید.
            </p>
          </div>
        </section>
        <section className="md:col-span-2">
          <form
            action={saveMainNav}
            className="rounded-2xl border bg-white p-4 space-y-3"
          >
            <label className="block text-sm mb-1 text-zinc-700">
              ساختار منو (JSON)
            </label>
            <textarea
              name="mainNavJson"
              defaultValue={settings.mainNavJson ?? ""}
              rows={10}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono ltr"
              placeholder='مثال: [{"key":"home","label":"صفحه اصلی","href":"/"}, …]'
            />
            <p className="text-xs text-zinc-500">
              اگر این فیلد خالی باشد، منوی پیش‌فرض استفاده می‌شود. قبل از ذخیره،
              ساختار JSON را از نظر سینتکس (کامای اضافه، کوتیشن، براکت‌ها و …)
              بررسی کنید.
            </p>
            <button className="rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-bold">
              ذخیره منو
            </button>
          </form>
        </section>

        {/* SEO (placeholder) */}
        <section className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-bold mb-2 text-zinc-900">SEO</h2>
            <p className="text-sm text-zinc-600">
              عنوان/توضیح پیش‌فرض، OG image و …
            </p>
          </div>
        </section>
        <section className="md:col-span-2">
          <form
            action={saveSEO}
            className="rounded-2xl border bg-white p-4 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-zinc-700">
                  Default Title
                </label>
                <input
                  name="seoTitle"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400"
                  placeholder="کانکس نیکان | ..."
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-zinc-700">
                  Default Description
                </label>
                <input
                  name="seoDesc"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400"
                  placeholder="تولید و نصب انواع کانکس ..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-zinc-900 text-white px-4 py-2">
                ذخیره
              </button>
              <span className="text-xs text-zinc-600">
                بعداً این بخش را کامل‌تر می‌کنیم.
              </span>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
