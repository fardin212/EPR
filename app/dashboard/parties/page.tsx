// app/dashboard/parties/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import PartyDeleteButton from "./ui/PartyDeleteButton";

export const dynamic = "force-dynamic";

type SearchParams = {
  kind?: string;
  q?: string;
};

async function getParties(filters: SearchParams) {
  const { kind, q } = filters;

  const where: any = {};
  if (kind && kind !== "ALL") where.kind = kind;

  if (q?.trim()) {
    where.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      { mobile: { contains: q.trim() } },
      { phone: { contains: q.trim() } },
      { companyName: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  return prisma.party.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

function kindLabel(kind: string) {
  switch (kind) {
    case "CUSTOMER":
      return "مشتری";
    case "CONTRACTOR":
      return "پیمانکار";
    case "SUPPLIER":
      return "تأمین‌کننده";
    case "PERSON":
      return "سایر";
    default:
      return kind;
  }
}

function kindBadgeClass(kind: string) {
  switch (kind) {
    case "CUSTOMER":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "CONTRACTOR":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
    case "SUPPLIER":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
    case "PERSON":
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

export default async function PartiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const parties = await getParties(params);

  const activeKind = params.kind || "ALL";
  const q = params.q || "";

  const kinds = [
    { key: "ALL", label: "همه" },
    { key: "CUSTOMER", label: "مشتریان" },
    { key: "CONTRACTOR", label: "پیمانکاران" },
    { key: "SUPPLIER", label: "تأمین‌کنندگان" },
    { key: "PERSON", label: "سایر" },
  ];

  const makeHref = (next: { kind?: string; q?: string }) => {
    const sp = new URLSearchParams();
    const nk = next.kind ?? activeKind;
    const nq = next.q ?? q;

    if (nk && nk !== "ALL") sp.set("kind", nk);
    if (nq?.trim()) sp.set("q", nq.trim());

    const s = sp.toString();
    return s ? `/dashboard/parties?${s}` : "/dashboard/parties";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header card */}
      <div className="rounded-3xl border bg-white shadow-sm">
        <div className="p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              طرف‌حساب‌ها / CRM
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              مدیریت مشتریان، پیمانکاران، تأمین‌کنندگان و سایر ارتباطات.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <form className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="جستجو در نام، موبایل، تلفن، شرکت…"
                className="w-full sm:w-72 h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
              {activeKind !== "ALL" ? (
                <input type="hidden" name="kind" value={activeKind} />
              ) : null}
              <button className="h-10 px-4 rounded-xl border bg-slate-900 text-white text-sm hover:bg-slate-800 transition">
                جستجو
              </button>
            </form>

            <Link
              href="/dashboard/parties/new"
              className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm flex items-center justify-center hover:bg-indigo-700 transition"
            >
              + طرف‌حساب جدید
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 sm:px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => {
              const active = activeKind === k.key;
              return (
                <a
                  key={k.key}
                  href={makeHref({ kind: k.key })}
                  className={[
                    "px-3 py-1.5 rounded-full text-sm border transition",
                    active
                      ? "bg-indigo-600 text-white border-transparent"
                      : "bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {k.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="mt-5 rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            تعداد:{" "}
            <span className="font-semibold text-slate-900">{parties.length}</span>
          </div>
          <div className="text-xs text-slate-500">
            برای ویرایش روی «ویرایش» بزن
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-right">
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 border-b">
                  نام
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 border-b">
                  نوع
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 border-b">
                  شرکت / سازمان
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 border-b">
                  تماس
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 border-b">
                  توضیحات
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 border-b w-[190px]">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {parties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 border-b">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{p.name}</span>
                      <span className="text-[11px] text-slate-500">#{p.id}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 border-b">
                    <span
                      className={[
                        "inline-flex items-center px-2 py-1 rounded-full text-xs",
                        kindBadgeClass(p.kind),
                      ].join(" ")}
                    >
                      {kindLabel(p.kind)}
                    </span>
                  </td>

                  <td className="px-4 py-3 border-b text-slate-700">
                    {p.companyName || "—"}
                  </td>

                  <td className="px-4 py-3 border-b text-slate-700">
                    <div className="flex flex-col gap-1">
                      <span>{p.mobile || p.phone || "—"}</span>
                      {p.mobile ? (
                        <span className="text-[11px] text-slate-500">
                          موبایل
                        </span>
                      ) : p.phone ? (
                        <span className="text-[11px] text-slate-500">تلفن</span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-3 border-b text-slate-700">
                    <span className="line-clamp-2">
                      {p.note || p.description || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/parties/${p.id}`}
                        className="h-9 px-3 rounded-xl border text-sm hover:bg-white transition bg-slate-50"
                      >
                        ویرایش
                      </Link>

                      <PartyDeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}

              {parties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    هنوز طرف‌حسابی ثبت نشده است.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
