(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/ui/JalaliDatePicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JalaliDatePicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$multi$2d$date$2d$picker$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-multi-date-picker/build/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$date$2d$object$2f$calendars$2f$persian$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-date-object/calendars/persian.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$date$2d$object$2f$locales$2f$persian_fa$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-date-object/locales/persian_fa.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function toIsoDate(d) {
    // YYYY-MM-DD
    return d.toISOString().slice(0, 10);
}
function JalaliDatePicker({ value, onChange, onIsoChange, className, disabled }) {
    _s();
    const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JalaliDatePicker.useMemo[current]": ()=>{
            if (!value) return null;
            // value مثل 2026-01-03
            const d = new Date(value + "T00:00:00");
            if (Number.isNaN(d.getTime())) return null;
            // تبدیل تاریخ میلادی به DateObject با نمایش شمسی
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$multi$2d$date$2d$picker$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DateObject"](d).convert(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$date$2d$object$2f$calendars$2f$persian$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
        }
    }["JalaliDatePicker.useMemo[current]"], [
        value
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$multi$2d$date$2d$picker$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        value: current,
        disabled: disabled,
        className: className,
        calendar: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$date$2d$object$2f$calendars$2f$persian$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        locale: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$date$2d$object$2f$locales$2f$persian_fa$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        calendarPosition: "bottom-right",
        onChange: (v)=>{
            // اگر کاربر پاک کرد
            if (!v) return;
            // v یک DateObject شمسی است؛ به Date (میلادی) تبدیل می‌کنیم
            const g = v.convert("gregorian").toDate();
            const cb = onIsoChange ?? onChange; // ✅ این خط کل مشکل تو رو حل می‌کنه
            if (typeof cb === "function") cb(toIsoDate(g));
        }
    }, void 0, false, {
        fileName: "[project]/app/ui/JalaliDatePicker.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_s(JalaliDatePicker, "JllYgPLBDeQteE+WBTmqZSdRyuo=");
_c = JalaliDatePicker;
var _c;
__turbopack_context__.k.register(_c, "JalaliDatePicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/dashboard/projects/new/ProjectFormClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProjectFormClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$ui$2f$JalaliDatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/ui/JalaliDatePicker.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function toIsoDate(v) {
    if (!v) return "";
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function ProjectFormClient(props) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const sp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const customers = Array.isArray(props.customers) ? props.customers : [];
    const contractors = Array.isArray(props.contractors) ? props.contractors : [];
    const projectTypes = Array.isArray(props.projectTypes) ? props.projectTypes : [];
    const mode = props.mode ?? "new";
    const initialProject = props.initialProject ?? null;
    const isEdit = mode === "edit" && !!initialProject?.id;
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(isEdit ? 2 : 1);
    const [customerId, setCustomerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // ✅ name = "نام داخلی" (غیر یکتا، غیر مرتبط با code)
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [type, setType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("کانکس");
    const [projectTypeId, setProjectTypeId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [size, setSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // ✅ startDate در state همچنان ISO (YYYY-MM-DD) ذخیره می‌شود
    const [startDate, setStartDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedContractors, setSelectedContractors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [qcChecking, setQcChecking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [qcOk, setQcOk] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [qcMsg, setQcMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const didPrefill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // ✅ برای اینکه name را فقط وقتی کاربر خودش تغییر نداده باشد پر کند
    const nameTouched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const lastCustomerId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ProjectFormClient.useMemo[lastCustomerId]": ()=>{
            if (!customers.length) return null;
            return customers.reduce({
                "ProjectFormClient.useMemo[lastCustomerId]": (max, c)=>c.id > max ? c.id : max
            }["ProjectFormClient.useMemo[lastCustomerId]"], customers[0].id);
        }
    }["ProjectFormClient.useMemo[lastCustomerId]"], [
        customers
    ]);
    // Prefill EDIT
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectFormClient.useEffect": ()=>{
            if (!isEdit) return;
            if (didPrefill.current) return;
            if (!initialProject) return;
            didPrefill.current = true;
            setStep(2);
            setCustomerId(initialProject.customerId ?? null);
            setTitle(String(initialProject.title ?? ""));
            setName(String(initialProject.name ?? "")); // ✅ همان نام داخلی ذخیره شده
            setType(String(initialProject.type ?? "کانکس"));
            setProjectTypeId(typeof initialProject.projectTypeId === "number" ? initialProject.projectTypeId : null);
            setSize(String(initialProject.size ?? ""));
            setDescription(String(initialProject.description ?? ""));
            setStartDate(toIsoDate(initialProject.startDate));
            const ids = Array.isArray(initialProject.contractorIds) ? initialProject.contractorIds : [];
            if (ids.length) setSelectedContractors(ids.filter({
                "ProjectFormClient.useEffect": (x)=>Number.isFinite(x)
            }["ProjectFormClient.useEffect"]));
        }
    }["ProjectFormClient.useEffect"], [
        isEdit,
        initialProject
    ]);
    // Prefill NEW from URL
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectFormClient.useEffect": ()=>{
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
        }
    }["ProjectFormClient.useEffect"], [
        sp,
        lastCustomerId
    ]);
    // default projectTypeId for NEW
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectFormClient.useEffect": ()=>{
            if (isEdit) return;
            if (!projectTypeId && projectTypes.length) {
                setProjectTypeId(projectTypes[0].id);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["ProjectFormClient.useEffect"], [
        projectTypes
    ]);
    // ✅ Auto-suggest "name" از روی title (نه کد PRJ)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectFormClient.useEffect": ()=>{
            if (isEdit) return;
            if (nameTouched.current) return;
            const t = title.trim();
            if (t.length >= 3) {
                // نام داخلی پیش‌فرض = عنوان پروژه
                setName(t);
            } else if (!t && !nameTouched.current) {
                setName("");
            }
        }
    }["ProjectFormClient.useEffect"], [
        title,
        isEdit
    ]);
    // QC check
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectFormClient.useEffect": ()=>{
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
                    const res = await fetch(`/api/qc-templates/${projectTypeId}`, {
                        cache: "no-store"
                    });
                    if (!res.ok) {
                        const msg = await res.text().catch({
                            "ProjectFormClient.useEffect.checkQc": ()=>""
                        }["ProjectFormClient.useEffect.checkQc"]);
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
                } catch (e) {
                    if (!alive) return;
                    setQcOk(false);
                    setQcMsg(e?.message || "خطای ارتباط با سرور هنگام بررسی QC");
                } finally{
                    if (alive) setQcChecking(false);
                }
            }
            checkQc();
            return ({
                "ProjectFormClient.useEffect": ()=>{
                    alive = false;
                }
            })["ProjectFormClient.useEffect"];
        }
    }["ProjectFormClient.useEffect"], [
        projectTypeId
    ]);
    function toggleContractor(id) {
        setSelectedContractors((prev)=>prev.includes(id) ? prev.filter((x)=>x !== id) : [
                ...prev,
                id
            ]);
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
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: title.trim(),
                        name: safeName,
                        description: description.trim() || null,
                        type: type.trim() || "کانکس",
                        size: size.trim() || null,
                        customerId,
                        projectTypeId,
                        startDate: startDate || null,
                        contractorIds: selectedContractors
                    })
                });
                const data = await res.json().catch(()=>({}));
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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title.trim(),
                    name: safeName,
                    description: description.trim() || null,
                    type: type.trim() || "کانکس",
                    size: size.trim() || null,
                    customerId,
                    projectTypeId,
                    startDate: startDate || null
                })
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                setError(data?.error || "خطا در ویرایش پروژه");
                return;
            }
            router.push(`/dashboard/projects/${pid}`);
        } catch (e) {
            setError(e?.message || "خطای ارتباط با سرور");
        } finally{
            setLoading(false);
        }
    }
    const qcLocked = qcOk === false;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `rounded-2xl border p-4 text-sm ${qcChecking ? "border-zinc-200 bg-zinc-50 text-zinc-700" : qcLocked ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-extrabold mb-1",
                        children: qcChecking ? "در حال بررسی QC..." : qcLocked ? "ثبت پروژه قفل است" : "QC آماده است"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 348,
                        columnNumber: 11
                    }, this),
                    qcChecking ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: "لطفاً چند ثانیه صبر کنید…"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 353,
                        columnNumber: 13
                    }, this) : qcLocked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: qcMsg || "برای این نوع سازه QC تعریف نشده است. ابتدا QC را بسازید."
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 356,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>router.push(`/dashboard/settings/qc?projectTypeId=${projectTypeId ?? ""}`),
                                className: "rounded-xl bg-zinc-900 px-4 py-2 font-extrabold text-white",
                                children: "رفتن به تنظیمات QC"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 357,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 355,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: "می‌توانید پروژه را ثبت کنید."
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 368,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 text-[11px] text-zinc-600",
                        children: "کد پروژه (Code) به‌صورت خودکار و یکتا توسط سرور تولید می‌شود."
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 371,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                lineNumber: 339,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700",
                children: error
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                lineNumber: 378,
                columnNumber: 9
            }, this),
            !isEdit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-3xl border bg-white p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 flex-wrap",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `px-3 py-1 rounded-full text-sm font-extrabold ${step === 1 ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`,
                            children: "1) انتخاب مشتری"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                            lineNumber: 386,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-zinc-400",
                            children: "→"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                            lineNumber: 393,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `px-3 py-1 rounded-full text-sm font-extrabold ${step === 2 ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`,
                            children: "2) نوع سازه و ثبت پروژه"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                            lineNumber: 394,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                    lineNumber: 385,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                lineNumber: 384,
                columnNumber: 9
            }, this),
            !isEdit && step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-3xl border bg-white p-4 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-extrabold",
                                        children: "انتخاب مشتری"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 409,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-zinc-500",
                                        children: "ابتدا مشتری را انتخاب کن، سپس برو مرحله بعد"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 410,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 408,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    if (!customerId) {
                                        setError("یک مشتری انتخاب کن");
                                        return;
                                    }
                                    setStep(2);
                                },
                                className: "rounded-2xl bg-zinc-900 px-4 py-2 font-extrabold text-white",
                                children: "مرحله بعد"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 412,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 407,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-zinc-500 mb-1",
                                children: "مشتری *"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 428,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "w-full rounded-2xl border px-3 py-2",
                                value: customerId ?? "",
                                onChange: (e)=>setCustomerId(e.target.value ? Number(e.target.value) : null),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "— انتخاب کنید —"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 434,
                                        columnNumber: 15
                                    }, this),
                                    customers.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c.id,
                                            children: [
                                                c.name,
                                                " (#",
                                                c.id,
                                                ")"
                                            ]
                                        }, c.id, true, {
                                            fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                            lineNumber: 436,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 429,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 text-xs text-zinc-500",
                                children: [
                                    "Auto-select: آخرین مشتری = ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold",
                                        children: lastCustomerId ?? "—"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 443,
                                        columnNumber: 42
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 442,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 427,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                lineNumber: 406,
                columnNumber: 9
            }, this),
            step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-3xl border bg-white p-4 space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-extrabold",
                                        children: isEdit ? "ویرایش پروژه" : "ثبت پروژه"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 453,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-zinc-500",
                                        children: isEdit ? "تغییرات را اعمال کن و ذخیره کن" : "اطلاعات پروژه را تکمیل کن"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 454,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 452,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    !isEdit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setStep(1),
                                        className: "rounded-2xl border bg-zinc-50 px-4 py-2 font-bold",
                                        disabled: loading,
                                        children: "برگشت"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 461,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: submit,
                                        disabled: loading || qcChecking || qcLocked,
                                        className: "rounded-2xl bg-emerald-600 px-5 py-2 font-extrabold text-white disabled:opacity-50",
                                        children: loading ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ثبت و ورود به پروژه"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 471,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 459,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 451,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-zinc-500 mb-1",
                                children: "مشتری *"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 483,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "w-full rounded-2xl border px-3 py-2",
                                value: customerId ?? "",
                                onChange: (e)=>setCustomerId(e.target.value ? Number(e.target.value) : null),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "— انتخاب کنید —"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 489,
                                        columnNumber: 15
                                    }, this),
                                    customers.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c.id,
                                            children: [
                                                c.name,
                                                " (#",
                                                c.id,
                                                ")"
                                            ]
                                        }, c.id, true, {
                                            fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                            lineNumber: 491,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 484,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 482,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-zinc-500 mb-1",
                                        children: "عنوان پروژه (نمایش برای کارفرما) *"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 500,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "w-full rounded-2xl border px-3 py-2",
                                        value: title,
                                        onChange: (e)=>setTitle(e.target.value),
                                        placeholder: "مثلاً کانکس ویلایی ۶×۲.۴"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 501,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 499,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-zinc-500 mb-1",
                                        children: "نام داخلی پروژه (اختیاری)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 510,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "w-full rounded-2xl border px-3 py-2",
                                        value: name,
                                        onChange: (e)=>{
                                            nameTouched.current = true;
                                            setName(e.target.value);
                                        },
                                        placeholder: "مثلاً پروژه کارگاهی سعادت‌آباد"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 511,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 text-[11px] text-zinc-500",
                                        children: "اگر خالی بگذاری، سیستم از «عنوان پروژه» به‌عنوان نام داخلی استفاده می‌کند."
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 520,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 509,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-zinc-500 mb-1",
                                        children: "نوع کلی"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 526,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "w-full rounded-2xl border px-3 py-2",
                                        value: type,
                                        onChange: (e)=>setType(e.target.value),
                                        placeholder: "کانکس"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 527,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 525,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-zinc-500 mb-1",
                                        children: "نوع سازه (ProjectType) *"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 536,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "w-full rounded-2xl border px-3 py-2",
                                        value: projectTypeId ?? "",
                                        onChange: (e)=>setProjectTypeId(e.target.value ? Number(e.target.value) : null),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "— انتخاب کنید —"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                                lineNumber: 542,
                                                columnNumber: 17
                                            }, this),
                                            projectTypes.map((pt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: pt.id,
                                                    children: pt.name
                                                }, pt.id, false, {
                                                    fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                                    lineNumber: 544,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 537,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 text-[11px] text-zinc-500",
                                        children: "بعد از انتخاب نوع سازه، سیستم QC را بررسی می‌کند."
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 549,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 535,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-zinc-500 mb-1",
                                        children: "ابعاد"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 555,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "w-full rounded-2xl border px-3 py-2",
                                        value: size,
                                        onChange: (e)=>setSize(e.target.value),
                                        placeholder: "مثلاً ۳×۶"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 556,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 554,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-zinc-500 mb-1",
                                        children: "تاریخ شروع"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 565,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$ui$2f$JalaliDatePicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        value: startDate || null,
                                        onChange: (iso)=>setStartDate(iso ?? ""),
                                        placeholder: "انتخاب تاریخ (شمسی)",
                                        className: "w-full"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 566,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 text-[11px] text-zinc-500",
                                        children: "نمایش: شمسی — ذخیره/ارسال به سرور: میلادی (YYYY-MM-DD)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 572,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 564,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-zinc-500 mb-1",
                                        children: "توضیحات"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 578,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        className: "w-full rounded-2xl border px-3 py-2 min-h-[110px]",
                                        value: description,
                                        onChange: (e)=>setDescription(e.target.value),
                                        placeholder: "جزئیات، شرایط، نکته‌ها..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 579,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 577,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 498,
                        columnNumber: 11
                    }, this),
                    !!contractors.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-2xl border bg-zinc-50 p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-extrabold mb-2",
                                children: "پیمانکاران (اختیاری)"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 590,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-auto",
                                children: contractors.map((ctr)=>{
                                    const checked = selectedContractors.includes(ctr.id);
                                    const partyName = (ctr.party?.name ?? ctr.partyName ?? "").toString().trim() || "بدون نام";
                                    const partyMobile = (ctr.party?.mobile ?? ctr.partyMobile ?? "").toString().trim() || "";
                                    const skillsArr = Array.isArray(ctr.skills) ? ctr.skills : [];
                                    const skillsText = skillsArr.length > 0 ? skillsArr.map((s)=>s.projectType ? `${s.category} (${s.projectType.name})` : s.category).join("، ") : "—";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: `flex items-start gap-2 text-sm p-2 rounded-xl cursor-pointer border ${checked ? "bg-emerald-50 border-emerald-200" : "bg-white border-zinc-200"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                className: "mt-1",
                                                checked: checked,
                                                onChange: ()=>toggleContractor(ctr.id)
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                                lineNumber: 616,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-bold",
                                                        children: partyName
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                                        lineNumber: 623,
                                                        columnNumber: 25
                                                    }, this),
                                                    !!partyMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-zinc-500",
                                                        children: [
                                                            "موبایل: ",
                                                            partyMobile
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                                        lineNumber: 626,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-zinc-500",
                                                        children: [
                                                            "تخصص‌ها: ",
                                                            skillsText
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                                        lineNumber: 629,
                                                        columnNumber: 25
                                                    }, this),
                                                    !ctr.party && !ctr.partyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[11px] text-amber-700 mt-1",
                                                        children: "⚠️ این پیمانکار party متصل ندارد (داده ناقص است)."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                                        lineNumber: 632,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                                lineNumber: 622,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, ctr.id, true, {
                                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                        lineNumber: 610,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                                lineNumber: 592,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                        lineNumber: 589,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
                lineNumber: 450,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/projects/new/ProjectFormClient.tsx",
        lineNumber: 337,
        columnNumber: 5
    }, this);
}
_s(ProjectFormClient, "g5vZ0GmORPQi8huwjJJxOwyczV0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = ProjectFormClient;
var _c;
__turbopack_context__.k.register(_c, "ProjectFormClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/dashboard/projects/new/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NewProjectPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$projects$2f$new$2f$ProjectFormClient$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/dashboard/projects/new/ProjectFormClient.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function NewProjectPage() {
    _s();
    const [customers, setCustomers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [projectTypes, setProjectTypes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hasQcTemplate, setHasQcTemplate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [err, setErr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewProjectPage.useEffect": ()=>{
            let alive = true;
            async function load() {
                try {
                    setLoading(true);
                    setErr(null);
                    // ✅ مشتری‌ها = Party (kind=CUSTOMER)
                    const cRes = await fetch("/api/parties?kind=CUSTOMER&take=300", {
                        cache: "no-store"
                    });
                    const cJson = await cRes.json();
                    const customers = (Array.isArray(cJson) ? cJson : []).map({
                        "NewProjectPage.useEffect.load.customers": (p)=>({
                                id: Number(p.id),
                                name: String(p.name).trim()
                            })
                    }["NewProjectPage.useEffect.load.customers"]).filter({
                        "NewProjectPage.useEffect.load.customers": (x)=>x.id > 0 && x.name
                    }["NewProjectPage.useEffect.load.customers"]);
                    // نوع پروژه‌ها
                    const ptRes = await fetch("/api/project-types?take=200", {
                        cache: "no-store"
                    });
                    const ptJson = await ptRes.json();
                    const projectTypes = (ptJson?.items || ptJson || []).map({
                        "NewProjectPage.useEffect.load.projectTypes": (x)=>({
                                id: Number(x.id),
                                name: String(x.name || "—")
                            })
                    }["NewProjectPage.useEffect.load.projectTypes"]);
                    // QC Template check
                    const qcRes = await fetch("/api/qc-templates?take=1", {
                        cache: "no-store"
                    });
                    const qcJson = await qcRes.json();
                    const qcCount = Array.isArray(qcJson?.items) ? qcJson.items.length : Array.isArray(qcJson) ? qcJson.length : 0;
                    if (!alive) return;
                    setCustomers(customers);
                    setProjectTypes(projectTypes);
                    setHasQcTemplate(qcCount > 0);
                } catch (e) {
                    if (!alive) return;
                    setErr(e?.message || "خطا در دریافت اطلاعات اولیه");
                } finally{
                    if (!alive) return;
                    setLoading(false);
                }
            }
            load();
            return ({
                "NewProjectPage.useEffect": ()=>{
                    alive = false;
                }
            })["NewProjectPage.useEffect"];
        }
    }["NewProjectPage.useEffect"], []);
    const emptyContractors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewProjectPage.useMemo[emptyContractors]": ()=>[]
    }["NewProjectPage.useMemo[emptyContractors]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        dir: "rtl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2 flex-wrap",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-xl font-extrabold",
                            children: "پروژه جدید"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/projects/new/page.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-zinc-500",
                            children: "ویزارد: ابتدا مشتری → سپس نوع سازه و مشخصات پروژه"
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/projects/new/page.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/dashboard/projects/new/page.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/new/page.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border bg-white p-4 text-sm text-zinc-600",
                children: "در حال بارگذاری..."
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/new/page.tsx",
                lineNumber: 94,
                columnNumber: 9
            }, this),
            err && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700",
                children: err
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/new/page.tsx",
                lineNumber: 100,
                columnNumber: 9
            }, this),
            !loading && !err && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$projects$2f$new$2f$ProjectFormClient$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                customers: customers,
                contractors: emptyContractors,
                projectTypes: projectTypes,
                hasQcTemplate: hasQcTemplate
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/new/page.tsx",
                lineNumber: 106,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/projects/new/page.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_s(NewProjectPage, "6DRlTTaUfbIckySSJJ9X8HLo+b0=");
_c = NewProjectPage;
var _c;
__turbopack_context__.k.register(_c, "NewProjectPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_79e3bc8a._.js.map