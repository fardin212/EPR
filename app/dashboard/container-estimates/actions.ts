"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteContainerEstimateAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) throw new Error("Invalid id");

  await prisma.$transaction(async (tx) => {
    // 1) حذف BOM و خطوط BOM (اگر وجود دارد)
    const bom = await tx.containerEstimateBom.findFirst({
      where: { estimateId: id },
      select: { id: true },
    });

    if (bom) {
      await tx.containerEstimateBomLine.deleteMany({
        where: { bomId: bom.id },
      });
      await tx.containerEstimateBom.delete({
        where: { id: bom.id },
      });
    }

    // 2) حذف آیتم‌های نمایشی و آپشن‌ها
    await tx.containerEstimateDisplayItem.deleteMany({
      where: { estimateId: id },
    });

    await tx.containerEstimateExtra.deleteMany({
      where: { estimateId: id },
    });

    // 3) اگر Line جداگانه داری
    // (در لاگ‌های قبلی مدل ContainerEstimateLine دیده می‌شد)
    await tx.containerEstimateLine.deleteMany({
      where: { estimateId: id },
    });

    // 4) خود پیش‌فاکتور
    await tx.containerEstimate.delete({
      where: { id },
    });
  });

  revalidatePath("/dashboard/container-estimates");
}
