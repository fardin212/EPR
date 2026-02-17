// app/admin/(dashboard)/seo/analyze/page.tsx

type AnalyzePageProps = {
  searchParams: {
    url?: string;
  };
};

export default function SeoAnalyzePage({ searchParams }: AnalyzePageProps) {
  const url = searchParams?.url || "/";
  const decodedUrl = decodeURIComponent(url);

  return (
    <div className="space-y-6">
      {/* عنوان صفحه */}
      <header className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            آنالیز سئو صفحه
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            این بخش برای بررسی و بهبود سئوی یک صفحه‌ی مشخص از سایت استفاده می‌شود.
          </p>
        </div>

        <div className="text-left text-xs bg-gray-50 px-3 py-2 rounded-lg border">
          <div className="text-gray-500">آدرس صفحه در حال بررسی:</div>
          <div className="font-mono text-blue-700 mt-1" dir="ltr">
            {decodedUrl}
          </div>
        </div>
      </header>

      {/* باکس اطلاعات کلی صفحه */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">
            وضعیت کلی
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            در نسخه‌ی فعلی فقط اسکلت صفحه ساخته شده است. می‌توانیم در مرحله‌ی بعد
            اتصال این صفحه به آنالیز خودکار محتوا (عنوان، توضیحات متا، هدینگ‌ها،
            چگالی کلمات کلیدی و...) را هم اضافه کنیم.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">
            پیشنهاد بعدی
          </h2>
          <ul className="text-xs text-gray-500 list-disc pr-4 space-y-1">
            <li>خواندن محتوای صفحه از سرور و استخراج تیترها</li>
            <li>محاسبه تعداد کلمات و چگالی عبارت کلیدی</li>
            <li>نمایش چک‌لیست سئو مشابه Yoast / RankMath</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">
            عملیات دستی
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            در حال حاضر می‌توانی بر اساس این URL، به صورت دستی محتوا و سئوی صفحه را
            در بخش دسته‌بندی‌ها یا نمونه‌کارها ویرایش کنی.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <a
              href={decodedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50"
            >
              مشاهده صفحه در سایت
            </a>
          </div>
        </div>
      </section>

      {/* جای خالی برای توسعه‌های بعدی */}
      <section className="bg-white rounded-xl shadow-sm border p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          نتایج آنالیز سئو (در حال توسعه)
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          این قسمت برای نمایش گزارش کامل سئو (عنوان، توضیحات متا، تگ‌های H1 تا H3،
          لینک‌های داخلی و خارجی، تصاویر و alt، اسکیما و...) در نظر گرفته شده است.
          هر زمان خواستی، می‌تونیم این بخش را به API آنالیز محتوا متصل کنیم تا
          گزارش خودکار تولید شود.
        </p>
      </section>
    </div>
  );
}
