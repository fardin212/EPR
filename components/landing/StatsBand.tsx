// =======================================
// file: components/landing/StatsBand.tsx
// اعداد کلیدی پروژه‌ها
// =======================================
export default function StatsBand() {
  const stats = [
    { n: "10+", l: "سال تجربه" },
    { n: "350+", l: "پروژه تحویل‌شده" },
    { n: "20+", l: "شهر تحت پوشش" },
    { n: "4.9/5", l: "رضایت مشتریان" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[var(--panel)] border border-[var(--panel-border)] shadow-sm p-5 text-center"
          >
            <div className="text-3xl font-black text-[var(--link)]">
              {s.n}
            </div>
            <div className="text-sm mt-1 text-[var(--fg-sub)]">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
