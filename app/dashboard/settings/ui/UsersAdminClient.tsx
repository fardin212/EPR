"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  adminCreateUser,
  adminListUsers,
  adminSetUserActive,
  adminUpdateUserRole,
} from "../actions";

type Role = "ADMIN" | "MANAGER" | "STAFF";
type UserRow = {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function toFaDate(d: any) {
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    return date?.toLocaleDateString("fa-IR");
  } catch {
    return "-";
  }
}

export default function UsersAdminClient() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<UserRow[]>([]);
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as Role,
  });

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const refresh = (query?: string) => {
    startTransition(async () => {
      try {
        setMsg(null);
        const data = await adminListUsers(query ?? q);
        setRows(data as any);
      } catch (e: any) {
        setMsg({ type: "err", text: e?.message || "خطا در دریافت کاربران" });
      }
    });
  };

  useEffect(() => {
    refresh("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => rows, [rows]);

  const onCreate = () => {
    startTransition(async () => {
      try {
        setMsg(null);
        await adminCreateUser(form);
        setForm({ name: "", email: "", password: "", role: "STAFF" });
        setMsg({ type: "ok", text: "کاربر جدید با موفقیت ایجاد شد." });
        await refresh("");
      } catch (e: any) {
        setMsg({ type: "err", text: e?.message || "خطا در ایجاد کاربر" });
      }
    });
  };

  const onRoleChange = (userId: number, role: Role) => {
    startTransition(async () => {
      try {
        setMsg(null);
        await adminUpdateUserRole({ userId, role });
        setMsg({ type: "ok", text: "سطح دسترسی بروزرسانی شد." });
        await refresh(q);
      } catch (e: any) {
        setMsg({ type: "err", text: e?.message || "خطا در بروزرسانی نقش" });
      }
    });
  };

  const onToggleActive = (userId: number, isActive: boolean) => {
    startTransition(async () => {
      try {
        setMsg(null);
        await adminSetUserActive({ userId, isActive });
        setMsg({ type: "ok", text: isActive ? "کاربر فعال شد." : "کاربر غیرفعال شد." });
        await refresh(q);
      } catch (e: any) {
        setMsg({ type: "err", text: e?.message || "خطا در تغییر وضعیت کاربر" });
      }
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* پیام */}
      {msg && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* ایجاد کاربر */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-slate-800">تعریف کاربر جدید</h3>
          <span className="text-[11px] text-slate-400">Admin only</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="نام"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="ایمیل"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="رمز عبور (حداقل ۶ کاراکتر)"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={form.role}
            onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as Role }))}
          >
            <option value="STAFF">STAFF (کارمند)</option>
            <option value="MANAGER">MANAGER (مدیر)</option>
            <option value="ADMIN">ADMIN (ادمین)</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onCreate}
            disabled={pending}
            className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-60"
            type="button"
          >
            {pending ? "در حال ثبت..." : "ایجاد کاربر"}
          </button>
        </div>
      </section>

      {/* لیست کاربران */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="font-semibold text-slate-800">مدیریت کاربران و سطح دسترسی</h3>

          <div className="flex items-center gap-2">
            <input
              className="w-full md:w-[320px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="جستجو (نام یا ایمیل)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              onClick={() => refresh(q)}
              disabled={pending}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-60"
              type="button"
            >
              جستجو
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-slate-500">
                <th className="py-2">نام</th>
                <th className="py-2">ایمیل</th>
                <th className="py-2">نقش</th>
                <th className="py-2">وضعیت</th>
                <th className="py-2">ایجاد</th>
                <th className="py-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium text-slate-800">{u.name}</td>
                  <td className="py-2 text-slate-600">{u.email}</td>

                  <td className="py-2">
                    <select
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                      value={u.role}
                      disabled={pending}
                      onChange={(e) => onRoleChange(u.id, e.target.value as Role)}
                    >
                      <option value="STAFF">STAFF</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>

                  <td className="py-2">
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full border ${
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {u.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </td>

                  <td className="py-2 text-slate-500">{toFaDate(u.createdAt)}</td>

                  <td className="py-2">
                    <button
                      type="button"
                      disabled={pending}
                      className={`rounded-lg px-3 py-1.5 text-xs border ${
                        u.isActive
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                      onClick={() => onToggleActive(u.id, !u.isActive)}
                    >
                      {u.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-slate-400" colSpan={6}>
                    کاربری یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
