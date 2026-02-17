// lib/auth.ts
import { cookies } from "next/headers";
import { prisma } from "./db";

// ✅ این export باعث میشه تمام route هایی که از "@/lib/auth" getMeServer میگیرن درست بشن
export { getMeServer } from "./authMe";

export async function getCurrentUser() {
  // در Next 16، cookies() async است
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    return null;
  }

  const userId = Number(sessionCookie.value);
  if (!userId || Number.isNaN(userId)) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}
