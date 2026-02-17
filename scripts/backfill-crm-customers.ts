import { prisma } from "../lib/db";

async function main() {
  const companyId = 1; // اگر company شما 1 نیست، تغییر بده

  const customers = await prisma.crmCustomer.findMany({
    where: { partyId: null },
    orderBy: { id: "asc" },
  });

  console.log("CRM customers without party:", customers.length);

  for (const c of customers) {
    const name = (c.name || "").trim();
    if (!name) continue;

    const existingParty = await prisma.party.findFirst({
      where: {
        companyId,
        kind: "CUSTOMER",
        OR: [
          ...(c.phone ? [{ phone: c.phone }, { mobile: c.phone }] : []),
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
        },
        select: { id: true },
      }));

    await prisma.crmCustomer.update({
      where: { id: c.id },
      data: { partyId: party.id },
    });

    console.log(`CRM#${c.id} -> Party#${party.id}`);
  }

  console.log("✅ Backfill completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
