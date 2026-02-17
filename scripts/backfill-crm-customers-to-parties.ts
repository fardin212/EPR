import { prisma } from "../lib/db";

async function main() {
  // اگر multi-company هستی و crmCustomer.companyId نداری،
  // باید companyId را از user/session/تنظیمات بگیری.
  // فعلاً فرض می‌کنیم همه CRM برای companyId=1 است.
  // اگر شرکت شما 1 نیست، همینجا تغییر بده.
  const companyId = 1;

  const customers = await prisma.crmCustomer.findMany({
    where: { partyId: null },
    orderBy: { id: "asc" },
  });

  console.log("Customers to backfill:", customers.length);

  for (const c of customers) {
    const name = (c.name || "").trim();
    if (!name) continue;

    // تلاش برای جلوگیری از تکرار: اگر party با همین نام/تلفن هست، از همان استفاده کن
    const existingParty = await prisma.party.findFirst({
      where: {
        companyId,
        kind: "CUSTOMER",
        OR: [
          ...(c.phone ? [{ phone: c.phone }] : []),
          ...(c.phone ? [{ mobile: c.phone }] : []),
          { name },
        ],
      },
      select: { id: true },
    });

    const party =
      existingParty ??
      (await prisma.party.create({
        data: {
          companyId,
          kind: "CUSTOMER",
          type: "CUSTOMER",
          name,
          phone: c.phone ?? null,
          mobile: c.phone ?? null,
          email: c.email ?? null,
          companyName: c.companyName ?? null,
          address: null,
        },
        select: { id: true },
      }));

    await prisma.crmCustomer.update({
      where: { id: c.id },
      data: { partyId: party.id },
    });

    console.log(`Backfilled CRM#${c.id} -> Party#${party.id}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
