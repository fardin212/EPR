(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/dashboard/management/reports/suppliers/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SuppliersReportPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function toNum(v) {
    if (v === null || v === undefined) return 0;
    const n = Number(String(v).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
}
function fmtMoney(v) {
    return toNum(v).toLocaleString("fa-IR");
}
function fmtDateFa(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(d);
}
function SuppliersReportPage() {
    _s();
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        total: 0,
        paid: 0,
        remaining: 0
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SuppliersReportPage.useEffect": ()=>{
            async function load() {
                setLoading(true);
                try {
                    const res = await fetch("/api/reports/suppliers", {
                        cache: "no-store"
                    });
                    const json = await res.json().catch({
                        "SuppliersReportPage.useEffect.load": ()=>({})
                    }["SuppliersReportPage.useEffect.load"]);
                    const items = Array.isArray(json?.items) ? json.items : [];
                    // نرمال‌سازی: هرچی اومد رو عددی کن تا null / string ترکوندن نکنه
                    const normalized = items.map({
                        "SuppliersReportPage.useEffect.load.normalized": (r, idx)=>({
                                id: Number(r?.id ?? idx + 1),
                                supplier: String(r?.supplier ?? "—"),
                                project: String(r?.project ?? "—"),
                                totalAmount: r?.totalAmount ?? null,
                                paidAmount: r?.paidAmount ?? null,
                                remainingAmount: r?.remainingAmount ?? null,
                                date: r?.date ?? null
                            })
                    }["SuppliersReportPage.useEffect.load.normalized"]);
                    setRows(normalized);
                    setSummary({
                        total: toNum(json?.summary?.total),
                        paid: toNum(json?.summary?.paid),
                        remaining: toNum(json?.summary?.remaining)
                    });
                } finally{
                    setLoading(false);
                }
            }
            load();
        }
    }["SuppliersReportPage.useEffect"], []);
    const computedSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SuppliersReportPage.useMemo[computedSummary]": ()=>{
            // اگر summary از API نیومده/صفر بود، از روی ردیف‌ها محاسبه کن
            if (summary.total || summary.paid || summary.remaining) return summary;
            const total = rows.reduce({
                "SuppliersReportPage.useMemo[computedSummary].total": (a, r)=>a + toNum(r.totalAmount)
            }["SuppliersReportPage.useMemo[computedSummary].total"], 0);
            const paid = rows.reduce({
                "SuppliersReportPage.useMemo[computedSummary].paid": (a, r)=>a + toNum(r.paidAmount)
            }["SuppliersReportPage.useMemo[computedSummary].paid"], 0);
            const remaining = rows.reduce({
                "SuppliersReportPage.useMemo[computedSummary].remaining": (a, r)=>a + toNum(r.remainingAmount)
            }["SuppliersReportPage.useMemo[computedSummary].remaining"], 0);
            return {
                total,
                paid,
                remaining
            };
        }
    }["SuppliersReportPage.useMemo[computedSummary]"], [
        rows,
        summary
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-xl font-bold",
                children: "گزارش خرید و بدهی تأمین‌کنندگان"
            }, void 0, false, {
                fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryCard, {
                        title: "جمع کل خرید",
                        value: computedSummary.total
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryCard, {
                        title: "پرداخت‌شده",
                        value: computedSummary.paid,
                        color: "green"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryCard, {
                        title: "مانده بدهی",
                        value: computedSummary.remaining,
                        color: "red"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border bg-white overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-50 text-gray-600",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-right",
                                        children: "تاریخ"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                        lineNumber: 101,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-right",
                                        children: "تأمین‌کننده"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                        lineNumber: 102,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-right",
                                        children: "پروژه"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-right",
                                        children: "مبلغ خرید"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                        lineNumber: 104,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-right",
                                        children: "پرداخت‌شده"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                        lineNumber: 105,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-3 text-right",
                                        children: "بدهی"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                            lineNumber: 99,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 6,
                                    className: "p-6 text-center text-gray-400",
                                    children: "در حال بارگذاری..."
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                    lineNumber: 112,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                lineNumber: 111,
                                columnNumber: 15
                            }, this) : rows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 6,
                                    className: "p-6 text-center text-gray-400",
                                    children: "خریدی ثبت نشده است"
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                    lineNumber: 118,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                lineNumber: 117,
                                columnNumber: 15
                            }, this) : rows.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-t",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: fmtDateFa(r.date)
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                            lineNumber: 125,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 font-medium",
                                            children: r.supplier
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                            lineNumber: 126,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: r.project
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                            lineNumber: 127,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: fmtMoney(r.totalAmount)
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                            lineNumber: 128,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 text-green-600",
                                            children: fmtMoney(r.paidAmount)
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                            lineNumber: 129,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 text-red-600 font-semibold",
                                            children: fmtMoney(r.remainingAmount)
                                        }, void 0, false, {
                                            fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                            lineNumber: 130,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, r.id, true, {
                                    fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                                    lineNumber: 124,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
_s(SuppliersReportPage, "EBYB6e6p6maS3pBPEgH6DqlSVfA=");
_c = SuppliersReportPage;
function SummaryCard({ title, value, color = "gray" }) {
    const colorMap = {
        gray: "text-gray-800",
        green: "text-green-600",
        red: "text-red-600"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg border bg-white p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm text-gray-500",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `text-2xl font-bold ${colorMap[color]}`,
                children: [
                    toNum(value).toLocaleString("fa-IR"),
                    " تومان"
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/management/reports/suppliers/page.tsx",
        lineNumber: 157,
        columnNumber: 5
    }, this);
}
_c1 = SummaryCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "SuppliersReportPage");
__turbopack_context__.k.register(_c1, "SummaryCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_dashboard_management_reports_suppliers_page_tsx_0c754491._.js.map