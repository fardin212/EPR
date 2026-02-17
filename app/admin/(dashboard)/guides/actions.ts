"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// اگر گارد ادمین داری، مثل Category اضافه کن:
// import { requireAdmin } from "@/lib/adminGuard";

function str(fd: FormData, key: string) {
  return (fd.get(key) || "").toString().trim();
}

function jsonOrNull(value: string) {
  const s = (value || "").trim();
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    // اگر JSON خراب بود، null برگردون تا صفحه نشکنه
    return null;
  }
}

export async function createGuide(fd: FormData) {
  // await requireAdmin();

  const slug = str(fd, "slug");
  const name = str(fd, "name");
  if (!slug || !name) throw new Error("slug و name الزامی هستند.");

  const guide = await prisma.guide.create({
    data: {
      slug,
      name,
      keyword: str(fd, "keyword") || null,
      seoTitle: str(fd, "seoTitle") || null,
      seoDescription: str(fd, "seoDescription") || null,
      summary: str(fd, "summary") || null,
      contentHtml: str(fd, "contentHtml") || "",
      imageUrl: str(fd, "imageUrl") || null,
      faqJson: jsonOrNull(str(fd, "faqJson")),
      specsJson: jsonOrNull(str(fd, "specsJson")),
      galleryJson: jsonOrNull(str(fd, "galleryJson")),
    },
  });

  revalidatePath("/guides");
  revalidatePath(`/guides/${encodeURIComponent(guide.slug)}`);
  revalidatePath("/admin/guides");

  redirect(`/admin/guides/${guide.id}`);
}

export async function updateGuide(id: number, fd: FormData) {
  // await requireAdmin();

  const slug = str(fd, "slug");
  const name = str(fd, "name");
  if (!slug || !name) throw new Error("slug و name الزامی هستند.");

  const guide = await prisma.guide.update({
    where: { id },
    data: {
      slug,
      name,
      keyword: str(fd, "keyword") || null,
      seoTitle: str(fd, "seoTitle") || null,
      seoDescription: str(fd, "seoDescription") || null,
      summary: str(fd, "summary") || null,
      contentHtml: str(fd, "contentHtml") || "",
      imageUrl: str(fd, "imageUrl") || null,
      faqJson: jsonOrNull(str(fd, "faqJson")),
      specsJson: jsonOrNull(str(fd, "specsJson")),
      galleryJson: jsonOrNull(str(fd, "galleryJson")),
    },
  });

  revalidatePath("/guides");
  revalidatePath(`/guides/${encodeURIComponent(guide.slug)}`);
  revalidatePath("/admin/guides");
}

export async function deleteGuide(id: number) {
  // await requireAdmin();

  const g = await prisma.guide.findUnique({ where: { id }, select: { slug: true } });
  await prisma.guide.delete({ where: { id } });

  revalidatePath("/guides");
  if (g?.slug) revalidatePath(`/guides/${encodeURIComponent(g.slug)}`);
  revalidatePath("/admin/guides");

  redirect("/admin/guides");
}
