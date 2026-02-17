// کامپوننت SSR است؛ نیازی به "use client" ندارد.
type Part = { text: string; accent?: boolean; dim?: boolean };

export default function ShinyHeadline({
  parts,
  className = "",
}: {
  parts: Part[];
  className?: string;
}) {
  return (
    <h1 className={`leading-tight font-black ${className}`}>
      <span className="shine-track">
        {/* لایهٔ نور در حال حرکت روی کل تیتر */}
        <span aria-hidden className="shine-sweep" />
        {/* واژه‌ها با تاخیر کم ظاهر می‌شوند */}
        {parts.map((p, i) => (
          <span
            key={i}
            className={[
              "word-pop",
              p.accent ? "word-accent word-highlight" : "",
              p.dim ? "opacity-90" : "",
            ].join(" ")}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {p.text}{" "}
          </span>
        ))}
      </span>
    </h1>
  );
}
