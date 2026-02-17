// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// لیست محصولات
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const simple = searchParams.get("simple");
    const q = searchParams.get("q")?.trim();

    const where: any = {
      companyId: user.companyId,
    };

    if (q && q.length > 0) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // برای فرم‌ها (مثل BOM) فقط اطلاعات ساده می‌خواهیم
    if (simple === "1" || simple === "true") {
      const simpleList = products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        unit: p.unit,
      }));
      return NextResponse.json(simpleList);
    }

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت لیست محصولات" },
      { status: 500 },
    );
  }
}

// ایجاد محصول جدید
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | {
          sku?: string;
          name?: string;
          unit?: string | null;
          description?: string | null;
        }
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "بدنه درخواست نامعتبر است." },
        { status: 400 },
      );
    }

    const sku = (body.sku || "").trim();
    const name = (body.name || "").trim();
    const unit = (body.unit || "").trim();
    const description = (body.description || "")?.trim();

    if (!sku) {
      return NextResponse.json(
        { error: "کد کالا (SKU) الزامی است." },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "نام کالا الزامی است." },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        companyId: user.companyId,
        sku,
        name,
        unit: unit || undefined,
        description: description || undefined,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/products error:", err);

    // مدیریت خطای یکتا بودن SKU
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = (err.meta?.target as string[]) || [];
      if (target.includes("sku")) {
        return NextResponse.json(
          { error: "کد کالا (SKU) تکراری است. لطفاً کد دیگری انتخاب کنید." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "خطا در ایجاد محصول جدید" },
      { status: 500 },
    );
  }
}
