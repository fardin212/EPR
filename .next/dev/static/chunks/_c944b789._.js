(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/date.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toJalali",
    ()=>toJalali
]);
function toJalali(date, withTime = false) {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        dateStyle: "medium",
        ...withTime ? {
            timeStyle: "short"
        } : {}
    }).format(d);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/dashboard/accounting/AccountingPageClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AccountingPageClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$date$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/date.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const voucherTypeLabel = {
    GENERAL: "سند عمومی",
    PURCHASE: "خرید",
    SALE: "فروش",
    EXPENSE: "هزینه",
    INCOME: "درآمد",
    TRANSFER: "انتقال",
    OPENING: "افتتاحیه",
    ADJUSTMENT: "تعدیلات"
};
function formatCurrency(v) {
    return Intl.NumberFormat("fa-IR", {
        maximumFractionDigits: 0
    }).format(v || 0);
}
function isoDateOnly(iso) {
    // اگر "2025-12-23T..." بود -> "2025-12-23"
    if (!iso) return "";
    return iso.slice(0, 10);
}
function parseMoneyInput(s) {
    const cleaned = String(s || "").replace(/[,\s]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
}
function AccountingPageClient() {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("dashboard");
    const [dashLoading, setDashLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dashData, setDashData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [vouchersLoading, setVouchersLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [vouchers, setVouchers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [accountsLoading, setAccountsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [accounts, setAccounts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // -------------------------------
    // reload helpers
    // -------------------------------
    const reloadVouchers = async ()=>{
        setVouchersLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/accounting/vouchers", {
                cache: "no-store"
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error("Vouchers reload failed:", res.status, txt);
                setError("خطا در بارگذاری اسناد حسابداری");
                return;
            }
            const data = await res.json();
            setVouchers(data);
        } catch (e) {
            console.error("Vouchers reload error:", e);
            setError("خطای ارتباط با سرور در اسناد حسابداری");
        } finally{
            setVouchersLoading(false);
        }
    };
    // -------------------------------
    // load dashboard
    // -------------------------------
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AccountingPageClient.useEffect": ()=>{
            if (activeTab !== "dashboard") return;
            let cancelled = false;
            async function loadDashboard() {
                setDashLoading(true);
                setError(null);
                try {
                    const res = await fetch("/api/accounting/dashboard", {
                        cache: "no-store"
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        console.error("Dashboard load failed:", res.status, txt);
                        if (!cancelled) setError("خطا در بارگذاری داشبورد حسابداری");
                        return;
                    }
                    const data = await res.json();
                    if (!cancelled) setDashData(data);
                } catch (e) {
                    console.error("Dashboard load error:", e);
                    if (!cancelled) setError("خطای ارتباط با سرور در داشبورد");
                } finally{
                    if (!cancelled) setDashLoading(false);
                }
            }
            loadDashboard();
            return ({
                "AccountingPageClient.useEffect": ()=>{
                    cancelled = true;
                }
            })["AccountingPageClient.useEffect"];
        }
    }["AccountingPageClient.useEffect"], [
        activeTab
    ]);
    // -------------------------------
    // load vouchers
    // -------------------------------
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AccountingPageClient.useEffect": ()=>{
            if (activeTab !== "vouchers") return;
            let cancelled = false;
            async function loadVouchers() {
                setVouchersLoading(true);
                setError(null);
                try {
                    const res = await fetch("/api/accounting/vouchers", {
                        cache: "no-store"
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        console.error("Vouchers load failed:", res.status, txt);
                        if (!cancelled) setError("خطا در بارگذاری اسناد حسابداری");
                        return;
                    }
                    const data = await res.json();
                    if (!cancelled) setVouchers(data);
                } catch (e) {
                    console.error("Vouchers load error:", e);
                    if (!cancelled) setError("خطای ارتباط با سرور در اسناد حسابداری");
                } finally{
                    if (!cancelled) setVouchersLoading(false);
                }
            }
            loadVouchers();
            return ({
                "AccountingPageClient.useEffect": ()=>{
                    cancelled = true;
                }
            })["AccountingPageClient.useEffect"];
        }
    }["AccountingPageClient.useEffect"], [
        activeTab
    ]);
    // -------------------------------
    // load accounts
    // -------------------------------
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AccountingPageClient.useEffect": ()=>{
            if (activeTab !== "accounts") return;
            let cancelled = false;
            async function loadAccounts() {
                setAccountsLoading(true);
                setError(null);
                try {
                    const res = await fetch("/api/accounting/accounts", {
                        cache: "no-store"
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        console.error("Accounts load failed:", res.status, txt);
                        if (!cancelled) setError("خطا در بارگذاری سرفصل‌های حسابداری");
                        return;
                    }
                    const data = await res.json();
                    if (!cancelled) setAccounts(data);
                } catch (e) {
                    console.error("Accounts load error:", e);
                    if (!cancelled) setError("خطای ارتباط با سرور در سرفصل‌ها");
                } finally{
                    if (!cancelled) setAccountsLoading(false);
                }
            }
            loadAccounts();
            return ({
                "AccountingPageClient.useEffect": ()=>{
                    cancelled = true;
                }
            })["AccountingPageClient.useEffect"];
        }
    }["AccountingPageClient.useEffect"], [
        activeTab
    ]);
    // -------------------------------
    // create simple voucher (inline form)
    // -------------------------------
    const [createLoading, setCreateLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [createDate, setCreateDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [createType, setCreateType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("GENERAL");
    const [createDescription, setCreateDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [createAmount, setCreateAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const handleCreateSimpleVoucher = async ()=>{
        if (!createDate || !createAmount) {
            alert("تاریخ و مبلغ الزامی است");
            return;
        }
        const amount = Number(createAmount.replace(/,/g, ""));
        if (!amount || amount <= 0) {
            alert("مبلغ معتبر وارد کنید");
            return;
        }
        setCreateLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/accounting/vouchers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    date: createDate,
                    type: createType,
                    description: createDescription || `سند ساده مبلغ ${amount}`,
                    items: [
                        {
                            accountCode: "1000",
                            description: "بدهکار",
                            debit: amount,
                            credit: 0
                        },
                        {
                            accountCode: "2000",
                            description: "بستانکار",
                            debit: 0,
                            credit: amount
                        }
                    ]
                })
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error("Create voucher failed:", res.status, txt);
                alert("خطا در ثبت سند حسابداری");
                return;
            }
            const created = await res.json();
            // اگر همین تب فعاله، در لیست اضافه کن
            setVouchers((prev)=>[
                    created,
                    ...prev
                ]);
            setCreateDate("");
            setCreateDescription("");
            setCreateAmount("");
            setCreateType("GENERAL");
            alert("سند با موفقیت ثبت شد");
        } catch (e) {
            console.error("Create voucher error:", e);
            alert("خطای ارتباط در ثبت سند");
        } finally{
            setCreateLoading(false);
        }
    };
    // -------------------------------
    // edit / delete voucher
    // -------------------------------
    const [editOpen, setEditOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editId, setEditId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editRefNo, setEditRefNo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [editDate, setEditDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [editType, setEditType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("GENERAL");
    const [editDescription, setEditDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [editAmount, setEditAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(""); // optional
    const [editLoading, setEditLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const openEdit = (v)=>{
        setEditId(v.id);
        setEditRefNo(v.refNo);
        setEditDate(isoDateOnly(v.date));
        setEditType(v.type);
        setEditDescription(v.description || "");
        // برای سند ساده: totalDebit == totalCredit
        const amount = v.totalDebit || v.totalCredit || 0;
        setEditAmount(amount ? String(amount) : "");
        setEditOpen(true);
    };
    const closeEdit = ()=>{
        setEditOpen(false);
        setEditId(null);
        setEditRefNo("");
        setEditDate("");
        setEditType("GENERAL");
        setEditDescription("");
        setEditAmount("");
        setEditLoading(false);
    };
    const handleDeleteVoucher = async (v)=>{
        const ok = confirm(`حذف سند شماره ${v.refNo} ؟\nاین عملیات برگشت‌پذیر نیست.`);
        if (!ok) return;
        try {
            const res = await fetch(`/api/accounting/vouchers/${v.id}`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error("Delete voucher failed:", res.status, txt);
                alert("خطا در حذف سند");
                return;
            }
            // فوری از لیست حذف کن
            setVouchers((prev)=>prev.filter((x)=>x.id !== v.id));
            alert("سند حذف شد");
        } catch (e) {
            console.error("Delete voucher error:", e);
            alert("خطای ارتباط در حذف سند");
        }
    };
    const handleSaveEdit = async ()=>{
        if (!editId) return;
        if (!editDate) {
            alert("تاریخ الزامی است");
            return;
        }
        const totalAmount = editAmount ? parseMoneyInput(editAmount) : null;
        if (editAmount && totalAmount === null) {
            alert("مبلغ معتبر وارد کنید");
            return;
        }
        setEditLoading(true);
        try {
            const res = await fetch(`/api/accounting/vouchers/${editId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    date: editDate,
                    type: editType,
                    description: editDescription || null,
                    totalAmount
                })
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error("Edit voucher failed:", res.status, txt);
                alert("خطا در ویرایش سند");
                return;
            }
            // برای محاسبه‌های دقیق totalDebit/totalCredit: رفرش
            await reloadVouchers();
            closeEdit();
            alert("سند ویرایش شد");
        } catch (e) {
            console.error("Edit voucher error:", e);
            alert("خطای ارتباط در ویرایش سند");
        } finally{
            setEditLoading(false);
        }
    };
    const vouchersCountColSpan = 8;
    const voucherTableRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AccountingPageClient.useMemo[voucherTableRows]": ()=>vouchers
    }["AccountingPageClient.useMemo[voucherTableRows]"], [
        vouchers
    ]);
    // -------------------------------
    // UI
    // -------------------------------
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-lg font-semibold text-zinc-100",
                                children: "ماژول حسابداری"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 414,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-zinc-400 mt-1",
                                children: "مدیریت اسناد حسابداری، گزارش هزینه و درآمد پروژه‌ها و جریان نقدی."
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 415,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 413,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "inline-flex rounded-full bg-zinc-900 border border-zinc-700 p-1 text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setActiveTab("dashboard"),
                                className: `px-3 py-1 rounded-full ${activeTab === "dashboard" ? "bg-emerald-600 text-white" : "text-zinc-300 hover:bg-zinc-800"}`,
                                children: "داشبورد"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 421,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setActiveTab("vouchers"),
                                className: `px-3 py-1 rounded-full ${activeTab === "vouchers" ? "bg-emerald-600 text-white" : "text-zinc-300 hover:bg-zinc-800"}`,
                                children: "اسناد حسابداری"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 432,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setActiveTab("accounts"),
                                className: `px-3 py-1 rounded-full ${activeTab === "accounts" ? "bg-emerald-600 text-white" : "text-zinc-300 hover:bg-zinc-800"}`,
                                children: "سرفصل‌ها"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 443,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setActiveTab("reports"),
                                className: `px-3 py-1 rounded-full ${activeTab === "reports" ? "bg-emerald-600 text-white" : "text-zinc-300 hover:bg-zinc-800"}`,
                                children: "گزارش‌ها"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 454,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 420,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                lineNumber: 412,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-red-400 bg-red-900/20 border border-red-500/50 rounded-lg px-3 py-2",
                children: error
            }, void 0, false, {
                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                lineNumber: 469,
                columnNumber: 9
            }, this),
            activeTab === "dashboard" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-4",
                children: [
                    dashLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-zinc-400",
                        children: "در حال بارگذاری داشبورد..."
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 477,
                        columnNumber: 27
                    }, this),
                    dashData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid gap-3 md:grid-cols-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-zinc-400 mb-1",
                                                children: "کل درآمد ثبت‌شده"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 483,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-lg font-semibold text-emerald-400",
                                                children: [
                                                    formatCurrency(dashData.totalIncome),
                                                    " ریال"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 484,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 482,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-zinc-400 mb-1",
                                                children: "کل هزینه ثبت‌شده"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 489,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-lg font-semibold text-red-400",
                                                children: [
                                                    formatCurrency(dashData.totalExpense),
                                                    " ریال"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 490,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 488,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-zinc-400 mb-1",
                                                children: "تعداد پروژه‌های درگیر حسابداری"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 495,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-lg font-semibold text-zinc-100",
                                                children: dashData.projectCount
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 498,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 494,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-zinc-400 mb-1",
                                                children: "تعداد اسناد حسابداری ثبت‌شده"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 501,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-lg font-semibold text-zinc-100",
                                                children: dashData.vouchersCount
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 504,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 500,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 481,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-sm font-semibold text-zinc-100",
                                            children: "آخرین اسناد حسابداری"
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 511,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 510,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "overflow-x-auto",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "min-w-full text-xs text-zinc-200",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: "border-b border-zinc-700/60 text-zinc-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-2 text-right",
                                                                children: "شماره سند"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 517,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-2 text-right",
                                                                children: "تاریخ"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 518,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-2 text-right",
                                                                children: "نوع"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 519,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-2 text-right",
                                                                children: "بدهکار"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 520,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "py-2 text-right",
                                                                children: "بستانکار"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 521,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 516,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: [
                                                        dashData.lastVouchers.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: "border-b border-zinc-800/60",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-1",
                                                                        children: v.refNo
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                        lineNumber: 527,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-1",
                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$date$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toJalali"])(v.date)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                        lineNumber: 528,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-1",
                                                                        children: voucherTypeLabel[v.type]
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                        lineNumber: 529,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-1 text-emerald-400",
                                                                        children: formatCurrency(v.totalDebit)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                        lineNumber: 530,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "py-1 text-red-400",
                                                                        children: formatCurrency(v.totalCredit)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                        lineNumber: 531,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, v.id, true, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 526,
                                                                columnNumber: 25
                                                            }, this)),
                                                        dashData.lastVouchers.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-2 text-zinc-500",
                                                                colSpan: 5,
                                                                children: "هنوز سندی ثبت نشده است."
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 536,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                            lineNumber: 535,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 524,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 514,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 513,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 509,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                lineNumber: 476,
                columnNumber: 9
            }, this),
            activeTab === "vouchers" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold text-zinc-100 mb-3",
                                children: "ثبت سریع سند دوبل"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 555,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid gap-3 md:grid-cols-4 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-zinc-400",
                                                children: "تاریخ سند"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 559,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "date",
                                                className: "rounded-lg bg-zinc-950/60 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-100",
                                                value: createDate,
                                                onChange: (e)=>setCreateDate(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 560,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 558,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-zinc-400",
                                                children: "نوع سند"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 569,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                className: "rounded-lg bg-zinc-950/60 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-100",
                                                value: createType,
                                                onChange: (e)=>setCreateType(e.target.value),
                                                children: Object.entries(voucherTypeLabel).map(([k, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: k,
                                                        children: label
                                                    }, k, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 576,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 570,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 568,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-zinc-400",
                                                children: "مبلغ کل سند"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 584,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                className: "rounded-lg bg-zinc-950/60 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-100 ltr text-left",
                                                value: createAmount,
                                                onChange: (e)=>setCreateAmount(e.target.value),
                                                placeholder: "مثلاً 15000000"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 585,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 583,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-zinc-400",
                                                children: "توضیح"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 595,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                className: "rounded-lg bg-zinc-950/60 border border-zinc-700/60 px-2 py-1 text-xs text-zinc-100",
                                                value: createDescription,
                                                onChange: (e)=>setCreateDescription(e.target.value),
                                                placeholder: "مثلاً دریافت پیش‌پرداخت"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 596,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 594,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 557,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-end mt-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    disabled: createLoading,
                                    onClick: handleCreateSimpleVoucher,
                                    className: "px-4 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50",
                                    children: createLoading ? "در حال ثبت..." : "ثبت سند"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                    lineNumber: 607,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 606,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 554,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-semibold text-zinc-100",
                                        children: "لیست اسناد حسابداری"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 621,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            vouchersLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-zinc-400",
                                                children: "در حال بارگذاری اسناد..."
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 625,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: reloadVouchers,
                                                className: "px-3 py-1 rounded-lg text-[11px] bg-zinc-950/60 border border-zinc-700/60 hover:bg-zinc-800",
                                                children: "بروزرسانی"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 627,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 623,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 620,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "overflow-x-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "min-w-full text-xs text-zinc-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "border-b border-zinc-700/60 text-zinc-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "py-2 text-right",
                                                        children: "شماره سند"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 641,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "py-2 text-right",
                                                        children: "تاریخ"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 642,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "py-2 text-right",
                                                        children: "نوع"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 643,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "py-2 text-right",
                                                        children: "پروژه"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 644,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "py-2 text-right",
                                                        children: "شرح"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 645,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "py-2 text-right",
                                                        children: "بدهکار"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 646,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "py-2 text-right",
                                                        children: "بستانکار"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 647,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "py-2 text-right",
                                                        children: "عملیات"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 648,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 640,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 639,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: [
                                                voucherTableRows.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: "border-b border-zinc-800/60",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-1",
                                                                children: v.refNo
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 655,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-1",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$date$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toJalali"])(v.date)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 656,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-1",
                                                                children: voucherTypeLabel[v.type]
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 657,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-1",
                                                                children: v.projectName || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-zinc-500",
                                                                    children: "—"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                    lineNumber: 659,
                                                                    columnNumber: 43
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 658,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-1 max-w-xs truncate",
                                                                children: v.description || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-zinc-500",
                                                                    children: "—"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                    lineNumber: 662,
                                                                    columnNumber: 43
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 661,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-1 text-emerald-400",
                                                                children: formatCurrency(v.totalDebit)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 664,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-1 text-red-400",
                                                                children: formatCurrency(v.totalCredit)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 665,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "py-1",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>openEdit(v),
                                                                            className: "px-3 py-1 rounded-lg text-[11px] bg-zinc-950/60 border border-zinc-700/60 hover:bg-zinc-800",
                                                                            children: "ویرایش"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                            lineNumber: 669,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            onClick: ()=>handleDeleteVoucher(v),
                                                                            className: "px-3 py-1 rounded-lg text-[11px] bg-red-900/30 border border-red-700/50 hover:bg-red-900/50 text-red-200",
                                                                            children: "حذف"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                            lineNumber: 676,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                    lineNumber: 668,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                                lineNumber: 667,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, v.id, true, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 654,
                                                        columnNumber: 21
                                                    }, this)),
                                                vouchers.length === 0 && !vouchersLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-2 text-zinc-500",
                                                        colSpan: vouchersCountColSpan,
                                                        children: "هنوز هیچ سندی ثبت نشده است."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 690,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 689,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 652,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                    lineNumber: 638,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 637,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 619,
                        columnNumber: 11
                    }, this),
                    editOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-700/60 p-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-semibold text-zinc-100",
                                                    children: "ویرایش سند"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 706,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-zinc-400 mt-1",
                                                    children: [
                                                        "سند شماره: ",
                                                        editRefNo || "—"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 707,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 705,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: closeEdit,
                                            className: "text-zinc-300 hover:text-white text-sm",
                                            title: "بستن",
                                            children: "✕"
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 711,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                    lineNumber: 704,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid gap-3 md:grid-cols-2 text-xs",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-zinc-400",
                                                    children: "تاریخ"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 723,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "date",
                                                    className: "rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-2 py-2 text-xs text-zinc-100",
                                                    value: editDate,
                                                    onChange: (e)=>setEditDate(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 724,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 722,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-zinc-400",
                                                    children: "نوع سند"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 733,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    className: "rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-2 py-2 text-xs text-zinc-100",
                                                    value: editType,
                                                    onChange: (e)=>setEditType(e.target.value),
                                                    children: Object.entries(voucherTypeLabel).map(([k, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: k,
                                                            children: label
                                                        }, k, false, {
                                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                            lineNumber: 740,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 734,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 732,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1 md:col-span-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-zinc-400",
                                                    children: "شرح"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 748,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-2 py-2 text-xs text-zinc-100",
                                                    value: editDescription,
                                                    onChange: (e)=>setEditDescription(e.target.value),
                                                    placeholder: "شرح سند"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 749,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 747,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-1 md:col-span-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-zinc-400",
                                                    children: "مبلغ کل (اختیاری)"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 759,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-2 py-2 text-xs text-zinc-100 ltr text-left",
                                                    value: editAmount,
                                                    onChange: (e)=>setEditAmount(e.target.value),
                                                    placeholder: "مثلاً 15000000"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 760,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[11px] text-zinc-500",
                                                    children: "اگر سند ۲ آیتمی نباشد (سند پیچیده)، مبلغ تغییر نمی‌کند و فقط تاریخ/نوع/شرح اصلاح می‌شود."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                    lineNumber: 767,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 758,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                    lineNumber: 721,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end gap-2 mt-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: closeEdit,
                                            className: "px-4 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-200",
                                            children: "انصراف"
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 774,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            disabled: editLoading,
                                            onClick: handleSaveEdit,
                                            className: "px-4 py-2 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50",
                                            children: editLoading ? "در حال ذخیره..." : "ذخیره تغییرات"
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 781,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                    lineNumber: 773,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                            lineNumber: 703,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 702,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                lineNumber: 552,
                columnNumber: 9
            }, this),
            activeTab === "accounts" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold text-zinc-100",
                                children: "سرفصل‌های حسابداری"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 800,
                                columnNumber: 13
                            }, this),
                            accountsLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-zinc-400",
                                children: "در حال بارگذاری سرفصل‌ها..."
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 802,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 799,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "min-w-full text-xs text-zinc-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b border-zinc-700/60 text-zinc-400",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "py-2 text-right",
                                                children: "کد"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 810,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "py-2 text-right",
                                                children: "نام حساب"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 811,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "py-2 text-right",
                                                children: "نوع"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 812,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                        lineNumber: 809,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                    lineNumber: 808,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: [
                                        accounts.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "border-b border-zinc-800/60",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-1",
                                                        children: a.code
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 818,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-1",
                                                        children: a.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 819,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "py-1",
                                                        children: a.type
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                        lineNumber: 820,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, a.id, true, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 817,
                                                columnNumber: 19
                                            }, this)),
                                        accounts.length === 0 && !accountsLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "py-2 text-zinc-500",
                                                colSpan: 3,
                                                children: "هنوز سرفصلی ثبت نشده است."
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                                lineNumber: 825,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                            lineNumber: 824,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                    lineNumber: 815,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                            lineNumber: 807,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 806,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] text-zinc-500 mt-3",
                        children: "مدیریت ساخت/ویرایش سرفصل‌ها را بعداً در یک صفحهٔ تنظیمات حسابداری اضافه می‌کنیم."
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 834,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                lineNumber: 798,
                columnNumber: 9
            }, this),
            activeTab === "reports" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl bg-zinc-900/70 border border-zinc-700/60 p-4 text-xs text-zinc-300",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-zinc-100 mb-3",
                        children: "گزارش‌های حسابداری"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 843,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mb-2",
                        children: "در این نسخه، گزارش سود/زیان پروژه‌ها و روند هزینه/درآمد را از روی اسناد حسابداری تولید می‌کنیم. (API‌ آن را در گام بعدی اضافه می‌کنیم)"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 844,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "list-disc pr-4 space-y-1 text-zinc-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "گزارش هزینه و درآمد هر پروژه"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 849,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "گزارش جمع هزینه‌ها در بازهٔ زمانی"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 850,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: "نمودار سادهٔ جریان نقدی ماهانه"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                                lineNumber: 851,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                        lineNumber: 848,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
                lineNumber: 842,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/accounting/AccountingPageClient.tsx",
        lineNumber: 411,
        columnNumber: 5
    }, this);
}
_s(AccountingPageClient, "ObTO0mGKR+m8Nbo0DKcngKxO2ZM=");
_c = AccountingPageClient;
var _c;
__turbopack_context__.k.register(_c, "AccountingPageClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_c944b789._.js.map