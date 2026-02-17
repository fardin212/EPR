module.exports = [
"[project]/app/dashboard/settings/qc/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QCSettingsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
/* لیبل‌های فارسی مرحله‌ها */ const STAGE_LABELS = {
    1: "۱. برش و آماده‌سازی پروفیل",
    2: "۲. ساخت اسکلت اصلی",
    3: "۳. نصب کف و زیرسازی",
    4: "۴. نصب دیواره‌ها",
    5: "۵. نصب سقف",
    6: "۶. نصب درب و پنجره",
    7: "۷. برق‌کاری و تأسیسات داخلی",
    8: "۸. رنگ و نازک‌کاری",
    9: "۹. کنترل کیفیت نهایی"
};
function stageNameOf(order) {
    return STAGE_LABELS[order] || `مرحله ${order}`;
}
function normalizeItems(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
}
function normalizeSingleItem(data) {
    if (!data) return null;
    if (data?.item) return data.item;
    if (data?.data) return data.data;
    if (typeof data === "object" && data.id) return data;
    return null;
}
async function readApiError(res) {
    const ct = res.headers.get("content-type") || "";
    try {
        if (ct.includes("application/json")) {
            const j = await res.json();
            return j?.message || j?.error || j?.detail || JSON.stringify(j);
        }
        return await res.text();
    } catch  {
        return "خطای نامشخص از سرور";
    }
}
function QCSettingsPage() {
    const [types, setTypes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedTypeId, setSelectedTypeId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // فرم افزودن آیتم جدید
    const [newStageOrder, setNewStageOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [newTitle, setNewTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [newDesc, setNewDesc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [newRequired, setNewRequired] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const newStageName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>stageNameOf(newStageOrder), [
        newStageOrder
    ]);
    /* ---------------------------------------------------------------------------
     Load Project Types
  --------------------------------------------------------------------------- */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadTypes() {
            try {
                setError(null);
                const res = await fetch("/api/project-types", {
                    cache: "no-store"
                });
                if (!res.ok) {
                    setError(await readApiError(res));
                    return;
                }
                const data = await res.json();
                const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
                setTypes(list);
                if (list.length > 0) setSelectedTypeId(list[0].id);
                else setSelectedTypeId(null);
            } catch  {
                setError("خطا در دریافت لیست نوع پروژه‌ها");
            }
        }
        loadTypes();
    }, []);
    async function loadTemplate(typeId) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/qc-templates/${typeId}`, {
                cache: "no-store"
            });
            if (!res.ok) {
                const msg = await readApiError(res);
                console.error("Load QC template failed:", msg);
                setError(msg || "خطا در دریافت آیتم‌های QC");
                setItems([]);
                return;
            }
            const data = await res.json();
            const list = normalizeItems(data);
            setItems(list.map((x)=>({
                    ...x,
                    projectTypeId: Number(x.projectTypeId ?? typeId),
                    stageOrder: Number(x.stageOrder ?? 1),
                    stageName: String(x.stageName || stageNameOf(Number(x.stageOrder ?? 1))),
                    title: String(x.title ?? ""),
                    description: x.description ?? "",
                    isRequired: Boolean(x.isRequired)
                })));
        } catch  {
            setError("خطای ارتباط با سرور");
        } finally{
            setLoading(false);
        }
    }
    /* ---------------------------------------------------------------------------
     Load QC Template Items for selected type
  --------------------------------------------------------------------------- */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!selectedTypeId) {
            setItems([]);
            return;
        }
        loadTemplate(selectedTypeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedTypeId
    ]);
    /* ---------------------------------------------------------------------------
     Add New QC Item
  --------------------------------------------------------------------------- */ async function addItem() {
        if (!selectedTypeId) {
            alert("نوع پروژه را انتخاب کنید");
            return;
        }
        const title = newTitle.trim();
        if (!title) {
            alert("عنوان آیتم QC را وارد کنید");
            return;
        }
        if (saving) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/qc-templates/${selectedTypeId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    projectTypeId: selectedTypeId,
                    stageOrder: Number(newStageOrder || 1),
                    stageName: newStageName,
                    title,
                    description: (newDesc || "").trim(),
                    isRequired: Boolean(newRequired)
                })
            });
            if (!res.ok) {
                const msg = await readApiError(res);
                console.error("QC API ERROR:", msg);
                setError(msg || "خطا در افزودن آیتم QC");
                alert(msg || "خطا در افزودن آیتم QC");
                return;
            }
            const data = await res.json().catch(()=>null);
            const created = normalizeSingleItem(data);
            // ریست فرم
            setNewTitle("");
            setNewDesc("");
            setNewRequired(true);
            setNewStageOrder(1);
            if (created?.id) {
                // سریع به لیست اضافه کن (UX بهتر)
                setItems((prev)=>[
                        ...prev,
                        {
                            ...created,
                            projectTypeId: Number(created.projectTypeId ?? selectedTypeId),
                            stageOrder: Number(created.stageOrder ?? 1),
                            stageName: String(created.stageName || stageNameOf(Number(created.stageOrder ?? 1))),
                            title: String(created.title ?? ""),
                            description: created.description ?? "",
                            isRequired: Boolean(created.isRequired)
                        }
                    ]);
            } else {
                // اگر سرور آیتم برنگردوند، لیست را رفرش کن
                await loadTemplate(selectedTypeId);
            }
        } finally{
            setSaving(false);
        }
    }
    /* ---------------------------------------------------------------------------
     Update Item (Optimistic + PATCH)
  --------------------------------------------------------------------------- */ const updateItem = async (item, patch)=>{
        if (!selectedTypeId) return;
        const updated = {
            ...item,
            ...patch
        };
        if (patch.stageOrder != null) {
            updated.stageOrder = Number(patch.stageOrder);
            updated.stageName = stageNameOf(updated.stageOrder);
        }
        // optimistic UI
        setItems((prev)=>prev.map((i)=>i.id === item.id ? updated : i));
        try {
            const res = await fetch(`/api/qc-templates/${selectedTypeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: updated.id,
                    projectTypeId: selectedTypeId,
                    stageOrder: Number(updated.stageOrder ?? 1),
                    stageName: String(updated.stageName || stageNameOf(Number(updated.stageOrder ?? 1))),
                    title: String(updated.title ?? "").trim(),
                    description: String(updated.description ?? ""),
                    isRequired: Boolean(updated.isRequired),
                    sortOrder: Number(updated.sortOrder ?? 0),
                    defaultStatus: updated.defaultStatus ?? null
                })
            });
            if (!res.ok) {
                const msg = await readApiError(res);
                console.error("Update QC item failed:", msg);
                alert(msg || "خطا در ذخیره تغییرات");
                // بهترین حالت: رفرش برای برگشت به وضعیت صحیح سرور
                await loadTemplate(selectedTypeId);
            }
        } catch  {
            alert("خطای ارتباط با سرور");
            await loadTemplate(selectedTypeId);
        }
    };
    /* ---------------------------------------------------------------------------
     Delete Item
  --------------------------------------------------------------------------- */ const deleteItem = async (item)=>{
        if (!selectedTypeId) return;
        if (!confirm("این آیتم QC حذف شود؟")) return;
        const prev = items;
        setItems((p)=>p.filter((i)=>i.id !== item.id));
        setError(null);
        try {
            const res = await fetch(`/api/qc-templates/${selectedTypeId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: item.id,
                    projectTypeId: selectedTypeId
                })
            });
            if (!res.ok) {
                const msg = await readApiError(res);
                console.error("Delete QC item failed:", msg);
                alert(msg || "خطا در حذف آیتم QC");
                setItems(prev);
                setError(msg || "خطا در حذف آیتم QC");
            }
        } catch  {
            alert("خطای ارتباط با سرور");
            setItems(prev);
        }
    };
    /* ---------------------------------------------------------------------------
     UI
  --------------------------------------------------------------------------- */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-lg font-semibold text-zinc-100",
                children: "تنظیمات QC پروژه‌ها"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                lineNumber: 324,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 bg-zinc-900/40 border border-zinc-700/60 rounded-2xl p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-3 items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm text-zinc-400",
                                children: "نوع پروژه:"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                lineNumber: 328,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60",
                                value: selectedTypeId ?? "",
                                onChange: (e)=>{
                                    const v = e.target.value;
                                    setSelectedTypeId(v ? Number(v) : null);
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        className: "bg-zinc-900 text-zinc-400",
                                        children: "انتخاب نوع پروژه"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 338,
                                        columnNumber: 13
                                    }, this),
                                    types.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: t.id,
                                            className: "bg-zinc-900 text-zinc-100",
                                            children: t.name
                                        }, t.id, false, {
                                            fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                            lineNumber: 343,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                lineNumber: 330,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: addItem,
                                disabled: saving || !selectedTypeId,
                                className: "px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed",
                                children: saving ? "در حال ثبت..." : "افزودن آیتم QC"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                lineNumber: 349,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                        lineNumber: 327,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-6 gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[11px] text-zinc-400",
                                        children: "مرحله"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 361,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "w-full mt-1 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                        value: newStageOrder,
                                        onChange: (e)=>setNewStageOrder(Number(e.target.value)),
                                        children: Array.from({
                                            length: 9
                                        }, (_, i)=>i + 1).map((idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: idx,
                                                className: "bg-zinc-950 text-zinc-100",
                                                children: STAGE_LABELS[idx]
                                            }, idx, false, {
                                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                                lineNumber: 368,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 362,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                lineNumber: 360,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[11px] text-zinc-400",
                                        children: "عنوان"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 376,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "w-full mt-1 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-2 text-xs",
                                        value: newTitle,
                                        placeholder: "مثلاً: کنترل جوش اسکلت",
                                        onChange: (e)=>setNewTitle(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 377,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                lineNumber: 375,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "text-[11px] text-zinc-400",
                                        children: "توضیح"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 386,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        className: "w-full mt-1 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-lg px-2 py-2 text-xs",
                                        value: newDesc,
                                        placeholder: "اختیاری",
                                        onChange: (e)=>setNewDesc(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 387,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                lineNumber: 385,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "inline-flex items-center gap-2 text-[11px] text-zinc-200 mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                checked: newRequired,
                                                onChange: (e)=>setNewRequired(e.target.checked)
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                                lineNumber: 397,
                                                columnNumber: 15
                                            }, this),
                                            "ضروری"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 396,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-[11px] text-zinc-500 mt-1",
                                        children: [
                                            "مرحله انتخاب‌شده: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-zinc-300",
                                                children: newStageName
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                                lineNumber: 405,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                        lineNumber: 404,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                lineNumber: 395,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                        lineNumber: 359,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                lineNumber: 326,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-red-400 bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2",
                children: error
            }, void 0, false, {
                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                lineNumber: 412,
                columnNumber: 9
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm text-zinc-400",
                children: "در حال بارگذاری..."
            }, void 0, false, {
                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                lineNumber: 418,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col md:flex-row md:items-center gap-3 bg-zinc-900/60 border border-zinc-700/60 rounded-xl px-3 py-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                    value: item.stageOrder,
                                    onChange: (e)=>updateItem(item, {
                                            stageOrder: Number(e.target.value)
                                        }),
                                    children: Array.from({
                                        length: 9
                                    }, (_, i)=>i + 1).map((idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: idx,
                                            className: "bg-zinc-950 text-zinc-100",
                                            children: STAGE_LABELS[idx]
                                        }, idx, false, {
                                            fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                            lineNumber: 432,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                    lineNumber: 426,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "flex-1 bg-zinc-950 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-2 text-xs",
                                    value: item.title,
                                    onChange: (e)=>updateItem(item, {
                                            title: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                    lineNumber: 438,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "flex-1 bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-lg px-2 py-2 text-xs",
                                    value: item.description ?? "",
                                    placeholder: "توضیح (اختیاری)",
                                    onChange: (e)=>updateItem(item, {
                                            description: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                    lineNumber: 444,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "inline-flex items-center gap-1 text-[11px] text-zinc-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: item.isRequired,
                                            onChange: (e)=>updateItem(item, {
                                                    isRequired: e.target.checked
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                            lineNumber: 452,
                                            columnNumber: 17
                                        }, this),
                                        "ضروری"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                    lineNumber: 451,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>deleteItem(item),
                                    className: "px-2 py-2 rounded-lg bg-red-700/80 hover:bg-red-600 text-[11px]",
                                    children: "حذف"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                                    lineNumber: 460,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, item.id, true, {
                            fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                            lineNumber: 422,
                            columnNumber: 13
                        }, this)),
                    items.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-zinc-500",
                        children: "هنوز آیتم QC برای این نوع پروژه تعریف نشده است."
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                        lineNumber: 470,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/settings/qc/page.tsx",
                lineNumber: 420,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/settings/qc/page.tsx",
        lineNumber: 323,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_dashboard_settings_qc_page_tsx_746aa0dd._.js.map