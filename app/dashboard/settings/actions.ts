// app/dashboard/settings/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/adminGuard";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type Role = "ADMIN" | "MANAGER" | "STAFF";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeRole(role: string): Role {
  if (role === "ADMIN" || role === "MANAGER" || role === "STAFF") return role;
  return "STAFF";
}

export async function adminListUsers(q?: string) {
  await requireAdmin();

  const query = (q || "").trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query } },
            { name: { contains: query } },
          ],
        }
      : undefined,
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
}

export async function adminCreateUser(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  await requireAdmin();

  const name = (input.name || "").trim();
  const email = normalizeEmail(input.email || "");
  const password = (input.password || "").trim();
  const role = safeRole(input.role || "STAFF");

  if (!name) throw new Error("نام کاربر الزامی است.");
  if (!email || !email.includes("@")) throw new Error("ایمیل معتبر وارد کنید.");
  if (password.length < 6) throw new Error("رمز عبور باید حداقل ۶ کاراکتر باشد.");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("این ایمیل قبلاً ثبت شده است.");

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function adminUpdateUserRole(input: { userId: number; role: string }) {
  await requireAdmin();

  const role = safeRole(input.role);
  await prisma.user.update({
    where: { id: input.userId },
    data: { role },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function adminSetUserActive(input: { userId: number; isActive: boolean }) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: input.userId },
    data: { isActive: !!input.isActive },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}
