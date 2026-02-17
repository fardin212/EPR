import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: Context) {
  const { id } = await context.params;
  const bomId = Number(id);

  const bom = await prisma.bomTemplate.findUnique({
    where: { id: bomId },
    include: {
      projectType: true,
      items: { include: { product: true } },
    },
  });

  if (!bom) {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }

  return NextResponse.json(bom);
}

export async function PATCH(req: NextRequest, context: Context) {
  const { id } = await context.params;
  const bomId = Number(id);

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
      name?: string;
      title?: string;
      description?: string;
      projectTypeId?: number | null;
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

    const existing = await prisma.bomTemplate.findUnique({
      where: { id: bomId },
    });

    if (!existing) {
      return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
    }

    if (items) {
      await prisma.bomItem.deleteMany({
        where: { bomId },
      });
    }

    const updated = await prisma.bomTemplate.update({
      where: { id: bomId },
      data: {
        name,
        title,
        description,
        projectTypeId: projectTypeId ?? undefined,
        isActive,
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
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/bom-templates/[id] error:", err);
    return NextResponse.json(
      { error: "خطا در ویرایش BOM Template" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, context: Context) {
  const { id } = await context.params;
  const bomId = Number(id);

  try {
    await prisma.bomTemplate.delete({
      where: { id: bomId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/bom-templates/[id] error:", err);
    return NextResponse.json(
      { error: "حذف ممکن نیست. احتمالا در پروژه استفاده شده است." },
      { status: 400 },
    );
  }
}
