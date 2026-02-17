// components/WorkshopTypeTable.tsx
import Image from "next/image";

const types = [
  {
    key: "light",
    title: "سبک",
    image: "/images/workshop/light.jpg", // ← مسیر عکس مدل سبک
    items: [
      "اسکلت سبک با پروفیل نیمه‌سنگین",
      "مناسب کارگاه‌های موقت کوتاه‌مدت",
      "هزینه تمام‌شده اقتصادی‌تر",
    ],
  },
  {
    key: "heavy",
    title: "سنگین",
    image: "/images/workshop/heavy.jpg", // ← مسیر عکس مدل سنگین
    items: [
      "اسکلت سنگین با پروفیل صنعتی",
      "عمر مفید و مقاومت بیشتر",
      "قابل استفاده در پروژه‌های طولانی",
    ],
  },
  {
    key: "equip",
    title: "مجهز",
    image: "/images/workshop/equip.jpg", // ← مسیر عکس مدل مجهز
    items: [
      "کامل با برق‌کشی، عایق، پنجره دوجداره",
      "امکان نصب کولر گازی و بخاری",
      "مناسب دفاتر کارگاهی و مهندسی",
    ],
  },
];

export default function WorkshopTypeTable() {
  return (
    <section className="bg-[#021838] py-10">
      <div className="max-w-5xl mx-auto rounded-3xl border border-white/20 overflow-hidden">
        {/* ردیف بالا: عکس‌ها */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y divide-white/15 sm:divide-y-0 sm:divide-x">
          {types.map((t) => (
            <div key={t.key} className="relative aspect-[4/3]">
              <Image
                src={t.image}
                alt={`کانکس کارگاهی مدل ${t.title}`}
                fill
                className="object-contain bg-[#021838]"
              />
            </div>
          ))}
        </div>

        {/* ردیف عنوان‌ها */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-white/20">
          {types.map((t) => (
            <div
              key={t.key}
              className="flex flex-col items-center justify-center py-3 text-center"
            >
              <span className="text-[#ffc857] font-extrabold text-lg">
                {t.title}
              </span>
            </div>
          ))}
        </div>

        {/* ردیف توضیحات (جدول واقعی زیر هر ستون) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-white/20">
          {types.map((t) => (
            <div
              key={t.key}
              className="p-4 text-sm text-slate-100 space-y-1 border-t sm:border-t-0 sm:border-r border-white/10 last:border-none"
            >
              {t.items.map((line, i) => (
                <p key={i} className="leading-6">
                  • {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
