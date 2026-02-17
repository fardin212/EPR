"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function toInt(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toBigIntFromAny(v: any) {
  // ورودی ممکنه "97,500,000" یا "97500000" یا عدد باشه
  const s = String(v ?? "").replace(/[^\d-]/g, "");
  if (!s) return 0n;
  try {
    return BigInt(s);
  } catch {
    return 0n;
  }
}

export async function updateEstimateAndItemsAction(formData: FormData) {
  const estimateId = toInt(formData.get("estimateId"));
  if (!estimateId) throw new Error("Invalid estimateId");

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const projectLocation = String(formData.get("projectLocation") ?? "").trim() || null;
  const usageType = String(formData.get("usageType") ?? "").trim() || null;

  const deliveryDaysRaw = formData.get("deliveryDays");
  const deliveryDays =
    deliveryDaysRaw === null || String(deliveryDaysRaw).trim() === ""
      ? null
      : toInt(deliveryDaysRaw);

  const paymentTerms = String(formData.get("paymentTerms") ?? "").trim() || null;
  const warrantyTerms = String(formData.get("warrantyTerms") ?? "").trim() || null;
  const transportTerms = String(formData.get("transportTerms") ?? "").trim() || null;
  const notesForCustomer = String(formData.get("notesForCustomer") ?? "").trim() || null;

  // itemsJson: [{title, amount}]
  const itemsJson = String(formData.get("itemsJson") ?? "[]");
  let items: Array<{ title: string; amount: any }> = [];
  try {
    items = JSON.parse(itemsJson);
    if (!Array.isArray(items)) items = [];
  } catch {
    items = [];
  }

  const cleaned = items
    .map((x) => ({
      title: String(x?.title ?? "").trim(),
      amount: toBigIntFromAny(x?.amount),
    }))
    .filter((x) => x.title.length > 0);

  // مجموع
  const total = cleaned.reduce((s, x) => s + x.amount, 0n);

  await prisma.$transaction(async (tx) => {
    // آپدیت هدر پیش‌فاکتور
    await tx.containerEstimate.update({
      where: { id: estimateId },
      data: {
        customerName,
        customerPhone,
        projectLocation,
        usageType,
        deliveryDays,
        paymentTerms,
        warrantyTerms,
        transportTerms,
        notesForCustomer,
        // جمع نهایی را از آیتم‌ها می‌گیریم
        finalPrice: total,
      },
    });

    // جایگزینی کامل آیتم‌ها (ساده و بدون باگ)
    await tx.containerEstimateDisplayItem.deleteMany({
      where: { estimateId: estimateId },
    });

    if (cleaned.length) {
      await tx.containerEstimateDisplayItem.createMany({
        data: cleaned.map((x, idx) => ({
          estimateId: estimateId,
          sortOrder: idx + 1,
          title: x.title,
          amount: x.amount,
        })),
      });
    }
  });

  revalidatePath(`/dashboard/container-estimates/${estimateId}`);
  revalidatePath(`/dashboard/container-estimates/${estimateId}?edit=1`);
}
