"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// اگر دارید:
// import { requireAdmin } from "@/lib/adminGuard";

function s(fd: FormData, k: string) {
  return String(fd.get(k) || "").trim();
}

function i(fd: FormData, k: string) {
  const n = Number(String(fd.get(k) || "0").replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function b(fd: FormData, k: string) {
  const v = String(fd.get(k) || "").toLowerCase();
  return v === "on" || v === "true" || v === "1";
}

function normalizeSlug(slug: string) {
  // ساده: فاصله‌ها و / را جمع می‌کنیم
  return slug
    .trim()
    .replace(/\s+/g, "-")
    .replace(/\//g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function parseLines(v: string) {
  return (v || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

export async function createUsedConex(fd: FormData): Promise<void> {
  // await requireAdmin();

  const rawSlug = s(fd, "slug");
  const slug = normalizeSlug(rawSlug);
  if (!slug) throw new Error("slug الزامی است");

  // جلوگیری از slug تکراری (خطای Prisma دوستانه‌تر)
  const exists = await prisma.usedConex.findUnique({ where: { slug }, select: { id: true } });
  if (exists) throw new Error("این slug قبلاً استفاده شده است");

  const title = s(fd, "title");
  if (!title) throw new Error("عنوان الزامی است");

  const row = await prisma.usedConex.create({
    data: {
      slug,
      title,
      type: s(fd, "type"),
      size: s(fd, "size"),
      city: s(fd, "city"),
      price: i(fd, "price"),
      status: s(fd, "status") as any,
      isReady: b(fd, "isReady"),
      refurbished: b(fd, "refurbished"),
      note: s(fd, "note") || null,
    },
    select: { id: true, slug: true },
  });

  // تصاویر (URLها هر خط یک URL)
  const imageUrls = parseLines(s(fd, "images"));
  if (imageUrls.length) {
    await prisma.usedConexImage.createMany({
      data: imageUrls.map((url, idx) => ({
        usedId: row.id,
        url,
        sort: idx,
        kind: "gallery",
      })),
      skipDuplicates: true,
    });
  }

  // before/after (اختیاری)
  const beforeUrl = s(fd, "beforeUrl");
  const afterUrl = s(fd, "afterUrl");
  const imgs: Array<{ usedId: string; url: string; sort: number; kind: string }> = [];
  if (beforeUrl) imgs.push({ usedId: row.id, url: beforeUrl, sort: 0, kind: "before" });
  if (afterUrl) imgs.push({ usedId: row.id, url: afterUrl, sort: 0, kind: "after" });
  if (imgs.length) {
    await prisma.usedConexImage.createMany({ data: imgs, skipDuplicates: true });
  }

  // refurb items (هر خط: عنوان | توضیح)
  const lines = parseLines(s(fd, "refurbItems"));
  if (lines.length) {
    await prisma.usedConexRefurbItem.createMany({
      data: lines.map((line, idx) => {
        const [t, d] = line.split("|").map((x) => x?.trim());
        return { usedId: row.id, title: t || "بازسازی", desc: d || null, sort: idx };
      }),
    });
  }

  revalidatePath("/used-conex/buy");
  revalidatePath(`/used-conex/buy/${row.slug}`);

  redirect("/admin/used-conex");
}

export async function updateUsedConex(id: string, fd: FormData): Promise<void> {
  // await requireAdmin();

  const rawSlug = s(fd, "slug");
  const slug = normalizeSlug(rawSlug);
  if (!slug) throw new Error("slug الزامی است");

  // جلوگیری از slug تکراری (برای رکوردهای دیگر)
  const exists = await prisma.usedConex.findUnique({ where: { slug }, select: { id: true } });
  if (exists && exists.id !== id) throw new Error("این slug قبلاً استفاده شده است");

  const title = s(fd, "title");
  if (!title) throw new Error("عنوان الزامی است");

  const updated = await prisma.usedConex.update({
    where: { id },
    data: {
      slug,
      title,
      type: s(fd, "type"),
      size: s(fd, "size"),
      city: s(fd, "city"),
      price: i(fd, "price"),
      status: s(fd, "status") as any,
      isReady: b(fd, "isReady"),
      refurbished: b(fd, "refurbished"),
      note: s(fd, "note") || null,
    },
    select: { id: true, slug: true },
  });

  // برای سادگی: تصاویر و refurb را ریست و دوباره می‌سازیم
  await prisma.usedConexImage.deleteMany({ where: { usedId: id } });
  await prisma.usedConexRefurbItem.deleteMany({ where: { usedId: id } });

  const imageUrls = parseLines(s(fd, "images"));
  if (imageUrls.length) {
    await prisma.usedConexImage.createMany({
      data: imageUrls.map((url, idx) => ({
        usedId: id,
        url,
        sort: idx,
        kind: "gallery",
      })),
      skipDuplicates: true,
    });
  }

  const beforeUrl = s(fd, "beforeUrl");
  const afterUrl = s(fd, "afterUrl");
  const imgs: Array<{ usedId: string; url: string; sort: number; kind: string }> = [];
  if (beforeUrl) imgs.push({ usedId: id, url: beforeUrl, sort: 0, kind: "before" });
  if (afterUrl) imgs.push({ usedId: id, url: afterUrl, sort: 0, kind: "after" });
  if (imgs.length) {
    await prisma.usedConexImage.createMany({ data: imgs, skipDuplicates: true });
  }

  const lines = parseLines(s(fd, "refurbItems"));
  if (lines.length) {
    await prisma.usedConexRefurbItem.createMany({
      data: lines.map((line, idx) => {
        const [t, d] = line.split("|").map((x) => x?.trim());
        return { usedId: id, title: t || "بازسازی", desc: d || null, sort: idx };
      }),
    });
  }

  revalidatePath("/used-conex/buy");
  revalidatePath(`/used-conex/buy/${updated.slug}`);

  redirect("/admin/used-conex");
}

export async function deleteUsedConex(id: string): Promise<void> {
  await prisma.usedConexImage.deleteMany({ where: { usedId: id } });
  await prisma.usedConexRefurbItem.deleteMany({ where: { usedId: id } });
  await prisma.usedConexLead.updateMany({
    where: { usedId: id },
    data: { usedId: null },
  });

  await prisma.usedConex.deleteMany({ where: { id } });

  revalidatePath("/used-conex/buy");
  revalidatePath("/admin/used-conex");
  redirect("/admin/used-conex");
}

