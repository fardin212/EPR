import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const accounts = await prisma.accountingAccount.findMany({
      orderBy: { code: "asc" },
    });

    const data = accounts.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      type: a.type, // AccountingAccountType
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Accounting accounts error:", err);
    return new NextResponse("خطا در بارگذاری لیست حساب‌ها", {
      status: 500,
    });
  }
}
