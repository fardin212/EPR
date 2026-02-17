// app/admin/(dashboard)/orders/actions.ts
"use server";

import { prisma } from "@/lib/db";
import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminGuard";

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
) {
  await requireAdmin();

  // اطمینان از اینکه ورودی عدد است
  const id = Number(orderId);
  if (!Number.isFinite(id)) {
    throw new Error("INVALID_ORDER_ID");
  }

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  // برای رفرش شدن لیست بعد از تغییر
  revalidatePath("/admin/orders");
}
