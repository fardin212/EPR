// app/portfolio/page.tsx
import { prisma } from "@/lib/db";
import ProjectsExplorer from "@/components/ProjectsExplorer";

export const dynamic = "force-dynamic";

type ProjectForClient = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  cover: string;
  coverAlt: string; // ✅ ALT پیشنهادی برای تصویر کاور
};

async function getProjects(): Promise<ProjectForClient[]> {
  const projects = await prisma.project.findMany({
    orderBy: { id: "desc" },
    include: {
      category: { select: { name: true } },
    },
  });

  const projectIds = projects.map((p) => p.id);

  const images = await prisma.image.findMany({
    where: { projectId: { in: projectIds } },
    orderBy: { id: "asc" },
  });

  const coverByProject = new Map<number, string>();
  for (const img of images) {
    if (!img.projectId) continue;
    if (!coverByProject.has(img.projectId)) {
      coverByProject.set(img.projectId, img.url);
    }
  }

  return projects.map((p) => {
    const categoryName = p.category?.name ?? null;
    const cover = coverByProject.get(p.id) || "/images/fallback-metal.jpg";

    // ✅ فرمول ALT پیشنهادی:
    // اگر دسته دارد: "کانکس [دسته] – [عنوان پروژه] – کانکس نیکان"
    // اگر ندارد: "[عنوان پروژه] – کانکس نیکان"
    const baseCat = categoryName ? `کانکس ${categoryName} – ` : "";
    const coverAlt = `${baseCat}${p.title} – کانکس نیکان`;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: (p as any).summary ?? null,
      category: categoryName,
      cover,
      coverAlt,
    };
  });
}

export default async function PortfolioPage() {
  const projects = await getProjects();
  const total = projects.length;
  const categories = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean))
  ) as string[];

  return (
    <main className="proj-page">
      {/* HERO بالای صفحه */}
      <section className="proj-hero-outer">
        <div className="proj-hero">
          <div className="proj-hero-text">
            <span className="proj-hero-eyebrow">نمونه‌کارهای اجرا شده</span>
            <h1 className="proj-hero-title">گالری پروژه‌های کانکس نیکان</h1>
            <p className="proj-hero-subtitle">
              از کانکس نگهبانی تا سازه‌های ویلایی چندطبقه؛ در این صفحه می‌توانید
              نمونه‌ای از پروژه‌های واقعی ما را براساس نوع سازه و نیازتان
              بررسی کنید.
            </p>

            <div className="proj-hero-stats">
              <div className="proj-hero-stat">
                <span className="stat-number">{total}</span>
                <span className="stat-label">پروژه ثبت شده</span>
              </div>
              <div className="proj-hero-stat">
                <span className="stat-number">{categories.length}</span>
                <span className="stat-label">نوع سازه مختلف</span>
              </div>
              <div className="proj-hero-stat">
                <span className="stat-number">۱۴+</span>
                <span className="stat-label">سال تجربه اجرایی</span>
              </div>
            </div>
          </div>

          <div className="proj-hero-aside">
            <div className="proj-hero-card">
              <p>نیاز به مشاوره برای انتخاب کانکس مناسب دارید؟</p>
              <p className="proj-hero-card-small">
                مشخصات سایت، متراژ و نوع کاربری را بگویید تا تیم فنی نیکان
                بهترین گزینه‌ها را پیشنهاد دهد.
              </p>
              <a href="/order" className="btn btn-cta proj-hero-btn">
                ثبت درخواست مشاوره
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* بدنه اصلی + گرید پروژه‌ها */}
      <section className="proj-shell">
        {/* ✅ حالا هر پروژه یک coverAlt هم دارد، که بعداً در ProjectsExplorer استفاده می‌کنیم */}
        <ProjectsExplorer projects={projects} />
      </section>

      {/* CTA انتهای صفحه */}
      <section className="proj-bottom-cta">
        <div className="proj-bottom-inner">
          <div>
            <h2>کانکس اختصاصی خودتان را طراحی کنیم؟</h2>
            <p>
              اگر نمونه مشابه در این گالری دیدید یا خواستید طرح کاملاً جدیدی
              بسازید، تیم طراحی و مهندسی نیکان کنار شماست.
            </p>
          </div>
          <a href="/contact" className="btn btn-primary proj-bottom-btn">
            شروع سفارش کانکس
          </a>
        </div>
      </section>
    </main>
  );
}
