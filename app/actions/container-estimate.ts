"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMeServer } from "@/lib/authMe";
import { ProfitType, ContainerEstimateType } from "@prisma/client";

/* ================= utils ================= */
function n(v: any): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function round0(v: number) {
  return Math.round(v);
}
function bi0(v: number) {
  return BigInt(round0(v));
}

/* ================= input types ================= */
type ExtraInput = {
  title: string;
  amount: number;
};

type DisplayItemInput = {
  title: string;
  amount: number;
};

type CreateEstimateInput = {
  estimateType: ContainerEstimateType; // STANDARD | LUXURY

  containerModelId: number;
  sizePresetId: number;

  // ابعاد کلی (صرفاً snapshot کلی – پروژه چندطبقه داخل spec است)
  length: number;
  width: number;
  height: number;

  // امکانات/طبقات/تراس‌ها...
  spec?: any;
  specSummary?: string;

  // ---- customer snapshot ----
  customerName: string;
  customerPhone: string;
  projectLocation?: string;
  usageType?: string;

  // ---- terms ----
  validUntil?: Date;
  deliveryDays?: number;
  paymentTerms?: string;
  warrantyTerms?: string;
  transportTerms?: string;
  notesForCustomer?: string;

  profitType: ProfitType;
  profitValue: number;

  // ✅ ردیف‌های قیمت‌دار مشتری (طبقات، تراس‌ها، آیتم‌های قابل ارائه)
  displayItems: DisplayItemInput[];

  // ✅ هزینه‌های دستی (اختیاری)
  extras?: ExtraInput[];
};

/* ================= main action ================= */
export async function createContainerEstimate(input: CreateEstimateInput) {
  const me = await getMeServer();
  const companyId = Number(me.companyId);
  if (!companyId) throw new Error("companyId نامعتبر است");

  const {
    estimateType,
    containerModelId,
    sizePresetId,
    length,
    width,
    height,

    spec,
    specSummary,

    customerName,
    customerPhone,
    projectLocation,
    usageType,

    validUntil,
    deliveryDays,
    paymentTerms,
    warrantyTerms,
    transportTerms,
    notesForCustomer,

    profitType,
    profitValue,

    displayItems,
    extras,
  } = input;

  if (!customerName?.trim()) throw new Error("نام مشتری الزامی است");
  if (!customerPhone?.trim()) throw new Error("شماره تماس مشتری الزامی است");
  if (!containerModelId) throw new Error("نوع کانکس الزامی است");
  if (!sizePresetId) throw new Error("سایز (preset) الزامی است");
  if (!Array.isArray(displayItems) || displayItems.length === 0) {
    throw new Error("حداقل یک آیتم قیمت‌دار (طبقه/تراس/...) وارد کن");
  }

  // ✅ امنیت چندشرکتی: این مدل کانکس باید متعلق به همین شرکت باشد
  const model = await prisma.containerModel.findUnique({
    where: { id: containerModelId },
    select: { id: true, companyId: true },
  });
  if (!model) throw new Error("نوع کانکس معتبر نیست");
  if (Number(model.companyId) !== companyId) throw new Error("دسترسی غیرمجاز");

  /* ---------- sanitize display items ---------- */
  const displaySan = displayItems
    .map((x) => ({
      title: String(x.title ?? "").trim(),
      amount: round0(n(x.amount)),
    }))
    .filter((x) => x.title && x.amount > 0);

  if (displaySan.length === 0) throw new Error("آیتم‌های قیمت‌دار معتبر نیستند");

  /* ---------- extras (optional) ---------- */
  const extrasSan = (extras ?? [])
    .map((e) => ({
      title: String(e.title ?? "").trim(),
      amount: round0(n(e.amount)),
    }))
    .filter((e) => e.title && e.amount > 0);

  /* ---------- totals ---------- */
  const materialsTotal = round0(displaySan.reduce((s, x) => s + x.amount, 0)); // پایه قیمت مشتری
  const extrasTotal = round0(extrasSan.reduce((s, e) => s + e.amount, 0));

  const baseCost = materialsTotal + extrasTotal;

  const profitAmount =
    profitType === ProfitType.FIXED
      ? round0(profitValue)
      : round0(baseCost * (profitValue / 100));

  const finalPrice = round0(baseCost + profitAmount);

  /* ---------- save ---------- */
  const estimate = await prisma.containerEstimate.create({
    data: {
      // ❌ companyId حذف شد چون در مدل ContainerEstimate وجود ندارد
      estimateType,

      containerModelId,
      sizePresetId,
      length,
      width,
      height,

      spec: spec ?? undefined,
      specSummary: specSummary?.trim() || null,

      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      projectLocation: projectLocation?.trim() || null,
      usageType: usageType?.trim() || null,

      validUntil: validUntil ?? null,
      deliveryDays: deliveryDays ?? null,
      paymentTerms: paymentTerms?.trim() || null,
      warrantyTerms: warrantyTerms?.trim() || null,
      transportTerms: transportTerms?.trim() || null,
      notesForCustomer: notesForCustomer?.trim() || null,

      profitType,
      profitValue: n(profitValue),

      // snapshot totals
      materialsTotal: bi0(materialsTotal),
      extrasTotal: bi0(extrasTotal),
      profitAmount: bi0(profitAmount),
      finalPrice: bi0(finalPrice),

      // ✅ ردیف‌های مشتری
      displayItems: {
        create: displaySan.map((x, i) => ({
          sortOrder: i + 1,
          title: x.title,
          amount: bi0(x.amount),
        })),
      },

      // ✅ هزینه‌های دستی
      extras: {
        create: extrasSan.map((e) => ({
          title: e.title,
          amount: bi0(e.amount),
        })),
      },

      // ❌ ریزمصرف/lines در پیش‌فاکتور مشتری ذخیره نمی‌شود
    },
    select: { id: true },
  });

  revalidatePath("/dashboard/container-estimates");
  return estimate;
}
