import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function RecentProjects() {
  const items = await prisma.project.findMany({
    orderBy: { id: "desc" },
    take: 12,
  });

  return (
    <section id="recent-projects" className="py-12 bg-graybg-light">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">نمونه پروژه‌های اخیر</h2>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
            {items.map((p: any) => (
              <div className="snap-center min-w-[80%] sm:min-w-[45%] lg:min-w-[30%]" key={p.id}>
                <Link href={`/project/${p.slug}`} className="card">
                  <div className="aspect-[16/9] rounded-xl2" style={{ background: "#2f3136" }}></div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="font-bold">{p.title}</div>
                    <span className="text-xs text-brand">پروژه</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
