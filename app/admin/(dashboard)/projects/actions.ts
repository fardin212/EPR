// app/admin/(dashboard)/projects/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateProject(formData: FormData) {
  await requireAdmin();

  console.log("🟦 [updateProject] RAW FORM DATA:", {
    id: formData.get("id"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    imageUrl: formData.get("imageUrl"),
  });

  const idRaw = formData.get("id");
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    console.error("❌ [updateProject] INVALID ID:", idRaw);
    throw new Error("شناسه پروژه نامعتبر است");
  }

  // پروژه فعلی را می‌خوانیم تا اگر اسلاگ جدید نداشتیم، قبلی را نگه داریم
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    console.error("❌ [updateProject] PROJECT NOT FOUND:", id);
    throw new Error("پروژه پیدا نشد");
  }

  const title = String(formData.get("title") || "").trim();
  const slugRaw = formData.get("slug");
  const slugInput = slugRaw ? String(slugRaw).trim() : "";
  const finalSlug = slugInput || existingProject.slug; // اگر خالی بود، اسلاگ قبلی

  const summary =
    String(formData.get("summary") || "").trim() || null;
  const description =
    String(formData.get("description") || "").trim() || null;

  const categoryIdRaw = formData.get("categoryId");
  const categoryId =
    categoryIdRaw && String(categoryIdRaw).trim()
      ? Number(categoryIdRaw)
      : null;

  const city = String(formData.get("city") || "").trim() || null;

  const metersRaw = formData.get("meters");
  const meters =
    metersRaw && String(metersRaw).trim()
      ? Number(metersRaw)
      : null;

  const metaTitle =
    String(formData.get("metaTitle") || "").trim() || null;
  const metaDesc =
    String(formData.get("metaDesc") || "").trim() || null;
  const heroAlt =
    String(formData.get("heroAlt") || "").trim() || null;

  const bulletsText = String(formData.get("bullets") || "").trim();
  const bullets = bulletsText || null; // فعلاً به صورت رشته ساده در DB

  const specFrame =
    String(formData.get("specFrame") || "").trim() || null;
  const specWalls =
    String(formData.get("specWalls") || "").trim() || null;
  const specInterior =
    String(formData.get("specInterior") || "").trim() || null;
  const specMEP =
    String(formData.get("specMEP") || "").trim() || null;
  const specLogistic =
    String(formData.get("specLogistic") || "").trim() || null;

  const priceRange =
    String(formData.get("priceRange") || "").trim() || null;
  const priceFactors =
    String(formData.get("priceFactors") || "").trim() || null;

  const challenges =
    String(formData.get("challenges") || "").trim() || null;

  const clientName =
    String(formData.get("clientName") || "").trim() || null;
  const clientQuote =
    String(formData.get("clientQuote") || "").trim() || null;

  const ctaWhatsapp =
    String(formData.get("ctaWhatsapp") || "").trim() || null;

  const imageUrl =
    String(formData.get("imageUrl") || "").trim() || null;

  console.log("🟩 [updateProject] NORMALIZED DATA:", {
    id,
    title,
    slug: finalSlug,
    categoryId,
    city,
    meters,
    imageUrl,
    bullets,
  });

  if (!title) throw new Error("عنوان الزامی است");
  if (!finalSlug) throw new Error("اسلاگ پروژه نامعتبر است");

  try {
    // به‌روزرسانی رکورد اصلی پروژه
    const updated = await prisma.project.update({
      where: { id },
      data: {
        title,
        slug: finalSlug,
        summary,
        description,
        categoryId,
        city,
        meters,
        metaTitle,
        metaDesc,
        heroAlt,
        bullets,
        specFrame,
        specWalls,
        specInterior,
        specMEP,
        specLogistic,
        priceRange,
        priceFactors,
        challenges,
        clientName,
        clientQuote,
        ctaWhatsapp,
      },
    });

    console.log("✅ [updateProject] PROJECT UPDATED:", {
      id: updated.id,
      slug: updated.slug,
    });

    // مدیریت تصویر
    const existingImage = await prisma.image.findFirst({
      where: { projectId: id },
      orderBy: { id: "asc" },
    });

    console.log("🟨 [updateProject] EXISTING IMAGE:", existingImage);
    console.log("🟧 [updateProject] NEW imageUrl:", imageUrl);

    if (imageUrl) {
      if (existingImage) {
        await prisma.image.update({
          where: { id: existingImage.id },
          data: {
            url: imageUrl,
            alt: heroAlt || title,
          },
        });
        console.log("🟩 [updateProject] IMAGE UPDATED");
      } else {
        await prisma.image.create({
          data: {
            projectId: id,
            url: imageUrl,
            alt: heroAlt || title,
          },
        });
        console.log("🟩 [updateProject] IMAGE CREATED");
      }
    } else if (!imageUrl && existingImage) {
      await prisma.image.delete({
        where: { id: existingImage.id },
      });
      console.log("🟥 [updateProject] IMAGE DELETED (no imageUrl sent)");
    }

    // ری‌ولیدیت برای ادمین و صفحه نمونه‌کارها
    revalidatePath(`/admin/projects/${id}`);
    revalidatePath("/admin/projects");
    revalidatePath("/portfolio");
  } catch (e) {
    console.error("❌ [updateProject] ERROR:", e);
    throw e;
  }

  // بعد از موفقیت → انتقال واضح به لیست نمونه‌کارها
  redirect("/admin/projects");
}

export async function removeProject(formData: FormData) {
  await requireAdmin();

  const idRaw = formData.get("id");
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    console.error("❌ [removeProject] INVALID ID:", idRaw);
    throw new Error("شناسه پروژه نامعتبر است");
  }

  console.log("🗑 [removeProject] Removing project:", id);

  try {
    await prisma.image.deleteMany({
      where: { projectId: id },
    });

    await prisma.project.delete({
      where: { id },
    });

    console.log("✅ [removeProject] PROJECT REMOVED:", id);

    revalidatePath("/admin/projects");
    revalidatePath("/portfolio");
    redirect("/admin/projects");
  } catch (e) {
    console.error("❌ [removeProject] ERROR:", e);
    throw e;
  }
}
