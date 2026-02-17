// app/admin/(dashboard)/portfolio/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const summary = String(formData.get("summary") || "");
  const categoryIdRaw = formData.get("categoryId");
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;

  await prisma.project.create({
    data: { title, slug, summary, categoryId },
  });

  redirect("/admin/projects"); // یا /admin/portfolio اگه اصرار داری از این بخش استفاده کنی
}

export async function updateProject(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const summary = String(formData.get("summary") || "");
  const categoryIdRaw = formData.get("categoryId");
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;

  await prisma.project.update({
    where: { id },
    data: { title, slug, summary, categoryId },
  });

  redirect(`/admin/projects/${id}`);
}

export async function removeProject(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));

  await prisma.image.deleteMany({ where: { projectId: id } });
  await prisma.project.delete({ where: { id } });

  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}
