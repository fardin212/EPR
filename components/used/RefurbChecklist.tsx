export default function RefurbChecklist({
  items,
}: {
  items: { title: string; desc?: string }[];
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm font-semibold">موارد بازسازی انجام‌شده</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((x, i) => (
          <div key={i} className="rounded-xl border px-4 py-3">
            <div className="text-sm font-semibold">✔ {x.title}</div>
            {x.desc && <div className="mt-1 text-xs text-gray-600">{x.desc}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
