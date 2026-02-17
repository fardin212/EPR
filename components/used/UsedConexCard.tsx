import Link from "next/link";
import StatusBadge, { BadgeStatus } from "./StatusBadge";

export type UsedConexMock = {
  id: string;
  slug: string;   // ✅ اضافه شد
  title: string;
  type: string;
  size: string;
  city: string;
  price: number;
  status: BadgeStatus;
  isReady: boolean;
};

function formatToman(n: number) {
  return n.toLocaleString("fa-IR") + " تومان";
}

export default function UsedConexCard({ item }: { item: UsedConexMock }) {
  return (
    <article className="group rounded-2xl border bg-white p-4 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold leading-7">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {item.type} • {item.size} • {item.city}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">قیمت حدودی</div>
        <div className="font-extrabold">{formatToman(item.price)}</div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          {item.isReady ? "تحویل فوری" : "نیازمند هماهنگی تحویل"}
        </div>

        {/* فعلاً لینک نمایشی؛ مرحله بعد صفحه جزئیات می‌سازیم */}
        <Link
          href={`/used-conex/buy/${item.slug}`}
          className="text-sm font-semibold underline decoration-transparent transition group-hover:decoration-current"
        >
          مشاهده جزئیات
        </Link>
      </div>
    </article>
  );
}
