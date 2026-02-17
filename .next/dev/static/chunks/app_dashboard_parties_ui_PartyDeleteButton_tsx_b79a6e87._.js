(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/dashboard/parties/ui/PartyDeleteButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PartyDeleteButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function PartyDeleteButton({ id, name }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function onDelete() {
        const ok = confirm(`حذف طرف‌حساب «${name}»؟\nاین عملیات قابل بازگشت نیست.`);
        if (!ok) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/parties/${id}`, {
                method: "DELETE"
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                alert(data?.error || "حذف انجام نشد.");
                return;
            }
            router.refresh();
        } catch (e) {
            alert("خطا در ارتباط با سرور");
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onDelete,
        disabled: loading,
        className: [
            "h-9 px-3 rounded-xl text-sm border transition",
            "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
            "disabled:opacity-60 disabled:cursor-not-allowed"
        ].join(" "),
        title: "حذف",
        children: loading ? "..." : "حذف"
    }, void 0, false, {
        fileName: "[project]/app/dashboard/parties/ui/PartyDeleteButton.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_s(PartyDeleteButton, "OeGW3YQfIEwiDdtbkZtE38+y0P4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = PartyDeleteButton;
var _c;
__turbopack_context__.k.register(_c, "PartyDeleteButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_dashboard_parties_ui_PartyDeleteButton_tsx_b79a6e87._.js.map