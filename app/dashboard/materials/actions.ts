"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMeServer } from "@/lib/authMe";

function toNumber(v: FormDataEntryValue | null): number {
  if (v == null) return NaN;
  const n = Number(String(v).replace(/,/g, "").trim());
  return n;
}

export async function updateMaterialPriceAction(formData: FormData) {
  // ✅ حتماً companyId را از session بگیر و validate کن
  const me = await getMeServer();
  const companyId = Number(me?.companyId);

  if (!Number.isFinite(companyId) || companyId <= 0) {
    throw new Error("companyId نامعتبر است (session مشکل دارد)");
  }

  const materialId = Number(formData.get("materialId"));
  const note = (formData.get("note") || "").toString().trim();
  const price = toNumber(formData.get("unitPrice"));

  if (!Number.isFinite(materialId) || materialId <= 0) {
    throw new Error("materialId نامعتبر است");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("قیمت نامعتبر است");
  }

  // ✅ فقط مصالح همان شرکت
  const prev = await prisma.material.findFirst({
    where: { id: materialId, companyId },
    select: { unitPrice: true },
  });

  if (!prev) {
    throw new Error("عدم دسترسی / مصالح برای این شرکت نیست");
  }

  const prevNum = Number(prev.unitPrice ?? 0);
  if (prevNum === price) {
    revalidatePath("/dashboard/materials");
    return { ok: true, unchanged: true };
  }

  // ✅ ثبت تاریخچه قیمت قبلی
  await prisma.materialPriceHistory.create({
    data: {
      companyId, // <- حتماً number
      materialId,
      price: prev.unitPrice, // Decimal OK
      note: note ? `قبل از تغییر: ${note}` : "قبل از تغییر",
    },
  });

  // ✅ آپدیت قیمت جدید
  await prisma.material.update({
    where: { id: materialId },
    data: { unitPrice: price },
  });

  revalidatePath("/dashboard/materials");
  return { ok: true };
}
