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
"[project]/lib/authMe.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/authMe.ts
__turbopack_context__.s([
    "getMeServer",
    ()=>getMeServer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function getMeServer() {
    // در Next 16 cookies() async است
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie?.value) {
        throw new Error("دسترسی غیرمجاز: لطفاً وارد شوید");
    }
    // در پروژه شما session = userId (عددی) است
    const userId = Number(sessionCookie.value);
    if (!Number.isFinite(userId) || userId <= 0) {
        throw new Error("دسترسی غیرمجاز: لطفاً وارد شوید");
    }
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        },
        include: {
            company: true
        }
    });
    if (!user || !user.isActive) {
        throw new Error("دسترسی غیرمجاز: لطفاً وارد شوید");
    }
    const companyId = user.companyId ?? user.company?.id;
    if (!companyId) {
        throw new Error("companyId برای کاربر پیدا نشد.");
    }
    // خروجی سازگار با بقیه APIها
    return {
        id: user.id,
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        role: user.role ?? undefined,
        companyId,
        user,
        company: user.company
    };
}
}),
"[project]/lib/accountingPeriodLock.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/accountingPeriodLock.ts
__turbopack_context__.s([
    "assertNotLocked",
    ()=>assertNotLocked
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
async function assertNotLocked(...args) {
    // پشتیبانی از چند امضای مختلف (برای سازگاری با کدهای قبلی)
    let companyId = null;
    let at = new Date();
    if (typeof args[0] === "number") {
        companyId = args[0];
        if (args[1]) at = new Date(args[1]);
    } else if (args[0] && typeof args[0] === "object") {
        companyId = Number(args[0].companyId || args[0].company?.id || args[0]?.me?.companyId || 0) || null;
        if (args[0].at || args[0].date) at = new Date(args[0].at || args[0].date);
    }
    if (!companyId) return;
    // جدول‌های محتمل (با توجه به اینکه شما route جدا برای period-locks دارید)
    const candidates = [
        "AccountingPeriodLock",
        "AccountingPeriodLocks",
        "PeriodLock",
        "PeriodLocks"
    ];
    // پیدا کردن جدول موجود
    const tables = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN (${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$join(candidates)})
  `;
    const table = tables?.[0]?.table_name;
    if (!table) return; // جدول ندارید => قفل هم ندارید
    // ستون‌های جدول را می‌خوانیم تا query را دقیق بسازیم
    const cols = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ${table}
  `;
    const colset = new Set((cols || []).map((c)=>c.column_name));
    const startCol = [
        "startDate",
        "fromDate",
        "from",
        "dateFrom",
        "start"
    ].find((c)=>colset.has(c)) || null;
    const endCol = [
        "endDate",
        "toDate",
        "to",
        "dateTo",
        "end"
    ].find((c)=>colset.has(c)) || null;
    // وضعیت قفل
    const lockCol = [
        "isLocked",
        "locked"
    ].find((c)=>colset.has(c)) || (colset.has("status") ? "status" : null);
    if (!startCol || !endCol || !lockCol) return; // ساختار نامشخص => اجازه می‌دهیم
    // شرط قفل
    let lockPredicate = "";
    if (lockCol === "status") lockPredicate = "`status` = 'LOCKED'";
    else lockPredicate = `\`${lockCol}\` = 1`;
    // ممکن است ستون companyId نام متفاوت داشته باشد
    const companyCol = [
        "companyId",
        "company_id"
    ].find((c)=>colset.has(c)) || null;
    if (!companyCol) return;
    const sql = `
    SELECT 1
    FROM \`${table}\`
    WHERE \`${companyCol}\` = ?
      AND ${lockPredicate}
      AND ? BETWEEN \`${startCol}\` AND \`${endCol}\`
    LIMIT 1
  `;
    try {
        const hit = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(sql, Number(companyId), at);
        if (hit?.length) {
            throw new Error("این دوره حسابداری قفل است و امکان ثبت/ویرایش پرداخت وجود ندارد.");
        }
    } catch (e) {
        // اگر جدول/ستون‌ها استاندارد نبود و query خطا داد، پروژه نباید بخوابد.
        // ولی اگر ارور خودمان بود، باید پاس داده شود.
        if (String(e?.message || "").includes("دوره حسابداری قفل است")) throw e;
        return;
    }
}
}),
"[project]/app/api/treasury/payments/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "PUT",
    ()=>PUT,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authMe.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$accountingPeriodLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/accountingPeriodLock.ts [app-route] (ecmascript)");
