// app/api/crm/customers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMeServer } from "@/lib/auth";

function norm(v: any, max = 200) {
  const s = (v ?? "").toString().trim();
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

function normPhone(v: any) {
  const s = norm(v, 50);
  if (!s) return null;
  // عدد/+ را نگه می‌داریم
  const cleaned = s.replace(/[^\d+]/g, "");
  return cleaned || null;
}

export async function GET(req: Request) {
  try {
    const me = await getMeServer();
    if (!me?.companyId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = norm(searchParams.get("q"), 200);

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { companyName: { contains: q } },
      ];
    }

    const customers = await prisma.crmCustomer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        party: true, // ✅ چون الان partyId داریم، برای UI خیلی مفیده
      },
      take: 300,
    });

    return NextResponse.json(customers);
  } catch (err) {
    console.error("GET /api/crm/customers error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت لیست مشتری‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const me = await getMeServer();
    if (!me?.companyId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();

    const name = norm(body.name, 200);
    if (!name) {
      return NextResponse.json({ error: "نام مشتری الزامی است." }, { status: 400 });
    }

    const phone = normPhone(body.phone) ?? null; // ✅ منبع اصلی شماره در CRM شما
    const email = norm(body.email, 120) || null;
    const companyName = norm(body.companyName, 200) || null;
    const type = norm(body.type, 80) || null;
    const note = norm(body.note, 1000) || null;

    // ✅ اگر فرستادی استفاده می‌کنیم (در مدل CrmCustomer نیست، ولی Party می‌تونه داشته باشه)
    const address = norm(body.address, 500) || null;
    const nationalId = norm(body.nationalId, 40) || null;

    const lastDealAt = body.lastDealAt ? new Date(body.lastDealAt) : null;

    const result = await prisma.$transaction(async (tx) => {
      // 1) جلوگیری از تکرار CRM Customer:
      // اگر قبلاً با همین name+phone موجود بود، همان را برگردان
      const existingCustomer = await tx.crmCustomer.findFirst({
        where: {
          name,
          ...(phone ? { phone } : {}),
        },
        include: { party: true },
      });

      if (existingCustomer) {
        return existingCustomer;
      }

      // 2) پیدا کردن Party موجود (برای جلوگیری از تکرار Party)
      const existingParty = await tx.party.findFirst({
        where: {
          companyId: me.companyId,
          kind: "CUSTOMER",
          OR: [
            ...(phone ? [{ phone }, { mobile: phone }] : []),
            ...(nationalId ? [{ nationalId }] : []),
            { name },
          ],
        },
        select: { id: true },
      });

      const party =
        existingParty ??
        (await tx.party.create({
          data: {
            companyId: me.companyId,
            kind: "CUSTOMER",
            type: "CUSTOMER",
            name,
            phone: phone,
            mobile: phone, // ✅ چون CRM mobile جدا ندارد
            email,
            companyName,
            nationalId,
            address,
          },
          select: { id: true },
        }));

      // 3) ساخت CRM Customer و اتصال به Party
      const customer = await tx.crmCustomer.create({
        data: {
          partyId: party.id, // ✅ اتصال مستقیم
          name,
          type,
          phone,
          email,
          companyName,
          lastDealAt,
          note,
        },
        include: { party: true },
      });

      return customer;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/crm/customers error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد مشتری" },
      { status: 500 }
    );
  }
}
