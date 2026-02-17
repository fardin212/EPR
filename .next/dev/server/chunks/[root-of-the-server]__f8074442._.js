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
"[project]/app/api/accounting/vouchers/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/accounting/vouchers/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const vouchers = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].accountingVoucher.findMany({
            orderBy: {
                date: "desc"
            },
            include: {
                project: true
            },
            take: 50
        });
        const items = vouchers.map((v)=>({
                id: v.id,
                date: v.date.toISOString(),
                refNo: v.refNo,
                type: v.type,
                projectName: v.project?.name ?? null,
                description: v.description,
                totalDebit: Number(v.totalDebit || 0),
                totalCredit: Number(v.totalCredit || 0)
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(items);
    } catch (e) {
        console.error("GET /api/accounting/vouchers error:", e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("خطا در خواندن اسناد حسابداری", {
            status: 500
        });
    }
}
async function POST(req) {
    try {
        const body = await req.json();
        const { date, type, description, items } = body;
        if (!date || !items || !Array.isArray(items) || items.length === 0) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("دادهٔ ارسالی معتبر نیست", {
                status: 400
            });
        }
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("تاریخ نامعتبر است", {
                status: 400
            });
        }
        // حساب‌ها را بر اساس کد پیدا می‌کنیم
        const codes = items.map((i)=>i.accountCode);
        const accounts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].accountingAccount.findMany({
            where: {
                code: {
                    in: codes
                }
            }
        });
        const accByCode = new Map(accounts.map((a)=>[
                a.code,
                a
            ]));
        for (const it of items){
            if (!accByCode.has(it.accountCode)) {
                return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](`کد حساب ${it.accountCode} پیدا نشد (اول حساب را بسازید).`, {
                    status: 400
                });
            }
        }
        // محاسبه جمع بدهکار / بستانکار و آماده‌سازی ردیف‌ها
        let totalDebit = 0;
        let totalCredit = 0;
        const voucherItemsData = items.map((it)=>{
            const debit = Number(it.debit || 0);
            const credit = Number(it.credit || 0);
            totalDebit += debit;
            totalCredit += credit;
            return {
                accountId: accByCode.get(it.accountCode).id,
                description: it.description ?? description ?? "",
                debit,
                credit
            };
        });
        // ایجاد سند و ردیف‌ها در یک تراکنش
        const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const refNo = await getNextRefNo(tx);
            const voucher = await tx.accountingVoucher.create({
                data: {
                    companyId: 1,
                    date: parsedDate,
                    refNo,
                    type: type || "GENERAL",
                    description: description ?? null,
                    totalDebit,
                    totalCredit
                }
            });
            await tx.accountingVoucherItem.createMany({
                data: voucherItemsData.map((row)=>({
                        ...row,
                        voucherId: voucher.id
                    }))
            });
            return voucher;
        });
        const result = {
            id: created.id,
            date: created.date.toISOString(),
            refNo: created.refNo,
            type: created.type,
            projectName: null,
            description: created.description,
            totalDebit: Number(created.totalDebit || 0),
            totalCredit: Number(created.totalCredit || 0)
        };
        // فرم AccountingPageClient منتظر همین ساختار است
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result, {
            status: 201
        });
    } catch (e) {
        console.error("POST /api/accounting/vouchers error:", e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("خطا در ثبت سند حسابداری", {
            status: 500
        });
    }
}
// گرفتن شماره سند بعدی (ساده، بر اساس آخرین refNo)
async function getNextRefNo(tx) {
    const last = await tx.accountingVoucher.findFirst({
        orderBy: {
            id: "desc"
        },
        select: {
            refNo: true
        }
    });
    const lastNum = last?.refNo ? parseInt(last.refNo, 10) || 0 : 0;
    const next = lastNum + 1;
    return String(next).padStart(5, "0");
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f8074442._.js.map