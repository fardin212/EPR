import Link from "next/link";
import Image from "next/image";

export default function CategoryCard({
  slug,
  name,
  imageUrl,
}: {
  slug: string;
  name: string;
  imageUrl?: string | null;
}) {
  return (
    <Link href={`/c/${slug}`} className="group rounded-xl overflow-hidden bg-white border">
      <div className="relative w-full aspect-[3/2]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-100" />
        )}
      </div>
      <div className="p-3 font-medium group-hover:text-[color:var(--accent)]">{name}</div>
    </Link>
  );
}
