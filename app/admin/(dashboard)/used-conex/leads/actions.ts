"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
// اگر دارید:
import { requireAdmin } from "@/lib/adminGuard";

// اگر در Prisma status به صورت enum هست، همین لیست رو دقیقاً مطابق enum خودت تنظیم کن
const ALLOWED_STATUSES = ["new", "contacted", "won", "lost", "spam"] as const;
type LeadStatus = (typeof ALLOWED_STATUSES)[number];

function assertStatus(status: string): LeadStatus {
  const s = String(status || "").trim().toLowerCase();
  if ((ALLOWED_STATUSES as readonly string[]).includes(s)) return s as LeadStatus;
  throw new Error("وضعیت نامعتبر است");
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  await requireAdmin();

  if (!id) throw new Error("id الزامی است");
  const st = assertStatus(status);

  await prisma.usedConexLead.update({
    where: { id },
    data: { status: st as any },
  });

  // صفحه لیست + داشبورد (اگر دارید)
  revalidatePath("/admin/used-conex/leads");
  revalidatePath("/admin/used-conex/leads/dashboard");
}

export async function deleteLead(id: string): Promise<void> {
  await requireAdmin();

  if (!id) throw new Error("id الزامی است");

  // اگر leadNotifyLog به lead وصل نیست، همین کافیه.
  // اگر وصل هست و FK دارید، قبلش باید لاگ‌ها پاک بشه.
  // await prisma.leadNotifyLog.deleteMany({ where: { leadId: id } });

  await prisma.usedConexLead.delete({ where: { id } });

  revalidatePath("/admin/used-conex/leads");
  revalidatePath("/admin/used-conex/leads/dashboard");
}
