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
"[project]/app/api/accounting/dashboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        // همه ردیف‌های اسناد به همراه حساب و خود سند
        const voucherItems = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].accountingVoucherItem.findMany({
            include: {
                account: true,
                voucher: true
            }
        });
        // آخرین چند سند برای نمایش در داشبورد
        const lastVouchersRaw = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].accountingVoucher.findMany({
            orderBy: {
                date: "desc"
            },
            take: 5
        });
        // آمار کلی پروژه و تعداد اسناد
        const [projectCount, vouchersCount] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.count(),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].accountingVoucher.count()
        ]);
        // محاسبه جمع درآمد/هزینه
        let totalIncome = 0;
        let totalExpense = 0;
        const monthlyMap = new Map();
        for (const it of voucherItems){
            const accType = it.account.type; // AccountingAccountType
            const v = it.voucher;
            const vDate = v?.date ?? null;
            const debit = Number(it.debit || 0);
            const credit = Number(it.credit || 0);
            // ماه به‌صورت "YYYY-MM"
            if (vDate) {
                const key = `${vDate.getFullYear()}-${String(vDate.getMonth() + 1).padStart(2, "0")}`;
                if (!monthlyMap.has(key)) {
                    monthlyMap.set(key, {
                        income: 0,
                        expense: 0
                    });
                }
            }
            if (accType === "REVENUE") {
                const val = credit - debit;
                totalIncome += val;
                if (vDate) {
                    const key = `${vDate.getFullYear()}-${String(vDate.getMonth() + 1).padStart(2, "0")}`;
                    const row = monthlyMap.get(key);
                    row.income += val;
                }
            } else if (accType === "EXPENSE") {
                const val = debit - credit;
                totalExpense += val;
                if (vDate) {
                    const key = `${vDate.getFullYear()}-${String(vDate.getMonth() + 1).padStart(2, "0")}`;
                    const row = monthlyMap.get(key);
                    row.expense += val;
                }
            }
        }
        // لیست آخرین اسناد برای جدول داشبورد
        const lastVouchers = lastVouchersRaw.map((v)=>({
                id: v.id,
                date: v.date.toISOString(),
                refNo: v.refNo,
                type: v.type,
                totalDebit: Number(v.totalDebit || 0),
                totalCredit: Number(v.totalCredit || 0)
            }));
        // تبدیل map ماهانه به آرایه مرتب‌شده
        const monthlyCashflow = Array.from(monthlyMap.entries()).sort((a, b)=>a[0].localeCompare(b[0])).map(([month, row])=>({
                month,
                income: row.income,
                expense: row.expense
            }));
        const payload = {
            totalIncome,
            totalExpense,
            projectCount,
            vouchersCount,
            lastVouchers,
            monthlyCashflow
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(payload);
    } catch (err) {
        console.error("Accounting dashboard error:", err);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("خطا در بارگذاری داشبورد حسابداری", {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fc0c7f14._.js.map