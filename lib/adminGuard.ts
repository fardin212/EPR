// lib/adminGuard.ts
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

type Role = "ADMIN" | "MANAGER" | "STAFF";

type MeResponse = {
  user?: {
    id?: number;
    name?: string;
    email?: string;
    role?: Role;
  };
};

async function getBaseUrl() {
  // ✅ Next 16: headers() is Promise
  const h = await headers();

  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";

  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

async function fetchMe(): Promise<MeResponse> {
  const base = await getBaseUrl();

  // ✅ Next 16: cookies() is Promise
  const c = await cookies();

  const res = await fetch(`${base}/api/auth/me`, {
    method: "GET",
    cache: "no-store",
    headers: {
      // انتقال کوکی‌ها به API برای تشخیص لاگین
      cookie: c.toString(),
    },
  });

  if (!res.ok) return {};
  return (await res.json()) as MeResponse;
}

/**
 * فقط ADMIN اجازه دسترسی
 * اگر لاگین نبود -> /login
 * اگر نقش ADMIN نبود -> /dashboard
 */
export async function requireAdmin() {
  const me = await fetchMe();

  if (!me.user) redirect("/login");
  if (me.user.role !== "ADMIN") redirect("/dashboard");

  return me.user;
}

export async function requireRole(roles: Role[]) {
  const me = await fetchMe();

  if (!me.user) redirect("/login");
  if (!roles.includes(me.user.role as Role)) redirect("/dashboard");

  return me.user;
}
