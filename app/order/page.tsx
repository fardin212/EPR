// app/order/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

type OrderType = "conex" | "container" | "repair";

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold border transition-all",
        active
          ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/40"
          : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white hover:border-[var(--accent)]/50 hover:text-[var(--accent)]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

const typeTitles: Record<OrderType, string> = {
  conex: "ثبت سفارش ساخت کانکس اختصاصی",
  container: "ثبت سفارش ساخت کانتینر",
  repair: "درخواست تعمیرات و بازسازی سازه",
};

const typeBadge: Record<OrderType, string> = {
  conex: "کانکس",
  container: "کانتینر",
  repair: "تعمیرات",
};

export default function OrderPage({
  searchParams,
}: {
  searchParams?: { type?: OrderType };
}) {
  const type: OrderType = searchParams?.type ?? "repair";

  const ctlBase =
    "w-full rounded-2xl border border-slate-300 bg-white text-sm text-slate-900 " +
    "placeholder:text-slate-400 px-3 py-2.5 " +
    "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition";

  const ctl = ctlBase;
  const selBase =
    ctlBase +
    " appearance-none pr-9 bg-no-repeat bg-[length:16px_16px] bg-[left_0.75rem_center]";

  const purpleCaret =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='%235D2DE1'%3E%3Cpath d='M3.2 5h9.6L8 10.5 3.2 5z'/%3E%3C/svg%3E";

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* هدر گرادینتی مثل صفحه نمونه‌کارها */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[var(--accent)] via-indigo-600 to-sky-500 text-white p-5 md:p-7 shadow-xl mb-6">
        {/* ✅ این دو تا دایره فقط تزیینی هستن، کلیک‌ها رو نگیرن */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative grid gap-6 md:grid-cols-[2.2fr,1.2fr] items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-slate-900 text-[11px]">
                ۱
              </span>
              مرحله اول: ثبت اطلاعات سفارش
            </div>
            <h1 className="mt-3 text-2xl md:text-3xl font-black">
              {typeTitles[type]}
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-100/90">
              فرم زیر را تکمیل کنید تا تیم فروش کانکس نیکان با شما تماس بگیرد و
              بر اساس جزئیات پروژه، قیمت دقیق و زمان تحویل را اعلام کند.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                مشاوره رایگان قبل از ثبت نهایی قرارداد
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                امکان ارسال نقشه و عکس‌های مدنظر
              </span>
            </div>
          </div>

          {/* کارت زرد راهنما مثل باکس‌های زرد نمونه‌کار */}
          <div className="rounded-3xl bg-[#FFF4C2] text-slate-900 shadow-lg shadow-black/15 p-4 md:p-5 border border-amber-200">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-amber-800">
                نکات مهم قبل از ثبت فرم
              </span>
              <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-white/80">
                {typeBadge[type]}
              </span>
            </div>
            <ul className="text-[11px] space-y-1.5 leading-relaxed">
              <li>• ابعاد تقریبی را وارد کنید؛ در تماس تلفنی نهایی می‌شود.</li>
              <li>• اگر سازه موجود است، چند عکس واضح از آن ارسال کنید.</li>
              <li>
                • شرایط دسترسی محل (جرثقیل، تریلی، خیابان باریک و …) را توضیح
                دهید.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* تب‌ها */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Tab href="/order?type=conex" active={type === "conex"}>
          کانکس
        </Tab>
        <Tab href="/order?type=container" active={type === "container"}>
          کانتینر
        </Tab>
        <Tab href="/order?type=repair" active={type === "repair"}>
          تعمیرات
        </Tab>
      </div>

      {/* فرم با رنگ‌بندی شبیه کارت‌های نمونه‌کار */}
      <form
        action="/api/order"
        method="post"
        encType="multipart/form-data"
        className="rounded-3xl border border-slate-100 bg-slate-50/70 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-md p-4 md:p-6 space-y-7"
      >
        <input type="hidden" name="type" value={type} />

        {/* بخش ۱: اطلاعات تماس و موقعیت */}
        <section className="rounded-3xl bg-white shadow-sm shadow-slate-200/70 border border-slate-100 p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-bold">
              ۱
            </div>
            <div className="flex-1">
              <h2 className="text-sm md:text-base font-extrabold text-slate-900">
                اطلاعات تماس و محل نصب
              </h2>
              <div className="h-1 mt-1 rounded-full bg-gradient-to-l from-[var(--accent)]/80 via-fuchsia-400/80 to-amber-300/90" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--accent)] mb-1">
                نام و نام خانوادگی
              </label>
              <input
                name="name"
                className={ctl}
                placeholder="نام و نام خانوادگی"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--accent)] mb-1">
                شهر / محل نصب
              </label>
              <input
                name="city"
                className={ctl}
                placeholder="مثلاً تهران، چیتگر"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--accent)] mb-1">
                شماره تماس
              </label>
              <input
                name="phone"
                className={ctl + " ltr"}
                inputMode="tel"
                pattern="^[0-9+\\s-]{7,}$"
                placeholder="09xx xxx xxxx"
                required
              />
              <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px]">
                  ☺
                </span>
                ترجیحاً شماره‌ای را وارد کنید که روی واتساپ فعال باشد.
              </p>
            </div>

            <div className="flex items-center text-xs text-slate-500">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold ml-2">
                ✓
              </span>
              تمام اطلاعات شما محرمانه نزد کانکس نیکان نگهداری می‌شود.
            </div>
          </div>
        </section>

        {/* بخش ۲: ابعاد و مشخصات فنی */}
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 p-4 md:p-5 space-y-4 shadow-lg shadow-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-400 text-slate-900 text-sm font-bold">
              ۲
            </div>
            <div className="flex-1">
              <h2 className="text-sm md:text-base font-extrabold">
                ابعاد و مشخصات سازه
              </h2>
              <p className="text-[11px] md:text-xs text-slate-200 mt-0.5">
                اگر دقیق نمی‌دانید، ابعاد و جزئیات را حدودی وارد کنید؛ در مرحله
                مشاوره نهایی می‌شود.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                طول (متر)
              </label>
              <input
                name="length"
                type="number"
                min={0}
                step="0.1"
                className={ctl + " ltr bg-slate-900/70 border-slate-600 text-slate-50"}
                placeholder="مثلاً ۶"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                عرض (متر)
              </label>
              <input
                name="width"
                type="number"
                min={0}
                step="0.1"
                className={ctl + " ltr bg-slate-900/70 border-slate-600 text-slate-50"}
                placeholder="مثلاً ۳"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                ارتفاع (متر)
              </label>
              <input
                name="height"
                type="number"
                min={0}
                step="0.1"
                className={ctl + " ltr bg-slate-900/70 border-slate-600 text-slate-50"}
                placeholder="مثلاً ۲.۵"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                زمان تحویل مدنظر (تقریبی)
              </label>
              <select
                name="eta"
                className={
                  selBase +
                  " bg-slate-900/70 border-slate-600 text-slate-50"
                }
                style={{
                  backgroundImage: `url("${purpleCaret}")`,
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  انتخاب کنید…
                </option>
                <option value="urgent">فوری</option>
                <option value="2-3w">۲–۳ هفته</option>
                <option value="1-2m">۱–۲ ماه</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                عایق (اختیاری)
              </label>
              <select
                name="insulation"
                className={
                  selBase +
                  " bg-slate-900/70 border-slate-600 text-slate-50"
                }
                style={{
                  backgroundImage: `url("${purpleCaret}")`,
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  انتخاب کنید…
                </option>
                <option value="xps">XPS</option>
                <option value="pu">پلی‌یورتان</option>
                <option value="rw">پشم سنگ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                برق (اختیاری)
              </label>
              <select
                name="electric"
                className={
                  selBase +
                  " bg-slate-900/70 border-slate-600 text-slate-50"
                }
                style={{
                  backgroundImage: `url("${purpleCaret}")`,
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  انتخاب کنید…
                </option>
                <option value="mono">تک‌فاز</option>
                <option value="tri">سه‌فاز</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                لوله‌کشی (اختیاری)
              </label>
              <select
                name="plumbing"
                className={
                  selBase +
                  " bg-slate-900/70 border-slate-600 text-slate-50"
                }
                style={{
                  backgroundImage: `url("${purpleCaret}")`,
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  انتخاب کنید…
                </option>
                <option value="none">ندارد</option>
                <option value="basic">ساده</option>
                <option value="full">کامل</option>
              </select>
            </div>
          </div>
        </section>

        {/* بخش ۳: تصاویر و توضیحات تکمیلی */}
        <section className="rounded-3xl bg-white shadow-sm shadow-slate-200/70 border border-slate-100 p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 text-sm font-bold">
              ۳
            </div>
            <div className="flex-1">
              <h2 className="text-sm md:text-base font-extrabold text-slate-900">
                تصاویر و توضیحات تکمیلی
              </h2>
              <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">
                هرچه جزئیات بیشتری ارسال کنید، برآورد قیمت دقیق‌تر و پیشنهاد
                مناسب‌تری دریافت می‌کنید.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-[1.6fr,1.4fr] gap-4 pt-2">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--accent)] mb-1">
                  ضمیمه تصاویر (اختیاری)
                </label>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*,.heic,.heif,.avif"
                  className={
                    ctl +
                    " file:mr-3 file:rounded-xl file:border-0 " +
                    "file:bg-[var(--accent)] file:text-white file:font-bold file:px-4 file:py-2 " +
                    "cursor-pointer"
                  }
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  می‌توانید چند تصویر از محل نصب، نقشه یا نمونه‌های مشابه مدنظر
                  خود را ارسال کنید.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--accent)] mb-1">
                  توضیحات تکمیلی (اختیاری)
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  className={ctl}
                  placeholder="مثلاً: نوع نما، رنگ مورد نظر، تعداد اتاق‌ها، سرویس بهداشتی، آشپزخانه، شرایط دسترسی برای حمل و نصب و ..."
                />
              </div>
            </div>

            {/* باکس زرد کنار فرم مثل کارت ویژگی‌ها در نمونه‌کار */}
            <div className="rounded-3xl bg-[#FFF4C2] text-slate-900 shadow-md shadow-amber-200/70 p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-amber-800 mb-2">
                  چطور توضیح بدهیم تا برآورد دقیق‌تری بگیریم؟
                </h3>
                <ul className="text-[11px] space-y-1.5 leading-relaxed">
                  <li>
                    • بنویسید سازه برای چه کاربردی است (اداری، کارگاهی،
                    فروشگاهی…)
                  </li>
                  <li>
                    • اگر محدودیت خاصی در دسترسی یا ارتفاع وجود دارد حتماً mention
                    کنید.
                  </li>
                  <li>
                    • اگر نمونه‌ای در سایت یا شبکه‌های اجتماعی دیده‌اید، نام
                    پروژه را بنویسید.
                  </li>
                </ul>
              </div>
              <p className="mt-3 text-[11px] text-amber-900/80">
                تیم کانکس نیکان بر اساس توضیحات شما، بهترین پیشنهاد سازه و
                به‌صرفه‌ترین روش اجرا را معرفی می‌کند.
              </p>
            </div>
          </div>
        </section>

        {/* نوار انتهایی + دکمه ثبت */}
        <div className="pt-4 mt-1 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-slate-500">
            با ثبت این فرم، کارشناسان کانکس نیکان با شما تماس می‌گیرند، جزئیات
            پروژه را بررسی می‌کنند و برآورد هزینه و زمان اجرا را اعلام خواهند
            کرد.
          </p>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-fuchsia-500 text-white text-sm font-bold px-7 py-2.5 shadow-lg shadow-[var(--accent)]/40 hover:brightness-110 active:scale-[0.98] transition"
            type="submit"
          >
            <span>ارسال و ثبت سفارش</span>
            <span className="text-lg">↗</span>
          </button>
        </div>
      </form>
    </main>
  );
}
