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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/adminGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/adminGuard.ts
__turbopack_context__.s([
    "requireAdmin",
    ()=>requireAdmin,
    "requireRole",
    ()=>requireRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-route] (ecmascript)");
;
;
async function getBaseUrl() {
    // ✅ Next 16: headers() is Promise
    const h = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") || "http";
    if (!host) return "http://localhost:3000";
    return `${proto}://${host}`;
}
async function fetchMe() {
    const base = await getBaseUrl();
    // ✅ Next 16: cookies() is Promise
    const c = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const res = await fetch(`${base}/api/auth/me`, {
        method: "GET",
        cache: "no-store",
        headers: {
            // انتقال کوکی‌ها به API برای تشخیص لاگین
            cookie: c.toString()
        }
    });
    if (!res.ok) return {};
    return await res.json();
}
async function requireAdmin() {
    const me = await fetchMe();
    if (!me.user) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])("/login");
    if (me.user.role !== "ADMIN") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])("/dashboard");
    return me.user;
}
async function requireRole(roles) {
    const me = await fetchMe();
    if (!me.user) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])("/login");
    if (!roles.includes(me.user.role)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redirect"])("/dashboard");
    return me.user;
}
}),
"[project]/app/api/accounting/vouchers/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/adminGuard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
const ALLOWED_TYPES = [
    "GENERAL",
    "PURCHASE",
    "SALE",
    "EXPENSE",
    "INCOME",
    "TRANSFER",
    "OPENING",
    "ADJUSTMENT"
];
function bad(msg, status = 400) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: msg
    }, {
        status
    });
}
function parseId(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
}
function parseISODateOnly(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}
function parseAmount(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
}
async function getParams(ctx) {
    const p = ctx.params;
    return typeof p?.then === "function" ? await p : p;
}
async function PATCH(req, ctx) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const { id } = await getParams(ctx);
    const voucherId = parseId(id);
    if (!voucherId) return bad("شناسه سند نامعتبر است");
    const body = await req.json().catch(()=>null);
    if (!body) return bad("بدنه درخواست نامعتبر است");
    const dateStr = String(body.date || "").trim();
    const typeStr = String(body.type || "").trim();
    const description = body.description === null || body.description === undefined ? null : String(body.description).trim();
    const date = parseISODateOnly(dateStr);
    if (!date) return bad("تاریخ نامعتبر است (فرمت صحیح: YYYY-MM-DD)");
    if (!ALLOWED_TYPES.includes(typeStr)) return bad("نوع سند نامعتبر است");
    const type = typeStr;
    const totalAmount = parseAmount(body.totalAmount);
    if (body.totalAmount !== null && body.totalAmount !== undefined && body.totalAmount !== "" && totalAmount === null) {
        return bad("مبلغ نامعتبر است");
    }
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].accountingVoucher.findUnique({
        where: {
            id: voucherId
        },
        include: {
            items: true
        }
    });
    if (!existing) return bad("سند یافت نشد", 404);
    const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        const v = await tx.accountingVoucher.update({
            where: {
                id: voucherId
            },
            data: {
                date,
                type,
                description
            },
            include: {
                items: true
            }
        });
        // اگر totalAmount ارسال شد و سند دقیقاً ۲ آیتم دارد، بدهکار/بستانکار را تنظیم کن
        if (totalAmount !== null) {
            const items = v.items ?? [];
            if (items.length === 2) {
                const [a, b] = items;
                const aDebit = Number(a.debit || 0);
                const aCredit = Number(a.credit || 0);
                const aIsDebit = aDebit >= aCredit;
                const debitItemId = aIsDebit ? a.id : b.id;
                const creditItemId = aIsDebit ? b.id : a.id;
                await tx.accountingVoucherItem.update({
                    where: {
                        id: debitItemId
                    },
                    data: {
                        debit: totalAmount,
                        credit: 0
                    }
                });
                await tx.accountingVoucherItem.update({
                    where: {
                        id: creditItemId
                    },
                    data: {
                        debit: 0,
                        credit: totalAmount
                    }
                });
                // (اختیاری ولی خوب) آپدیت جمع بدهکار/بستانکار روی خود سند
                await tx.accountingVoucher.update({
                    where: {
                        id: voucherId
                    },
                    data: {
                        totalDebit: totalAmount,
                        totalCredit: totalAmount
                    }
                });
            }
        }
        return v;
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        voucher: updated
    });
}
async function DELETE(_req, ctx) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const { id } = await getParams(ctx);
    const voucherId = parseId(id);
    if (!voucherId) return bad("شناسه سند نامعتبر است");
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        // ✅ اول لینک خزانه به این سند را پاک کن (تا بن‌بست ایجاد نشود)
        // (اگر اسم فیلد دقیقاً accountingVoucherId است، درست است)
        await tx.treasuryTransaction.updateMany({
            where: {
                accountingVoucherId: voucherId
            },
            data: {
                accountingVoucherId: null
            }
        });
        // ✅ سپس آیتم‌ها و خود سند
        await tx.accountingVoucherItem.deleteMany({
            where: {
                voucherId
            }
        });
        await tx.accountingVoucher.delete({
            where: {
                id: voucherId
            }
        });
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5e7afac1._.js.map