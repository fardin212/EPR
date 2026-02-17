import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectTypeId = searchParams.get("projectTypeId");

  const where: any = {};
  if (projectTypeId) {
    where.projectTypeId = Number(projectTypeId);
  }

  const templates = await prisma.bomTemplate.findMany({
    where,
    include: {
      projectType: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      title,
      description,
      projectTypeId,
      isActive,
      items,
    } = body as {
      name: string;
      title?: string;
      description?: string;
      projectTypeId?: number;
      isActive?: boolean;
      items?: {
        productId: number;
        quantity: number;
        quantityPerUnit?: number;
        unit?: string;
        stageName?: string;
        note?: string;
      }[];
    };

    if (!name) {
      return NextResponse.json(
        { error: "فیلد name برای BOM الزامی است." },
        { status: 400 },
      );
    }

    // فعلاً companyId را ثابت 1 می‌گذاریم (بعداً از session خوانده می‌شود)
    const companyId = 1;

    const created = await prisma.bomTemplate.create({
      data: {
        name,
        title: title ?? name,
        description,
        projectTypeId: projectTypeId ?? null,
        isActive: isActive ?? true,
        companyId,
        items: items
          ? {
              create: items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                quantityPerUnit: i.quantityPerUnit ?? 1,
                unit: i.unit,
                stageName: i.stageName,
                note: i.note,
              })),
            }
          : undefined,
      },
      include: {
        projectType: true,
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/bom-templates error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد BOM Template" },
      { status: 500 },
    );
  }
}
