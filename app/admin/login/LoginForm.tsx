"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get("from") || "/admin";

  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(null);

    const p = pass.trim();
    if (!p) {
      setErr("رمز را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pass: p }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setErr(
          json?.error === "INVALID_PASSWORD"
            ? "رمز نادرست است."
            : json?.error === "ADMIN_KEY_NOT_SET"
            ? "متغیر ADMIN_KEY تنظیم نشده است."
            : "خطای ورود. دوباره تلاش کنید."
        );
        return;
      }

      router.push(from);   // ✅ بر اساس from
      router.refresh();
    } catch {
      setErr("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="relative">
        <input
          dir="ltr"
          type={show ? "text" : "password"}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="رمز مدیر"
          className="w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-900"
          aria-label="نمایش/مخفی‌کردن رمز"
        >
          {show ? "مخفی" : "نمایش"}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-black disabled:opacity-50"
      >
        {loading ? "در حال ورود…" : "ورود"}
      </button>

      {err && <div className="text-[12px] text-rose-600 text-center">{err}</div>}
    </form>
  );
}
