export default function Section(
  { title, subtitle, children, id, actions }:
  { title?: string; subtitle?: string; children: React.ReactNode; id?: string; actions?: React.ReactNode }
) {
  return (
    <section id={id} className="max-w-7xl mx-auto px-4 py-12">
      {(title || subtitle || actions) && (
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
