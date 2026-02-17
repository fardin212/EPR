// lib/accounting.ts
import { prisma } from "@/lib/db";

type VoucherItemInput = {
  accountId: number;
  projectId?: number;
  debit?: bigint | number;
  credit?: bigint | number;
  note?: string | null;
};

export async function createProjectVoucher(options: {
  companyId: number;
  projectId: number;
  date: Date;
  type: string;           // مثلا "PROJECT_COST"
  description?: string;
  items: VoucherItemInput[];
}) {
  let totalDebit = BigInt(0);
  let totalCredit = BigInt(0);

  const preparedItems = options.items.map((it) => {
    const debit = BigInt(it.debit ?? 0);
    const credit = BigInt(it.credit ?? 0);

    totalDebit += debit;
    totalCredit += credit;

    return {
      accountId: it.accountId,
      projectId: options.projectId,
      debit,
      credit,
      note: it.note ?? null,
    };
  });

  if (totalDebit !== totalCredit) {
    throw new Error("مجموع بدهکار و بستانکار برابر نیست (سند دوبل پروژه).");
  }

  const voucher = await prisma.accountingVoucher.create({
    data: {
      companyId: options.companyId,
      date: options.date,
      type: options.type,
      description: options.description,
      totalDebit,
      totalCredit,
      items: {
        createMany: {
          data: preparedItems,
        },
      },
    },
  });

  return voucher;
}
