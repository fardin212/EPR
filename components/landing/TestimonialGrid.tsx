import Section from "@/components/ui/Section";
import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import ReviewForm from "@/components/landing/ReviewForm";

type TItem = {
  name: string;
  text: string;
  rating?: number;
  tag?: string;
};

function Stars({ value = 5 }: { value?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            "h-4 w-4 " +
            (i < value ? "text-amber-500 fill-amber-500" : "text-slate-300")
          }
        />
      ))}
    </div>
  );
}

function Card({ t }: { t: TItem }) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.14)] transition-all p-5 md:p-6 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base md:text-lg">
            {t.name}
          </h3>
          {t.tag ? (
            <div className="mt-1 inline-flex rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs">
              {t.tag}
            </div>
          ) : null}
        </div>

        <div className="shrink-0">
          <Stars value={t.rating ?? 5} />
        </div>
      </div>

      <p className="mt-4 text-slate-700 text-sm md:text-[15px] leading-7 flex-1">
        {t.text}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
        تجربه واقعی مشتریان کانکس نیکان
      </div>
    </div>
  );
}

export default async function TestimonialGrid() {
  const approved = await prisma.siteReview.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 9,
    select: { name: true, rating: true, tag: true, body: true },
  });

  const items: TItem[] = approved.map((r) => ({
    name: r.name,
    rating: r.rating,
    tag: r.tag ?? undefined,
    text: r.body,
  }));

  return (
    <Section
      id="testimonials"
      title="نظر مشتریان"
      subtitle="تجربه کارفرماها + امکان ثبت نظر جدید"
    >
      <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length ? (
          items.map((t, idx) => <Card key={`${t.name}-${idx}`} t={t} />)
        ) : (
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white/95 p-6 text-slate-600 text-sm">
            هنوز نظری ثبت نشده است. اولین نفر باشید 🙂
          </div>
        )}
      </div>

      <ReviewForm />
    </Section>
  );
}
