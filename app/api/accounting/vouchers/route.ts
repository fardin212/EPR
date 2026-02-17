// app/api/accounting/vouchers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// -------------------------
// لیست اسناد حسابداری (برای تب «اسناد حسابداری» و داشبورد)
// -------------------------
export async function GET() {
  try {
    const vouchers = await prisma.accountingVoucher.findMany({
      orderBy: { date: "desc" },
      include: {
        project: true,
      },
      take: 50,
    });

    const items = vouchers.map((v) => ({
      id: v.id,
      date: v.date.toISOString(),
      refNo: v.refNo,
      type: v.type as any,
      projectName: v.project?.name ?? null,
      description: v.description,
      totalDebit: Number(v.totalDebit || 0),
      totalCredit: Number(v.totalCredit || 0),
    }));

    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /api/accounting/vouchers error:", e);
    return new NextResponse("خطا در خواندن اسناد حسابداری", { status: 500 });
  }
}

// -------------------------
// ثبت سند ساده دوبل (برای فرم بالای تب «اسناد حسابداری»)
// -------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      date,
      type,
      description,
      items,
    }: {
      date: string;
      type?: string;
      description?: string;
      items: {
        accountCode: string;
        description?: string;
        debit?: number;
        credit?: number;
      }[];
    } = body;

    if (!date || !items || !Array.isArray(items) || items.length === 0) {
      return new NextResponse("دادهٔ ارسالی معتبر نیست", { status: 400 });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return new NextResponse("تاریخ نامعتبر است", { status: 400 });
    }

    // حساب‌ها را بر اساس کد پیدا می‌کنیم
    const codes = items.map((i) => i.accountCode);
    const accounts = await prisma.accountingAccount.findMany({
      where: { code: { in: codes } },
    });
    const accByCode = new Map(accounts.map((a) => [a.code, a]));

    for (const it of items) {
      if (!accByCode.has(it.accountCode)) {
        return new NextResponse(
          `کد حساب ${it.accountCode} پیدا نشد (اول حساب را بسازید).`,
          { status: 400 }
        );
      }
    }

    // محاسبه جمع بدهکار / بستانکار و آماده‌سازی ردیف‌ها
    let totalDebit = 0;
    let totalCredit = 0;

    const voucherItemsData = items.map((it) => {
      const debit = Number(it.debit || 0);
      const credit = Number(it.credit || 0);
      totalDebit += debit;
      totalCredit += credit;

      return {
        accountId: accByCode.get(it.accountCode)!.id,
        description: it.description ?? description ?? "",
        debit,
        credit,
      };
    });

    // ایجاد سند و ردیف‌ها در یک تراکنش
    const created = await prisma.$transaction(async (tx) => {
      const refNo = await getNextRefNo(tx);

      const voucher = await tx.accountingVoucher.create({
        data: {
          companyId: 1, // فعلاً یک شرکت؛ بعداً از session شرکت جاری را می‌خوانیم
          date: parsedDate,
          refNo,
          type: (type as any) || "GENERAL",
          description: description ?? null,
          totalDebit,
          totalCredit,
        },
      });

      await tx.accountingVoucherItem.createMany({
        data: voucherItemsData.map((row) => ({
          ...row,
          voucherId: voucher.id,
        })),
      });

      return voucher;
    });

    const result = {
      id: created.id,
      date: created.date.toISOString(),
      refNo: created.refNo,
      type: created.type as any,
      projectName: null,
      description: created.description,
      totalDebit: Number(created.totalDebit || 0),
      totalCredit: Number(created.totalCredit || 0),
    };

    // فرم AccountingPageClient منتظر همین ساختار است
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error("POST /api/accounting/vouchers error:", e);
    return new NextResponse("خطا در ثبت سند حسابداری", { status: 500 });
  }
}

// گرفتن شماره سند بعدی (ساده، بر اساس آخرین refNo)
async function getNextRefNo(tx: any): Promise<string> {
  const last = await tx.accountingVoucher.findFirst({
    orderBy: { id: "desc" },
    select: { refNo: true },
  });

  const lastNum = last?.refNo ? parseInt(last.refNo, 10) || 0 : 0;
  const next = lastNum + 1;
  return String(next).padStart(5, "0");
}
