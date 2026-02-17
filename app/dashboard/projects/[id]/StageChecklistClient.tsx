"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type QCStatus = "PENDING" | "PASSED" | "FAILED";

type ChecklistItem = {
  id: number;
  title: string;
  description: string | null;
  isRequired: boolean;
  status: QCStatus;
  checkedAt: string | null;
  checkedById: number | null;
  note: string | null;
  createdAt?: string;
  updatedAt?: string;
  checkedBy?: { id: number; name?: string | null; email?: string | null } | null;
};

function extractChecklist(payload: any): ChecklistItem[] {
  // API ممکنه چند مدل برگردونه؛ اینجا همه رو پوشش می‌دیم
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.items,
    payload?.data?.items,
    payload?.checklist,
    payload?.data?.checklist,
    payload?.stage?.checklist,
    payload?.data?.stage?.checklist,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  return [];
}

async function readErrorText(res: Response) {
  // تلاش می‌کنیم متن خطا را بفهمیم (json/text)
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => null);
      const msg =
        j?.message ||
        j?.error ||
        j?.details ||
        (typeof j === "string" ? j : null);
      if (msg) return String(msg);
      return JSON.stringify(j);
    }
  } catch {}

  try {
    const t = await res.text();
    return t || "";
  } catch {
    return "";
  }
}

function statusLabel(s: QCStatus) {
  if (s === "PASSED") return "تایید";
  if (s === "FAILED") return "رد";
  return "در انتظار";
}

export default function StageChecklistClient({ stageId }: { stageId: number }) {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});

  // برای جلوگیری از setState بعد از unmount / race
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  async function load() {
    setError(null);
    setLoading(true);

    // cancel request قبلی
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch(`/api/project-stages/${stageId}/checklist`, {
        method: "GET",
        cache: "no-store",
        signal: ac.signal,
      });

      if (!res.ok) {
        const t = await readErrorText(res);
        throw new Error(t || `خطا در دریافت چک‌لیست مرحله (${res.status})`);
      }

      const data = await res.json().catch(() => null);
      const list = extractChecklist(data);

      if (!mountedRef.current) return;

      setItems(list);

      // draft note ها را فقط برای آیتم‌های موجود همگام کن
      setNotesDraft((prev) => {
        const next: Record<number, string> = { ...prev };
        // آیتم‌های جدید/موجود را تنظیم کن
        for (const it of list) {
          if (typeof next[it.id] !== "string") next[it.id] = it.note ?? "";
        }
        // آیتم‌های حذف‌شده را پاک کن
        for (const key of Object.keys(next)) {
          const id = Number(key);
          if (!list.some((x) => x.id === id)) delete next[id];
        }
        return next;
      });
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      if (!mountedRef.current) return;
      setError(e?.message || "خطای نامشخص");
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    load();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId]);

  const stats = useMemo(() => {
    const total = items.length;
    const requiredItems = items.filter((x) => x.isRequired);
    const required = requiredItems.length;

    const passed = requiredItems.filter((x) => x.status === "PASSED").length;
    const failed = requiredItems.filter((x) => x.status === "FAILED").length;
    const pending = requiredItems.filter((x) => x.status === "PENDING").length;

    const progress = required ? Math.round((passed / required) * 100) : 0;

    return { total, required, passed, failed, pending, progress };
  }, [items]);

  async function patchItem(itemId: number, nextStatus: QCStatus) {
    setError(null);
    setSavingId(itemId);

    // optimistic UI
    const prevItems = items;
    setItems((prev) =>
      prev.map((x) =>
        x.id === itemId
          ? { ...x, status: nextStatus, note: notesDraft[itemId] ?? x.note ?? "" }
          : x
      )
    );

    try {
      const res = await fetch(`/api/project-stages/${stageId}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          status: nextStatus,
          note: notesDraft[itemId] ?? "",
        }),
      });

      if (!res.ok) {
        const t = await readErrorText(res);
        throw new Error(t || `خطا در ثبت وضعیت (${res.status})`);
      }

      const updated = await res.json().catch(() => null);

      // چند حالت محتمل:
      // 1) یک آیتم
      // 2) کل لیست
      // 3) {items: [...]}
      if (updated?.id) {
        setItems((prev) =>
          prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x))
        );
      } else {
        const list = extractChecklist(updated);
        if (list.length) setItems(list);
        else {
          // اگر چیزی مشخص نبود، دوباره لود کن
          await load();
        }
      }
    } catch (e: any) {
      // rollback optimistic
      setItems(prevItems);
      setError(e?.message || "خطای نامشخص");
    } finally {
      setSavingId(null);
    }
  }

  async function saveNoteOnly(itemId: number) {
    const current = items.find((x) => x.id === itemId);
    if (!current) return;
    await patchItem(itemId, current.status);
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-zinc-600">در حال دریافت چک‌لیست…</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-600">پیشرفت QC:</div>
            <div className="font-bold">{stats.progress}%</div>
            <div className="text-xs text-zinc-500">
              (ضروری: {stats.required} | پاس: {stats.passed} | رد: {stats.failed} | در انتظار:{" "}
              {stats.pending})
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={load}
          className="w-fit rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          بروزرسانی
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-4 rounded-lg border bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
          برای این مرحله هنوز آیتم QC ثبت نشده است.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((it) => {
            const saving = savingId === it.id;

            return (
              <div key={it.id} className="rounded-xl border p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-bold">{it.title}</div>

                      {it.isRequired ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          ضروری
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                          اختیاری
                        </span>
                      )}

                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-xs border",
                          it.status === "PASSED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : it.status === "FAILED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-zinc-50 text-zinc-700 border-zinc-200",
                        ].join(" ")}
                      >
                        {statusLabel(it.status)}
                      </span>
                    </div>

                    {it.description ? (
                      <div className="mt-1 text-sm text-zinc-600">{it.description}</div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={saving}
                      onClick={() => patchItem(it.id, "PASSED")}
                      className={[
                        "rounded-lg border px-3 py-1.5 text-sm",
                        it.status === "PASSED"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "hover:bg-zinc-50",
                        saving ? "opacity-60 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      تایید
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => patchItem(it.id, "FAILED")}
                      className={[
                        "rounded-lg border px-3 py-1.5 text-sm",
                        it.status === "FAILED"
                          ? "bg-red-600 text-white border-red-600"
                          : "hover:bg-zinc-50",
                        saving ? "opacity-60 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      رد
                    </button>

                    <button
                      disabled={saving}
                      onClick={() => patchItem(it.id, "PENDING")}
                      className={[
                        "rounded-lg border px-3 py-1.5 text-sm",
                        it.status === "PENDING"
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "hover:bg-zinc-50",
                        saving ? "opacity-60 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      در انتظار
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs text-zinc-600">یادداشت</label>

                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <input
                      value={notesDraft[it.id] ?? ""}
                      onChange={(e) =>
                        setNotesDraft((p) => ({ ...p, [it.id]: e.target.value }))
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="یادداشت (اختیاری)…"
                    />

                    <button
                      disabled={saving}
                      onClick={() => saveNoteOnly(it.id)}
                      className={[
                        "w-fit rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50",
                        saving ? "opacity-60 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      ذخیره یادداشت
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-zinc-500">
                  وضعیت: <span className="font-bold">{it.status}</span>
                  {it.checkedAt ? (
                    <>
                      {" "}
                      | آخرین بررسی:{" "}
                      {new Date(it.checkedAt).toLocaleString("fa-IR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
