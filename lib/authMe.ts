// lib/authMe.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getMeServer() {
  // در Next 16 cookies() async است
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    throw new Error("دسترسی غیرمجاز: لطفاً وارد شوید");
  }

  // در پروژه شما session = userId (عددی) است
  const userId = Number(sessionCookie.value);
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new Error("دسترسی غیرمجاز: لطفاً وارد شوید");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });

  if (!user || !user.isActive) {
    throw new Error("دسترسی غیرمجاز: لطفاً وارد شوید");
  }

  const companyId = user.companyId ?? user.company?.id;
  if (!companyId) {
    throw new Error("companyId برای کاربر پیدا نشد.");
  }

  // خروجی سازگار با بقیه APIها
  return {
    id: user.id,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    role: user.role ?? undefined,
    companyId,
    user,
    company: user.company,
  };
}
