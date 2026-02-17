import Link from "next/link";
import Image from "next/image";

export default function PortfolioCard({
  slug,
  title,
  coverUrl,
  createdAt,
}: {
  slug: string;
  title: string;
  coverUrl?: string | null;
  createdAt?: Date | string | null;
}) {
  return (
    <Link href={`/portfolio/${slug}`} className="group rounded-xl overflow-hidden bg-white border">
      <div className="relative w-full aspect-[16/9]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-100" />
        )}
      </div>
      <div className="p-3">
        <div className="font-medium group-hover:text-[color:var(--accent)]">{title}</div>
        {createdAt && (
          <div className="text-xs text-zinc-500 mt-1">
            {new Date(createdAt).toLocaleDateString("fa-IR")}
          </div>
        )}
      </div>
    </Link>
  );
}
