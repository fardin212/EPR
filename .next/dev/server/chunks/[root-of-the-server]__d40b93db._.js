module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/db.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: [
        "query",
        "error",
        "warn"
    ]
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = prisma;
}
const __TURBOPACK__default__export__ = prisma;
}),
"[project]/app/api/treasury/balances/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/treasury/balances/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
const COMPANY_ID = 1;
function isTruthy(v) {
    return v === true || v === "true" || v === 1 || v === "1";
}
async function GET(req) {
    const { searchParams } = new URL(req.url);
    const scope = (searchParams.get("scope") || "accounts").toLowerCase();
    const includeCheques = isTruthy(searchParams.get("includeCheques"));
    // 1) مانده حساب‌های خزانه
    if (scope === "accounts") {
        // همه حساب‌های خزانه
        const accounts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].treasuryAccount.findMany({
            where: {
                companyId: COMPANY_ID,
                isActive: true
            },
            orderBy: {
                id: "asc"
            },
            select: {
                id: true,
                title: true,
                type: true,
                openingBalance: true
            }
        });
        // همه تراکنش‌های خزانه (اختیاری: حذف چک‌ها)
        const whereTx = {
            companyId: COMPANY_ID
        };
        if (!includeCheques) whereTx.method = {
            not: "CHEQUE"
        };
        const txs = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].treasuryTransaction.findMany({
            where: whereTx,
            select: {
                id: true,
                direction: true,
                amount: true,
                fromAccountId: true,
                toAccountId: true
            }
        });
        // محاسبه مانده: opening + IN(to) - OUT(from) + XFER(to) - XFER(from)
        const map = new Map();
        for (const a of accounts)map.set(a.id, Number(a.openingBalance || 0));
        for (const t of txs){
            const amt = Number(t.amount || 0);
            if (t.direction === "IN") {
                if (t.toAccountId) map.set(t.toAccountId, (map.get(t.toAccountId) || 0) + amt);
            } else if (t.direction === "OUT") {
                if (t.fromAccountId) map.set(t.fromAccountId, (map.get(t.fromAccountId) || 0) - amt);
            } else if (t.direction === "XFER") {
                if (t.fromAccountId) map.set(t.fromAccountId, (map.get(t.fromAccountId) || 0) - amt);
                if (t.toAccountId) map.set(t.toAccountId, (map.get(t.toAccountId) || 0) + amt);
            }
        }
        const items = accounts.map((a)=>({
                id: a.id,
                title: a.title,
                type: a.type,
                openingBalance: Number(a.openingBalance || 0),
                balance: map.get(a.id) || 0
            }));
        const total = items.reduce((s, x)=>s + x.balance, 0);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            scope: "accounts",
            includeCheques,
            total,
            items
        });
    }
    // 2) مانده طرف حساب‌ها (همان خروجی قبلی شما)
    if (scope === "parties") {
        const partyAcc = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].accountingAccount.findUnique({
            where: {
                code: "9000"
            }
        });
        if (!partyAcc) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("حساب 9000 (طرف حساب‌ها) یافت نشد", {
            status: 400
        });
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].accountingVoucherItem.findMany({
            where: {
                accountId: partyAcc.id,
                partyId: {
                    not: null
                }
            },
            include: {
                party: true
            }
        });
        const map = new Map();
        for (const r of rows){
            const pid = r.partyId;
            const cur = map.get(pid) || {
                partyId: pid,
                name: r.party?.name || "—",
                debit: 0,
                credit: 0
            };
            cur.debit += Number(r.debit || 0);
            cur.credit += Number(r.credit || 0);
            map.set(pid, cur);
        }
        const items = [
            ...map.values()
        ].map((x)=>({
                ...x,
                balance: x.debit - x.credit
            }));
        items.sort((a, b)=>Math.abs(b.balance) - Math.abs(a.balance));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            scope: "parties",
            items
        });
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("scope نامعتبر است (accounts | parties)", {
        status: 400
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d40b93db._.js.map