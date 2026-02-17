// lib/authz.ts

/**
 * فعلاً سیستم نقش/سطح دسترسی را خنثی می‌کنیم
 * هر جا requireRole صدا زده شود، فقط return می‌کند
 * و هیچ محدودیتی اعمال نمی‌شود.
 *
 * بعداً که سیستم لاگین و نقش‌ها را وصل کردیم،
 * محتوای این تابع را عوض می‌کنیم.
 */

export async function requireRole(_allowed: string[]) {
  // مثال نسخه‌ی نهایی (آینده):
  // const user = await getCurrentUserWithRoles();
  // const userRoles = user.roles.map((r) => r.role.name);
  // const ok = userRoles.some((r) => _allowed.includes(r));
  // if (!ok) throw new Error("FORBIDDEN");
  return;
}
