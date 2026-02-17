"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminGuard";

type Status = "pending" | "approved" | "rejected";

export async function setReviewStatus(id: number, status: Status) {
  await requireAdmin();

  await prisma.siteReview.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/"); // چون نظرات در صفحه اصلی نمایش داده می‌شوند
}

export async function deleteReview(id: number) {
  await requireAdmin();

  await prisma.siteReview.delete({
    where: { id },
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/");
}
