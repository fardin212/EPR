"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JalaliDatePicker from "@/app/ui/JalaliDatePicker";

type Customer = { id: number; name: string };

type Contractor = {
  id: number;

  // ✅ بعضی رکوردها ممکنه party نداشته باشند (null/undefined)
  party?: { name?: string | null; mobile?: string | null } | null;

  // ✅ فیلدهای احتمالی fallback (اگر API اینها را برگرداند)
  partyName?: string | null;
  partyMobile?: string | null;

  skills?: { id: number; category: string; projectType?: { name: string } | null }[] | null;
};

type ProjectType = { id: number; name: string };

type InitialProject = {
  id: number;
  title?: string | null;
  name?: string | null;
  type?: string | null;
  projectTypeId?: number | null;
  size?: string | null;
  startDate?: string | Date | null;
  description?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  contractorIds?: number[] | null;
};

type Props = {
  customers?: Customer[];
  contractors?: Contractor[];
  projectTypes?: ProjectType[];

  mode?: "new" | "edit";
  initialProject?: InitialProject | null;

  hasQcTemplate?: boolean; // قدیمی
};

function toIsoDate(v: string | Date | null | undefined) {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ProjectFormClient(props: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const customers = Array.isArray(props.customers) ? props.customers : [];
  const contractors = Array.isArray(props.contractors) ? props.contractors : [];
  const projectTypes = Array.isArray(props.projectTypes) ? props.projectTypes : [];

  const mode: "new" | "edit" = props.mode ?? "new";
  const initialProject = props.initialProject ?? null;

  const isEdit = mode === "edit" && !!initialProject?.id;
  const [step, setStep] = useState<1 | 2>(isEdit ? 2 : 1);

  const [customerId, setCustomerId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  // ✅ name = "نام داخلی" (غیر یکتا، غیر مرتبط با code)
  const [name, setName] = useState("");
  const [type, setType] = useState("کانکس");
  const [projectTypeId, setProjectTypeId] = useState<number | null>(null);
  const [size, setSize] = useState("");

  // ✅ startDate در state همچنان ISO (YYYY-MM-DD) ذخیره می‌شود
  const [startDate, setStartDate] = useState("");

  const [description, setDescription] = useState("");
  const [selectedContractors, setSelectedContractors] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [qcChecking, setQcChecking] = useState(false);
  const [qcOk, setQcOk] = useState<boolean | null>(null);
  const [qcMsg, setQcMsg] = useState<string | null>(null);

  const didPrefill = useRef(false);

  // ✅ برای اینکه name را فقط وقتی کاربر خودش تغییر نداده باشد پر کند
  const nameTouched = useRef(false);

  const lastCustomerId = useMemo(() => {
    if (!customers.length) return null;
    return customers.reduce((max, c) => (c.id > max ? c.id : max), customers[0].id);
  }, [customers]);

  // Prefill EDIT
  useEffect(() => {
    if (!isEdit) return;
    if (didPrefill.current) return;
    if (!initialProject) return;

    didPrefill.current = true;
    setStep(2);

    setCustomerId(initialProject.customerId ?? null);

    setTitle(String(initialProject.title ?? ""));
    setName(String(initialProject.name ?? "")); // ✅ همان نام داخلی ذخیره شده
    setType(String(initialProject.type ?? "کانکس"));
    setProjectTypeId(
      typeof initialProject.projectTypeId === "number" ? initialProject.projectTypeId : null
    );
    setSize(String(initialProject.size ?? ""));
    setDescription(String(initialProject.description ?? ""));

    setStartDate(toIsoDate(initialProject.startDate));

    const ids = Array.isArray(initialProject.contractorIds) ? initialProject.contractorIds : [];
    if (ids.length) setSelectedContractors(ids.filter((x) => Number.isFinite(x)) as number[]);
  }, [isEdit, initialProject]);

  // Prefill NEW from URL
  useEffect(() => {
    if (isEdit) return;

    const qCustomerId = sp.get("customerId");
    if (qCustomerId) {
      const n = Number(qCustomerId);
      if (Number.isFinite(n) && n > 0) {
        setCustomerId(n);
        setStep(2);
        return;
      }
    }
    if (!customerId && lastCustomerId) setCustomerId(lastCustomerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, lastCustomerId]);

  // default projectTypeId for NEW
  useEffect(() => {
    if (isEdit) return;
    if (!projectTypeId && projectTypes.length) {
      setProjectTypeId(projectTypes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectTypes]);

  // ✅ Auto-suggest "name" از روی title (نه کد PRJ)
  useEffect(() => {
    if (isEdit) return;
    if (nameTouched.current) return;

    const t = title.trim();
    if (t.length >= 3) {
      // نام داخلی پیش‌فرض = عنوان پروژه
      setName(t);
    } else if (!t && !nameTouched.current) {
      setName("");
    }
  }, [title, isEdit]);

  // QC check
  useEffect(() => {
    let alive = true;

    async function checkQc() {
      if (!projectTypeId) {
        setQcOk(null);
        setQcMsg("ابتدا نوع سازه را انتخاب کنید.");
        return;
      }

      setQcChecking(true);
      setQcMsg(null);

      try {
        const res = await fetch(`/api/qc-templates/${projectTypeId}`, { cache: "no-store" });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          if (!alive) return;
          setQcOk(false);
          setQcMsg("خطا در دریافت QC Template. (API مشکل دارد)");
          console.error("QC check failed:", msg);
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

        if (!alive) return;

        if (list.length > 0) {
          setQcOk(true);
          setQcMsg(null);
        } else {
          setQcOk(false);
          setQcMsg("برای این نوع سازه هنوز آیتم QC تعریف نشده است.");
        }
      } catch (e: any) {
        if (!alive) return;
        setQcOk(false);
        setQcMsg(e?.message || "خطای ارتباط با سرور هنگام بررسی QC");
      } finally {
        if (alive) setQcChecking(false);
      }
    }

    checkQc();
    return () => {
      alive = false;
    };
  }, [projectTypeId]);

  function toggleContractor(id: number) {
    setSelectedContractors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function submit() {
    setError(null);

    if (!customerId) {
      setError("ابتدا مشتری را انتخاب کنید.");
      if (!isEdit) setStep(1);
      return;
    }

    if (!title.trim()) {
      setError("عنوان پروژه الزامی است.");
      return;
    }

    if (!projectTypeId) {
      setError("نوع سازه (ProjectType) را انتخاب کنید.");
      setStep(2);
      return;
    }

    if (qcChecking) {
      setError("در حال بررسی QC... چند ثانیه صبر کنید.");
      return;
    }
    if (qcOk === false) {
      setError("ثبت پروژه قفل است: ابتدا برای این نوع سازه QC Template بسازید.");
      return;
    }

    // ✅ name اگر خالی بود، از title پر می‌شود (نام داخلی)
    const safeName = (name.trim() || title.trim()).trim();

    setLoading(true);

    try {
      if (!isEdit) {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            name: safeName, // ✅ نام داخلی (غیر یکتا)
            description: description.trim() || null,
            type: type.trim() || "کانکس",
            size: size.trim() || null,
            customerId,
            projectTypeId,
            startDate: startDate || null, // ✅ ISO
            contractorIds: selectedContractors,
            // ✅ code ارسال نمی‌کنیم -> سرور خودش یکتا می‌سازد
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.error || "خطا در ثبت پروژه");
          return;
        }

        const id = Number(data?.id ?? data?.project?.id);
        if (!id) {
          setError("پروژه ثبت شد ولی ID برنگشت. پاسخ API را چک کن.");
          return;
        }

        router.push(`/dashboard/projects/${id}`);
        return;
      }

      const pid = Number(initialProject?.id);
      if (!pid) {
        setError("شناسه پروژه برای ویرایش نامعتبر است.");
        return;
      }

      const res = await fetch(`/api/projects/${pid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          name: safeName,
          description: description.trim() || null,
          type: type.trim() || "کانکس",
          size: size.trim() || null,
          customerId,
          projectTypeId,
          startDate: startDate || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "خطا در ویرایش پروژه");
        return;
      }

      router.push(`/dashboard/projects/${pid}`);
    } catch (e: any) {
      setError(e?.message || "خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  const qcLocked = qcOk === false;

  return (
    <div className="space-y-3">
      {step === 2 && (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            qcChecking
              ? "border-zinc-200 bg-zinc-50 text-zinc-700"
              : qcLocked
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          <div className="font-extrabold mb-1">
            {qcChecking ? "در حال بررسی QC..." : qcLocked ? "ثبت پروژه قفل است" : "QC آماده است"}
          </div>

          {qcChecking ? (
            <div>لطفاً چند ثانیه صبر کنید…</div>
          ) : qcLocked ? (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>{qcMsg || "برای این نوع سازه QC تعریف نشده است. ابتدا QC را بسازید."}</div>
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/settings/qc?projectTypeId=${projectTypeId ?? ""}`)
                }
                className="rounded-xl bg-zinc-900 px-4 py-2 font-extrabold text-white"
              >
                رفتن به تنظیمات QC
              </button>
            </div>
          ) : (
            <div>می‌توانید پروژه را ثبت کنید.</div>
          )}

          <div className="mt-2 text-[11px] text-zinc-600">
            کد پروژه (Code) به‌صورت خودکار و یکتا توسط سرور تولید می‌شود.
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isEdit && (
        <div className="rounded-3xl border bg-white p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-sm font-extrabold ${
                step === 1 ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              1) انتخاب مشتری
            </span>
            <span className="text-zinc-400">→</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-extrabold ${
                step === 2 ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              2) نوع سازه و ثبت پروژه
            </span>
          </div>
        </div>
      )}

      {!isEdit && step === 1 && (
        <div className="rounded-3xl border bg-white p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="font-extrabold">انتخاب مشتری</h2>
              <p className="text-sm text-zinc-500">ابتدا مشتری را انتخاب کن، سپس برو مرحله بعد</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!customerId) {
                  setError("یک مشتری انتخاب کن");
                  return;
                }
                setStep(2);
              }}
              className="rounded-2xl bg-zinc-900 px-4 py-2 font-extrabold text-white"
            >
              مرحله بعد
            </button>
          </div>

          <div>
            <div className="text-xs text-zinc-500 mb-1">مشتری *</div>
            <select
              className="w-full rounded-2xl border px-3 py-2"
              value={customerId ?? ""}
              onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— انتخاب کنید —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (#{c.id})
                </option>
              ))}
            </select>

            <div className="mt-2 text-xs text-zinc-500">
              Auto-select: آخرین مشتری = <span className="font-bold">{lastCustomerId ?? "—"}</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-3xl border bg-white p-4 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="font-extrabold">{isEdit ? "ویرایش پروژه" : "ثبت پروژه"}</h2>
              <p className="text-sm text-zinc-500">
                {isEdit ? "تغییرات را اعمال کن و ذخیره کن" : "اطلاعات پروژه را تکمیل کن"}
              </p>
            </div>

            <div className="flex gap-2">
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl border bg-zinc-50 px-4 py-2 font-bold"
                  disabled={loading}
                >
                  برگشت
                </button>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={loading || qcChecking || qcLocked}
                className="rounded-2xl bg-emerald-600 px-5 py-2 font-extrabold text-white disabled:opacity-50"
              >
                {loading ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ثبت و ورود به پروژه"}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500 mb-1">مشتری *</div>
            <select
              className="w-full rounded-2xl border px-3 py-2"
              value={customerId ?? ""}
              onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— انتخاب کنید —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (#{c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <div className="text-xs text-zinc-500 mb-1">عنوان پروژه (نمایش برای کارفرما) *</div>
              <input
                className="w-full rounded-2xl border px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً کانکس ویلایی ۶×۲.۴"
              />
            </div>

            <div>
              <div className="text-xs text-zinc-500 mb-1">نام داخلی پروژه (اختیاری)</div>
              <input
                className="w-full rounded-2xl border px-3 py-2"
                value={name}
                onChange={(e) => {
                  nameTouched.current = true;
                  setName(e.target.value);
                }}
                placeholder="مثلاً پروژه کارگاهی سعادت‌آباد"
              />
              <div className="mt-1 text-[11px] text-zinc-500">
                اگر خالی بگذاری، سیستم از «عنوان پروژه» به‌عنوان نام داخلی استفاده می‌کند.
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500 mb-1">نوع کلی</div>
              <input
                className="w-full rounded-2xl border px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="کانکس"
              />
            </div>

            <div>
              <div className="text-xs text-zinc-500 mb-1">نوع سازه (ProjectType) *</div>
              <select
                className="w-full rounded-2xl border px-3 py-2"
                value={projectTypeId ?? ""}
                onChange={(e) => setProjectTypeId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— انتخاب کنید —</option>
                {projectTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-zinc-500">
                بعد از انتخاب نوع سازه، سیستم QC را بررسی می‌کند.
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500 mb-1">ابعاد</div>
              <input
                className="w-full rounded-2xl border px-3 py-2"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="مثلاً ۳×۶"
              />
            </div>

            <div>
              <div className="text-xs text-zinc-500 mb-1">تاریخ شروع</div>
              <JalaliDatePicker
                value={startDate || null}
                onChange={(iso) => setStartDate(iso ?? "")}
                placeholder="انتخاب تاریخ (شمسی)"
                className="w-full"
              />
              <div className="mt-1 text-[11px] text-zinc-500">
                نمایش: شمسی — ذخیره/ارسال به سرور: میلادی (YYYY-MM-DD)
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-zinc-500 mb-1">توضیحات</div>
              <textarea
                className="w-full rounded-2xl border px-3 py-2 min-h-[110px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="جزئیات، شرایط، نکته‌ها..."
              />
            </div>
          </div>

          {!!contractors.length && (
            <div className="rounded-2xl border bg-zinc-50 p-3">
              <div className="font-extrabold mb-2">پیمانکاران (اختیاری)</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-auto">
                {contractors.map((ctr) => {
                  const checked = selectedContractors.includes(ctr.id);

                  const partyName =
                    (ctr.party?.name ?? ctr.partyName ?? "").toString().trim() || "بدون نام";
                  const partyMobile =
                    (ctr.party?.mobile ?? ctr.partyMobile ?? "").toString().trim() || "";

                  const skillsArr = Array.isArray(ctr.skills) ? ctr.skills : [];
                  const skillsText =
                    skillsArr.length > 0
                      ? skillsArr
                          .map((s) => (s.projectType ? `${s.category} (${s.projectType.name})` : s.category))
                          .join("، ")
                      : "—";

                  return (
                    <label
                      key={ctr.id}
                      className={`flex items-start gap-2 text-sm p-2 rounded-xl cursor-pointer border ${
                        checked ? "bg-emerald-50 border-emerald-200" : "bg-white border-zinc-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() => toggleContractor(ctr.id)}
                      />
                      <div>
                        <div className="font-bold">{partyName}</div>

                        {!!partyMobile && (
                          <div className="text-xs text-zinc-500">موبایل: {partyMobile}</div>
                        )}

                        <div className="text-xs text-zinc-500">تخصص‌ها: {skillsText}</div>

                        {!ctr.party && !ctr.partyName && (
                          <div className="text-[11px] text-amber-700 mt-1">
                            ⚠️ این پیمانکار party متصل ندارد (داده ناقص است).
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