;
;
;
;
const runtime = "nodejs";
const dynamic = "force-dynamic";
function mustInt(v, name = "id") {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error(`${name} نامعتبر است.`);
    return n;
}
function parseDate(v) {
    const d = v ? new Date(v) : null;
    if (d && Number.isNaN(d.getTime())) return null;
    return d;
}
async function getParams(ctx) {
    const p = ctx.params;
    return typeof p?.then === "function" ? await p : p;
}
async function PUT(req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        if (!me) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Unauthorized", {
            status: 401
        });
        const companyId = Number(me.companyId || me.company?.id || 0);
        if (!companyId) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Company not found", {
            status: 400
        });
        const { id } = await getParams(ctx);
        const txId = mustInt(id, "id");
        const body = await req.json().catch(()=>({}));
        const date = parseDate(body?.date) ?? new Date();
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$accountingPeriodLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertNotLocked"])(tx, companyId, date);
            await tx.treasuryTransaction.update({
                where: {
                    id: txId
                },
                data: {
                    companyId,
                    date,
                    direction: body.direction,
                    method: body.method,
                    amount: body.amount,
                    fromAccountId: body.fromAccountId ?? null,
                    toAccountId: body.toAccountId ?? null,
                    partyId: body.partyId ?? null,
                    projectId: body.projectId ?? null,
                    note: body.note ?? body.description ?? null,
                    trackingNo: body.trackingNo ?? null,
                    refNo: body.refNo ?? null
                }
            });
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (e) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](e?.message || "Error", {
            status: 500
        });
    }
}
async function DELETE(_req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        if (!me) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Unauthorized", {
            status: 401
        });
        const companyId = Number(me.companyId || me.company?.id || 0);
        if (!companyId) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Company not found", {
            status: 400
        });
        const { id } = await getParams(ctx);
        const txId = mustInt(id, "id");
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const row = await tx.treasuryTransaction.findUnique({
                where: {
                    id: txId
                },
                select: {
                    id: true,
                    companyId: true,
                    date: true,
                    accountingVoucherId: true
                }
            });
            if (!row || row.companyId !== companyId) throw new Error("تراکنش یافت نشد.");
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$accountingPeriodLock$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertNotLocked"])(tx, companyId, row.date);
            // ✅ اگر به سند وصل است، اول چک کن سند واقعاً وجود دارد یا نه
            if (row.accountingVoucherId) {
                const v = await tx.accountingVoucher.findFirst({
                    where: {
                        id: row.accountingVoucherId,
                        companyId
                    },
                    select: {
                        id: true
                    }
                });
                // ✅ سند حذف شده/وجود ندارد → لینک خراب را پاک کن و ادامه بده
                if (!v) {
                    await tx.treasuryTransaction.update({
                        where: {
                            id: row.id
                        },
                        data: {
                            accountingVoucherId: null
                        }
                    });
                } else {
                    // ❌ سند واقعاً وجود دارد → حذف ممنوع (امن)
                    throw new Error("این تراکنش هنوز سند حسابداری دارد. ابتدا سند را حذف/ابطال کن.");
                }
            }
            await tx.treasuryTransaction.delete({
                where: {
                    id: txId
                }
            });
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (e) {
        // ✅ برای خطاهای منطقی بهتره 400 بدهیم نه 500 (تا UI هم درست پیام بده)
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](e?.message || "Error", {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__710ecc8e._.js.map