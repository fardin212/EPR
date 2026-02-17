module.exports = [
"[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StageChecklistClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function extractChecklist(payload) {
    // API ممکنه چند مدل برگردونه؛ اینجا همه رو پوشش می‌دیم
    if (Array.isArray(payload)) return payload;
    const candidates = [
        payload?.items,
        payload?.data?.items,
        payload?.checklist,
        payload?.data?.checklist,
        payload?.stage?.checklist,
        payload?.data?.stage?.checklist
    ];
    for (const c of candidates){
        if (Array.isArray(c)) return c;
    }
    return [];
}
async function readErrorText(res) {
    // تلاش می‌کنیم متن خطا را بفهمیم (json/text)
    const ct = res.headers.get("content-type") || "";
    try {
        if (ct.includes("application/json")) {
            const j = await res.json().catch(()=>null);
            const msg = j?.message || j?.error || j?.details || (typeof j === "string" ? j : null);
            if (msg) return String(msg);
            return JSON.stringify(j);
        }
    } catch  {}
    try {
        const t = await res.text();
        return t || "";
    } catch  {
        return "";
    }
}
function statusLabel(s) {
    if (s === "PASSED") return "تایید";
    if (s === "FAILED") return "رد";
    return "در انتظار";
}
function StageChecklistClient({ stageId }) {
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [savingId, setSavingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [notesDraft, setNotesDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    // برای جلوگیری از setState بعد از unmount / race
    const abortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mountedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
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
                signal: ac.signal
            });
            if (!res.ok) {
                const t = await readErrorText(res);
                throw new Error(t || `خطا در دریافت چک‌لیست مرحله (${res.status})`);
            }
            const data = await res.json().catch(()=>null);
            const list = extractChecklist(data);
            if (!mountedRef.current) return;
            setItems(list);
            // draft note ها را فقط برای آیتم‌های موجود همگام کن
            setNotesDraft((prev)=>{
                const next = {
                    ...prev
                };
                // آیتم‌های جدید/موجود را تنظیم کن
                for (const it of list){
                    if (typeof next[it.id] !== "string") next[it.id] = it.note ?? "";
                }
                // آیتم‌های حذف‌شده را پاک کن
                for (const key of Object.keys(next)){
                    const id = Number(key);
                    if (!list.some((x)=>x.id === id)) delete next[id];
                }
                return next;
            });
        } catch (e) {
            if (e?.name === "AbortError") return;
            if (!mountedRef.current) return;
            setError(e?.message || "خطای نامشخص");
        } finally{
            if (!mountedRef.current) return;
            setLoading(false);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mountedRef.current = true;
        load();
        return ()=>{
            mountedRef.current = false;
            abortRef.current?.abort();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        stageId
    ]);
    const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const total = items.length;
        const requiredItems = items.filter((x)=>x.isRequired);
        const required = requiredItems.length;
        const passed = requiredItems.filter((x)=>x.status === "PASSED").length;
        const failed = requiredItems.filter((x)=>x.status === "FAILED").length;
        const pending = requiredItems.filter((x)=>x.status === "PENDING").length;
        const progress = required ? Math.round(passed / required * 100) : 0;
        return {
            total,
            required,
            passed,
            failed,
            pending,
            progress
        };
    }, [
        items
    ]);
    async function patchItem(itemId, nextStatus) {
        setError(null);
        setSavingId(itemId);
        // optimistic UI
        const prevItems = items;
        setItems((prev)=>prev.map((x)=>x.id === itemId ? {
                    ...x,
                    status: nextStatus,
                    note: notesDraft[itemId] ?? x.note ?? ""
                } : x));
        try {
            const res = await fetch(`/api/project-stages/${stageId}/checklist`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    itemId,
                    status: nextStatus,
                    note: notesDraft[itemId] ?? ""
                })
            });
            if (!res.ok) {
                const t = await readErrorText(res);
                throw new Error(t || `خطا در ثبت وضعیت (${res.status})`);
            }
            const updated = await res.json().catch(()=>null);
            // چند حالت محتمل:
            // 1) یک آیتم
            // 2) کل لیست
            // 3) {items: [...]}
            if (updated?.id) {
                setItems((prev)=>prev.map((x)=>x.id === updated.id ? {
                            ...x,
                            ...updated
                        } : x));
            } else {
                const list = extractChecklist(updated);
                if (list.length) setItems(list);
                else {
                    // اگر چیزی مشخص نبود، دوباره لود کن
                    await load();
                }
            }
        } catch (e) {
            // rollback optimistic
            setItems(prevItems);
            setError(e?.message || "خطای نامشخص");
        } finally{
            setSavingId(null);
        }
    }
    async function saveNoteOnly(itemId) {
        const current = items.find((x)=>x.id === itemId);
        if (!current) return;
        await patchItem(itemId, current.status);
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-xl border bg-white p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm text-zinc-600",
                children: "در حال دریافت چک‌لیست…"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                lineNumber: 225,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
            lineNumber: 224,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl border bg-white p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-zinc-600",
                                        children: "پیشرفت QC:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                        lineNumber: 235,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-bold",
                                        children: [
                                            stats.progress,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                        lineNumber: 236,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-zinc-500",
                                        children: [
                                            "(ضروری: ",
                                            stats.required,
                                            " | پاس: ",
                                            stats.passed,
                                            " | رد: ",
                                            stats.failed,
                                            " | در انتظار:",
                                            " ",
                                            stats.pending,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                        lineNumber: 237,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-2 w-full overflow-hidden rounded-full bg-zinc-100",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-full rounded-full bg-indigo-600 transition-all",
                                    style: {
                                        width: `${stats.progress}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                    lineNumber: 245,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                lineNumber: 244,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                        lineNumber: 233,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: load,
                        className: "w-fit rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50",
                        children: "بروزرسانی"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                        lineNumber: 252,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
                children: error
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                lineNumber: 261,
                columnNumber: 9
            }, this),
            items.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 rounded-lg border bg-zinc-50 px-3 py-3 text-sm text-zinc-600",
                children: "برای این مرحله هنوز آیتم QC ثبت نشده است."
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                lineNumber: 267,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 space-y-3",
                children: items.map((it)=>{
                    const saving = savingId === it.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl border p-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2 md:flex-row md:items-start md:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-bold",
                                                        children: it.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                        lineNumber: 280,
                                                        columnNumber: 23
                                                    }, this),
                                                    it.isRequired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700",
                                                        children: "ضروری"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                        lineNumber: 283,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600",
                                                        children: "اختیاری"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: [
                                                            "rounded-full px-2 py-0.5 text-xs border",
                                                            it.status === "PASSED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : it.status === "FAILED" ? "bg-red-50 text-red-700 border-red-200" : "bg-zinc-50 text-zinc-700 border-zinc-200"
                                                        ].join(" "),
                                                        children: statusLabel(it.status)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                        lineNumber: 292,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                lineNumber: 279,
                                                columnNumber: 21
                                            }, this),
                                            it.description ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-sm text-zinc-600",
                                                children: it.description
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                lineNumber: 307,
                                                columnNumber: 23
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                        lineNumber: 278,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: saving,
                                                onClick: ()=>patchItem(it.id, "PASSED"),
                                                className: [
                                                    "rounded-lg border px-3 py-1.5 text-sm",
                                                    it.status === "PASSED" ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-zinc-50",
                                                    saving ? "opacity-60 cursor-not-allowed" : ""
                                                ].join(" "),
                                                children: "تایید"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                lineNumber: 312,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: saving,
                                                onClick: ()=>patchItem(it.id, "FAILED"),
                                                className: [
                                                    "rounded-lg border px-3 py-1.5 text-sm",
                                                    it.status === "FAILED" ? "bg-red-600 text-white border-red-600" : "hover:bg-zinc-50",
                                                    saving ? "opacity-60 cursor-not-allowed" : ""
                                                ].join(" "),
                                                children: "رد"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                lineNumber: 326,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: saving,
                                                onClick: ()=>patchItem(it.id, "PENDING"),
                                                className: [
                                                    "rounded-lg border px-3 py-1.5 text-sm",
                                                    it.status === "PENDING" ? "bg-zinc-900 text-white border-zinc-900" : "hover:bg-zinc-50",
                                                    saving ? "opacity-60 cursor-not-allowed" : ""
                                                ].join(" "),
                                                children: "در انتظار"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                lineNumber: 340,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                        lineNumber: 311,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                lineNumber: 277,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "mb-1 block text-xs text-zinc-600",
                                        children: "یادداشت"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                        lineNumber: 357,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-2 md:flex-row md:items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                value: notesDraft[it.id] ?? "",
                                                onChange: (e)=>setNotesDraft((p)=>({
                                                            ...p,
                                                            [it.id]: e.target.value
                                                        })),
                                                className: "w-full rounded-lg border px-3 py-2 text-sm",
                                                placeholder: "یادداشت (اختیاری)…"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                lineNumber: 360,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                disabled: saving,
                                                onClick: ()=>saveNoteOnly(it.id),
                                                className: [
                                                    "w-fit rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50",
                                                    saving ? "opacity-60 cursor-not-allowed" : ""
                                                ].join(" "),
                                                children: "ذخیره یادداشت"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                                lineNumber: 369,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                        lineNumber: 359,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                lineNumber: 356,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 text-xs text-zinc-500",
                                children: [
                                    "وضعیت: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold",
                                        children: it.status
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                        lineNumber: 383,
                                        columnNumber: 26
                                    }, this),
                                    it.checkedAt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            " ",
                                            "| آخرین بررسی:",
                                            " ",
                                            new Date(it.checkedAt).toLocaleString("fa-IR", {
                                                dateStyle: "medium",
                                                timeStyle: "short"
                                            })
                                        ]
                                    }, void 0, true) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                                lineNumber: 382,
                                columnNumber: 17
                            }, this)
                        ]
                    }, it.id, true, {
                        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                        lineNumber: 276,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
                lineNumber: 271,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/projects/[id]/StageChecklistClient.tsx",
        lineNumber: 231,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProjectContractorsCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function money(n) {
    return Number(n || 0).toLocaleString("fa-IR");
}
function PayStatusBadge({ status }) {
    const map = {
        PAID: {
            label: "تسویه",
            cls: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
        },
        PARTIAL: {
            label: "نیمه",
            cls: "bg-amber-500/15 text-amber-200 border-amber-500/30"
        },
        UNPAID: {
            label: "بدهکار",
            cls: "bg-rose-500/15 text-rose-200 border-rose-500/30"
        }
    };
    const m = map[status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center px-2 py-1 text-[11px] rounded-md border ${m.cls}`,
        children: m.label
    }, void 0, false, {
        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
        lineNumber: 35,
        columnNumber: 10
    }, this);
}
function WorkStatusBadge({ status }) {
    const map = {
        ACTIVE: {
            label: "فعال",
            cls: "bg-sky-500/15 text-sky-200 border-sky-500/30"
        },
        DONE: {
            label: "تمام",
            cls: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
        },
        CANCELLED: {
            label: "لغو",
            cls: "bg-zinc-500/15 text-zinc-200 border-zinc-500/30"
        }
    };
    const m = map[status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center px-2 py-1 text-[11px] rounded-md border ${m.cls}`,
        children: m.label
    }, void 0, false, {
        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
        lineNumber: 45,
        columnNumber: 10
    }, this);
}
function ProjectContractorsCard({ projectId }) {
    const [loadingContracts, setLoadingContracts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [contracts, setContracts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingContractors, setLoadingContractors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [contractors, setContractors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showAdd, setShowAdd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [q, setQ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [selectedContractorId, setSelectedContractorId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [agreedAmount, setAgreedAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [note, setNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [startDate, setStartDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(""); // yyyy-mm-dd
    const [endDate, setEndDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(""); // yyyy-mm-dd
    function parseAmount(v) {
        const n = Number(String(v).replace(/[,\s]/g, ""));
        return Number.isFinite(n) ? n : 0;
    }
    async function loadContracts() {
        setLoadingContracts(true);
        try {
            const r = await fetch(`/api/projects/${projectId}/contracts`, {
                cache: "no-store"
            });
            const data = await r.json();
            setContracts(data?.contracts ?? []);
        } finally{
            setLoadingContracts(false);
        }
    }
    async function loadContractors() {
        setLoadingContractors(true);
        try {
            // ✅ مهم: برای انتخاب پیمانکار فقط mode=select
            const r = await fetch(`/api/management/contractors?mode=select`, {
                cache: "no-store"
            });
            const data = await r.json();
            setContractors(Array.isArray(data) ? data : []);
        } finally{
            setLoadingContractors(false);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadContracts();
        loadContractors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        projectId
    ]);
    const contractorOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const s = q.trim();
        return contractors.map((c)=>({
                id: c.id,
                name: c.name
            })).filter((c)=>!s ? true : c.name.includes(s) || String(c.id).includes(s));
    }, [
        contractors,
        q
    ]);
    async function addContract() {
        if (!selectedContractorId) return alert("پیمانکار را انتخاب کن.");
        const amount = parseAmount(agreedAmount);
        if (amount <= 0) return alert("مبلغ قرارداد نامعتبر است.");
        const res = await fetch(`/api/projects/${projectId}/contracts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contractorId: Number(selectedContractorId),
                agreedAmount: amount,
                role: role || null,
                note: note || null,
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null,
                status: "ACTIVE"
            })
        });
        if (!res.ok) {
            const t = await res.text();
            return alert(t || "خطا در ثبت قرارداد");
        }
        setSelectedContractorId("");
        setAgreedAmount("");
        setRole("");
        setNote("");
        setStartDate("");
        setEndDate("");
        setShowAdd(false);
        await loadContracts();
    }
    async function updateContract(contractId, patch) {
        const res = await fetch(`/api/projects/${projectId}/contracts`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: contractId,
                ...patch
            })
        });
        if (!res.ok) {
            const t = await res.text();
            alert(t || "خطا در ویرایش قرارداد");
            return;
        }
        await loadContracts();
    }
    async function deleteContract(contractId) {
        if (!confirm("حذف این قرارداد؟")) return;
        const res = await fetch(`/api/projects/${projectId}/contracts`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: contractId
            })
        });
        if (!res.ok) {
            const t = await res.text();
            alert(t || "خطا در حذف قرارداد");
            return;
        }
        await loadContracts();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-slate-950/60 border border-white/10 rounded-xl p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm text-white",
                                children: "پیمانکاران پروژه"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-slate-400",
                                children: "پرداخت‌ها از خزانه پرداختی‌ها ثبت می‌شوند و با projectId جمع می‌گردند."
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowAdd((s)=>!s),
                                className: "px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white",
                                children: showAdd ? "بستن" : "+ افزودن پیمانکار"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: `/dashboard/treasury`,
                                className: "px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-white border border-white/10",
                                children: "خزانه / پرداختی‌ها"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 191,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                lineNumber: 175,
                columnNumber: 7
            }, this),
            showAdd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 rounded-xl border border-white/10 bg-slate-900/60 p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-5 gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                className: "md:col-span-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white",
                                placeholder: "جستجو پیمانکار…",
                                value: q,
                                onChange: (e)=>setQ(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "md:col-span-2 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white",
                                value: selectedContractorId,
                                onChange: (e)=>setSelectedContractorId(e.target.value ? Number(e.target.value) : ""),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: loadingContractors ? "در حال بارگذاری…" : "— انتخاب پیمانکار —"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                        lineNumber: 215,
                                        columnNumber: 15
                                    }, this),
                                    contractorOptions.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c.id,
                                            children: c.name
                                        }, c.id, false, {
                                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                            lineNumber: 219,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 210,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                className: "w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white",
                                placeholder: "مبلغ قرارداد",
                                value: agreedAmount,
                                onChange: (e)=>setAgreedAmount(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 225,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: addContract,
                                className: "w-full rounded-lg bg-purple-600 px-3 py-2 text-xs text-white",
                                children: "ثبت قرارداد"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                        lineNumber: 202,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-2 mt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                className: "w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white",
                                placeholder: "نقش (اختیاری)",
                                value: role,
                                onChange: (e)=>setRole(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 238,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "date",
                                className: "w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white",
                                value: startDate,
                                onChange: (e)=>setStartDate(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "date",
                                className: "w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white",
                                value: endDate,
                                onChange: (e)=>setEndDate(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 250,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                        lineNumber: 237,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        className: "mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white",
                        placeholder: "یادداشت (اختیاری)",
                        value: note,
                        onChange: (e)=>setNote(e.target.value),
                        rows: 2
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                        lineNumber: 258,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                lineNumber: 201,
                columnNumber: 9
            }, this),
            loadingContracts ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-slate-400",
                children: "در حال بارگذاری…"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                lineNumber: 269,
                columnNumber: 9
            }, this) : contracts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-slate-400",
                children: "هنوز پیمانکاری به پروژه اضافه نشده است."
            }, void 0, false, {
                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                lineNumber: 271,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                className: "w-full text-xs",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        className: "text-slate-300",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "text-right",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "py-2",
                                    children: "پیمانکار"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                    lineNumber: 276,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: "مبلغ قرارداد"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                    lineNumber: 277,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: "پرداختی"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                    lineNumber: 278,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: "مانده"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                    lineNumber: 279,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: "وضعیت پرداخت"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    children: "وضعیت کار"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                    lineNumber: 281,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "text-left",
                                    children: "عملیات"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                    lineNumber: 282,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                            lineNumber: 275,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                        lineNumber: 274,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        children: contracts.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "border-t border-white/5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "py-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-white",
                                            children: c.contractor.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                            lineNumber: 290,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                        lineNumber: 289,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: money(c.totalAmount)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                        lineNumber: 293,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "text-emerald-300",
                                        children: money(c.paidAmount)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                        lineNumber: 294,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "text-rose-300 font-semibold",
                                        children: money(c.remainingAmount)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                        lineNumber: 295,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PayStatusBadge, {
                                            status: c.status
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                            lineNumber: 298,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                        lineNumber: 297,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WorkStatusBadge, {
                                            status: c.contractStatus
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                            lineNumber: 302,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                        lineNumber: 301,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "py-2 text-left",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-end gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    className: "rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-white",
                                                    value: c.contractStatus,
                                                    onChange: (e)=>updateContract(c.id, {
                                                            status: e.target.value
                                                        }),
                                                    title: "وضعیت کار",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "ACTIVE",
                                                            children: "فعال"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "DONE",
                                                            children: "تمام"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                                            lineNumber: 314,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "CANCELLED",
                                                            children: "لغو"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                                            lineNumber: 315,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                                    lineNumber: 307,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "px-2 py-1 rounded-md border border-white/10 bg-rose-600/20 text-[11px] text-rose-200",
                                                    onClick: ()=>deleteContract(c.id),
                                                    title: "حذف",
                                                    children: "حذف"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                                    lineNumber: 318,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                            lineNumber: 306,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                        lineNumber: 305,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, c.id, true, {
                                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                                lineNumber: 288,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                        lineNumber: 286,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
                lineNumber: 273,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/projects/[id]/ui/ProjectContractorsCard.tsx",
        lineNumber: 174,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_dashboard_projects_%5Bid%5D_35be6fcc._.js.map