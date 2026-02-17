// =======================================
// file: components/landing/Perks.tsx
// ۴ مزیت کلیدی با چیدمان شیک
// =======================================
export default function Perks() {
  const items = [
    { t: "طراحی سفارشی", d: "ابعاد و پلان دلخواه شما" },
    { t: "متریال استاندارد", d: "پروفیل و ورق برند" },
    { t: "تحویل سریع", d: "زمان‌بندی شفاف پروژه" },
    { t: "گارانتی و پشتیبانی", d: "پسا فروش واقعی" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 pt-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((x, i) => (
          <div key={i} className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-black/5 p-4 shadow-soft hover:shadow-lg transition">
            <div className="text-brand font-extrabold mb-1">{x.t}</div>
            <div className="text-slate-600 text-sm">{x.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
