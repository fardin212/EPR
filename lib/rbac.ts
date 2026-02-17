import { getCurrentUser } from "@/lib/auth";

export async function requireRole(roles: Array<"ADMIN" | "ACCOUNTANT">) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
