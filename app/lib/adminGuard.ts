// app/lib/adminGuard.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "admin_auth";
const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * گارد جدید ادمین
 * فقط با کوکی admin_auth=1 کار می‌کند.
 * هیچ وابستگی به admin_key یا ADMIN_KEY ندارد.
 */
export async function requireAdmin() {
  const ck = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  if (ck !== "1") {
    redirect(ADMIN_LOGIN_PATH);
  }
}

/**
 * اگر جایی فقط چک بولیَن لازم داشتی
 */
export async function isAdmin() {
  const ck = (await cookies()).get(ADMIN_COOKIE)?.value || "";
  return ck === "1";
}
