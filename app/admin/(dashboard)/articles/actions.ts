// app/admin/(dashboard)/articles/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { PostStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ───────────────── helpers ─────────────────
function boolFromForm(v: FormDataEntryValue | null): boolean {
  if (!v) return false;
  const s = String(v).toLowerCase();
  return s === "on" || s === "true" || s === "1";
}

function statusFromForm(fd: FormData): PostStatus {
  const raw = (fd.get("status") || "").toString().trim() as keyof typeof PostStatus;

  if (raw && raw in PostStatus) {
    return PostStatus[raw];
  }

  const publishedFlag = boolFromForm(fd.get("published"));
  if (publishedFlag) return PostStatus.published;

  return PostStatus.draft;
}

function intOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** ساخت اسلاگ امن از عنوان (در صورت خالی بودن slug) */
function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    // حذف حروف فارسی
    .replace(/[\u0600-\u06FF]/g, "")
    // فقط حروف و عدد و خط‌تیره
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * از بدنه‌ی مقاله یک خلاصه‌ی کوتاه و امن برای ستون دیتابیس می‌سازیم
 * حداکثر ۱۸۰ کاراکتر تا با ستون‌های VARCHAR(191) هم سازگار باشد.
 */
function makeExcerpt(body: string | null, fallback?: string | null): string | null {
  const MAX = 180;

  // اگر از فرم خودت خلاصه فرستادی
  if (fallback && fallback.trim().length > 0) {
    const clean = fallback.trim();
    return clean.length > MAX ? clean.slice(0, MAX) : clean;
  }

  if (!body) return null;

  // تبدیل به متن ساده (حذف تگ‌های HTML در صورت وجود)
  const plain = body
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return null;

  return plain.length > MAX ? plain.slice(0, MAX) : plain;
}

// ─────────────────── ایجاد مقاله جدید ───────────────────
export async function createPost(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("TITLE_REQUIRED");

  // اگر اسلاگ نیامد، از روی عنوان بساز
  let slug = String(formData.get("slug") || "").trim();
  if (!slug) {
    slug = slugifyTitle(title);
  }

  const body = String(formData.get("body") || "").trim() || null;

  const status = statusFromForm(formData);
  const publishedAt = status === PostStatus.published ? new Date() : null;

  const toc = boolFromForm(formData.get("toc"));
  const noindex = boolFromForm(formData.get("noindex"));
  const nofollow = boolFromForm(formData.get("nofollow"));
  const featured = boolFromForm(formData.get("featured"));
  const readMinutes = intOrNull(formData.get("readMinutes"));

  // تصویر کاور
  const coverUrl = String(formData.get("coverUrl") || "").trim() || null;
  const coverAlt = String(formData.get("coverAlt") || "").trim() || null;

  // فیلدهای سئو
  const category = String(formData.get("category") || "").trim() || null;
  const metaTitle = String(formData.get("metaTitle") || "").trim() || null;
  const metaDesc = String(formData.get("metaDesc") || "").trim() || null;
  const canonical = String(formData.get("canonical") || "").trim() || null;
  const ogTitle = String(formData.get("ogTitle") || "").trim() || null;
  const ogImage = String(formData.get("ogImage") || "").trim() || null;

  // خلاصه مقاله (از فرم یا بدنه)
  const excerptInput = String(formData.get("excerpt") || "").trim() || null;
  const excerpt = makeExcerpt(body, excerptInput);

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      body,
      status,
      publishedAt,
      toc,
      noindex,
      nofollow,
      featured,
      readMinutes,
      category,
      metaTitle,
      metaDesc,
      canonical,
      ogTitle,
      ogImage,
      coverUrl,
      coverAlt,
      excerpt, // ✅ همیشه کوتاه و امن
    },
  });

  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${post.id}`);
}

// ─────────────────── ویرایش مقاله ───────────────────
export async function updatePost(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("INVALID_ID");

  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("TITLE_REQUIRED");

  const body = String(formData.get("body") || "").trim() || null;

  const status = statusFromForm(formData);
  const publishedAt = status === PostStatus.published ? new Date() : null;

  const toc = boolFromForm(formData.get("toc"));
  const noindex = boolFromForm(formData.get("noindex"));
  const nofollow = boolFromForm(formData.get("nofollow"));
  const featured = boolFromForm(formData.get("featured"));
  const readMinutes = intOrNull(formData.get("readMinutes"));

  // تصویر کاور
  const coverUrl = String(formData.get("coverUrl") || "").trim() || null;
  const coverAlt = String(formData.get("coverAlt") || "").trim() || null;

  const category = String(formData.get("category") || "").trim() || null;
  const metaTitle = String(formData.get("metaTitle") || "").trim() || null;
  const metaDesc = String(formData.get("metaDesc") || "").trim() || null;
  const canonical = String(formData.get("canonical") || "").trim() || null;
  const ogTitle = String(formData.get("ogTitle") || "").trim() || null;
  const ogImage = String(formData.get("ogImage") || "").trim() || null;

  const excerptInput = String(formData.get("excerpt") || "").trim() || null;
  const excerpt = makeExcerpt(body, excerptInput);

  // 👈 اسلاگ را عمداً آپدیت نمی‌کنیم تا خطای P2002 نگیری و لینک مقاله ثابت بماند
  await prisma.post.update({
    where: { id },
    data: {
      title,
      body,
      status,
      publishedAt,
      toc,
      noindex,
      nofollow,
      featured,
      readMinutes,
      category,
      metaTitle,
      metaDesc,
      canonical,
      ogTitle,
      ogImage,
      coverUrl,
      coverAlt,
      excerpt,
    },
  });

  revalidatePath(`/admin/articles/${id}`);
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${id}`);
}

// ─────────────────── حذف مقاله ───────────────────
export async function removePost(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("INVALID_ID");

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}
