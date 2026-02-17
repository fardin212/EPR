import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminLogin } from "./server-actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const ck = (await cookies()).get("admin_auth")?.value || "";
  const ADMIN_KEY = process.env.ADMIN_KEY || "";

  // اگر قبلاً لاگین شده باشد، مستقیم به داشبورد برو
  if (ADMIN_KEY && ck === "1") {
    redirect("/admin");
  }

  const hasError = searchParams?.error === "wrong";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <form
        action={adminLogin}
        className="w-full max-w-md bg-card rounded-3xl shadow-xl p-8 flex flex-col gap-6 border border-border"
      >
        <h1 className="text-xl font-extrabold text-center text-foreground">
          ورود ادمین
        </h1>

        <p className="text-xs text-muted-foreground text-center">
          برای ورود به پنل مدیریت، رمز ادمین را وارد کنید.
        </p>

        <input
          type="password"
          name="password" // 👈 حتماً همین نام، با server-actions هماهنگ است
          placeholder="رمز ادمین"
          required
          className="w-full rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-[var(--brand-blue)] bg-white"
        />

        {hasError && (
          <p className="text-xs text-red-500 text-center mt-[-8px]">
            رمز وارد شده نادرست است.
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full">
          ورود
        </button>
      </form>
    </main>
  );
}
