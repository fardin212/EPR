"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";

import { redirect } from "next/navigation";

// نگاشت کلیدهای فرم به enum واقعی Prisma
const mapStatus = (key: string): string | null => {
  const m: Record<string, string> = {
    done: "DONE",
    in_progress: "IN_PROGRESS",
    not_done: "NOT_DONE",
    archived: "ARCHIVED",
    // اگر وضعیت‌های قدیمی را هم استفاده می‌کنید:
    new: "NEW",
    seen: "SEEN",
    quoted: "QUOTED",
    won: "WON",
    lost: "LOST",
  };
  return m[key] ?? null;
};

export async function setStatusAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("orderId"));
  const key = String(formData.get("status") || "");
  const status = mapStatus(key);
  if (!id || !status) return;
  await prisma.order.update({ where: { id }, data: { status: status as any } });
  redirect(`/admin/orders/${id}`);
}

export async function archiveAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("orderId"));
  if (!id) return;
  await prisma.order.update({ where: { id }, data: { status: "ARCHIVED" } });
  redirect(`/admin/orders/${id}`);
}

export async function deleteAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("orderId"));
  if (!id) return;
  await prisma.order.delete({ where: { id } });
  redirect("/admin/orders");
}
