import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// /api/accounting/dashboard
export async function GET() {
  try {
    // همه ردیف‌های اسناد به همراه حساب و خود سند
    const voucherItems = await prisma.accountingVoucherItem.findMany({
      include: {
        account: true,
        voucher: true,
      },
    });

    // آخرین چند سند برای نمایش در داشبورد
    const lastVouchersRaw = await prisma.accountingVoucher.findMany({
      orderBy: { date: "desc" },
      take: 5,
    });

    // آمار کلی پروژه و تعداد اسناد
    const [projectCount, vouchersCount] = await Promise.all([
      prisma.project.count(),
      prisma.accountingVoucher.count(),
    ]);

    // محاسبه جمع درآمد/هزینه
    let totalIncome = 0;
    let totalExpense = 0;

    const monthlyMap = new Map<
      string,
      {
        income: number;
        expense: number;
      }
    >();

    for (const it of voucherItems) {
      const accType = it.account.type; // AccountingAccountType
      const v = it.voucher;
      const vDate = v?.date ?? null;
      const debit = Number(it.debit || 0);
      const credit = Number(it.credit || 0);

      // ماه به‌صورت "YYYY-MM"
      if (vDate) {
        const key = `${vDate.getFullYear()}-${String(
          vDate.getMonth() + 1
        ).padStart(2, "0")}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, { income: 0, expense: 0 });
        }
      }

      if (accType === "REVENUE") {
        const val = credit - debit;
        totalIncome += val;
        if (vDate) {
          const key = `${vDate.getFullYear()}-${String(
            vDate.getMonth() + 1
          ).padStart(2, "0")}`;
          const row = monthlyMap.get(key)!;
          row.income += val;
        }
      } else if (accType === "EXPENSE") {
        const val = debit - credit;
        totalExpense += val;
        if (vDate) {
          const key = `${vDate.getFullYear()}-${String(
            vDate.getMonth() + 1
          ).padStart(2, "0")}`;
          const row = monthlyMap.get(key)!;
          row.expense += val;
        }
      }
    }

    // لیست آخرین اسناد برای جدول داشبورد
    const lastVouchers = lastVouchersRaw.map((v) => ({
      id: v.id,
      date: v.date.toISOString(),
      refNo: v.refNo,
      type: v.type, // همان ENUM حسابداری
      totalDebit: Number(v.totalDebit || 0),
      totalCredit: Number(v.totalCredit || 0),
    }));

    // تبدیل map ماهانه به آرایه مرتب‌شده
    const monthlyCashflow = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, row]) => ({
        month,
        income: row.income,
        expense: row.expense,
      }));

    const payload = {
      totalIncome,
      totalExpense,
      projectCount,
      vouchersCount,
      lastVouchers,
      monthlyCashflow,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Accounting dashboard error:", err);
    return new NextResponse("خطا در بارگذاری داشبورد حسابداری", {
      status: 500,
    });
  }
}
