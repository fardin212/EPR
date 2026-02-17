import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

function safeCsvCell(v: any) {
  const s = String(v ?? "");

  // جلوگیری از CSV Injection در Excel
  const protectedCell = /^[=\-+@]/.test(s) ? "'" + s : s;

  // حذف newline و escape کوتیشن
  const clean = protectedCell.replace(/\r?\n/g, " ").replace(/"/g, '""');

  // همیشه داخل کوتیشن برگردون تا CSV پایدار باشه
  return `"${clean}"`;
}

export async function GET(req: Request) {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "all").trim();
  const q = (searchParams.get("q") || "").trim();

  const where: any = {};
  if (status && status !== "all") where.status = status;

  if (q) {
    where.OR = [
      { phone: { contains: q } },
      { name: { contains: q } },
      { city: { contains: q } },
      { slug: { contains: q } },
      { message: { contains: q } },
    ];
  }

  const leads = await prisma.usedConexLead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: {
      createdAt: true,
      status: true,
      name: true,
      phone: true,
      city: true,
      slug: true,
      message: true,
    },
  });

  const header = ["createdAt", "status", "name", "phone", "city", "slug", "message"];

  const lines = [
    header.map(safeCsvCell).join(","), // header هم کوتیشن بشه
    ...leads.map((l) =>
      [
        safeCsvCell(l.createdAt?.toISOString?.() || ""),
        safeCsvCell(l.status),
        safeCsvCell(l.name),
        safeCsvCell(l.phone),
        safeCsvCell(l.city),
        safeCsvCell(l.slug),
        safeCsvCell(l.message),
      ].join(",")
    ),
  ];

  // BOM برای اینکه Excel فارسی رو درست نشون بده
  const csv = "\uFEFF" + lines.join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="used-conex-leads.csv"`,
      "cache-control": "no-store",
    },
  });
}
