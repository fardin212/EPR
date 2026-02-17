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
"[project]/lib/auth.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// lib/auth.ts
__turbopack_context__.s([
    "getCurrentUser",
    ()=>getCurrentUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
// ✅ این export باعث میشه تمام route هایی که از "@/lib/auth" getMeServer میگیرن درست بشن
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authMe.ts [app-route] (ecmascript)");
;
;
;
async function getCurrentUser() {
    // در Next 16، cookies() async است
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie) {
        return null;
    }
    const userId = Number(sessionCookie.value);
    if (!userId || Number.isNaN(userId)) {
        return null;
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
        return null;
    }
    return user;
}
}),
"[project]/app/api/management/contractors/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/management/contractors/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript) <locals>");
;
;
;
const runtime = "nodejs";
const dynamic = "force-dynamic";
function pickCompanyId(user) {
    return Number(user?.companyId) || Number(user?.company?.id) || Number(user?.user?.companyId) || Number(user?.user?.company?.id);
}
async function GET(req) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCurrentUser"])();
        if (!me) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Unauthorized"
        }, {
            status: 401
        });
        const companyId = pickCompanyId(me);
        if (!companyId) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "companyId نامعتبر است."
        }, {
            status: 400
        });
        const { searchParams } = new URL(req.url);
        const mode = (searchParams.get("mode") || "").toLowerCase();
        // لیست پروفایل پیمانکارها + party
        const profiles = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].contractorProfile.findMany({
            where: {
                companyId
            },
            select: {
                id: true,
                partyId: true,
                party: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: [
                {
                    id: "desc"
                }
            ]
        });
        // ✅ حالت مخصوص dropdown
        if (mode === "select") {
            const selectRows = profiles.map((p)=>({
                    id: Number(p.id),
                    partyId: Number(p.partyId),
                    name: p.party?.name || `#${p.id}`
                }));
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(selectRows);
        }
        // ---------- گزارش کامل ----------
        // مجموع قراردادها و تعداد پروژه‌های پیمانکار
        const groupedContracts = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectContractor.groupBy({
            by: [
                "contractorId"
            ],
            where: {
                companyId
            },
            _sum: {
                agreedAmount: true
            },
            _count: {
                projectId: true
            }
        });
        const totalByContractor = new Map();
        const projectsCountByContractor = new Map();
        const contractorIds = new Set();
        const allProjectIds = new Set();
        for (const g of groupedContracts){
            const contractorId = Number(g.contractorId);
            contractorIds.add(contractorId);
            totalByContractor.set(contractorId, Number(g._sum?.agreedAmount ?? 0));
            projectsCountByContractor.set(contractorId, Number(g._count?.projectId ?? 0));
        }
        // برای گرفتن projectIdها (برای پرداخت‌ها) باید projectContractorها رو هم بخونیم
        if (contractorIds.size) {
            const pcs = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectContractor.findMany({
                where: {
                    companyId,
                    contractorId: {
                        in: Array.from(contractorIds)
                    }
                },
                select: {
                    projectId: true
                }
            });
            for (const pc of pcs)allProjectIds.add(Number(pc.projectId));
        }
        // مپ contractorId -> partyId / name
        const partyByContractor = new Map();
        const contractorName = new Map();
        for (const p of profiles){
            const cid = Number(p.id);
            partyByContractor.set(cid, Number(p.partyId));
            contractorName.set(cid, p.party?.name || `#${p.id}`);
        }
        const partyIds = Array.from(new Set(Array.from(partyByContractor.values()).filter(Boolean)));
        const projectIds = Array.from(allProjectIds);
        // پرداختی‌های مرتبط با پروژه‌ها (OUT) گروه‌بندی بر اساس partyId
        const paidMap = new Map(); // partyId => sum paid
        if (partyIds.length && projectIds.length) {
            const groups = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].treasuryPayment.groupBy({
                by: [
                    "partyId"
                ],
                where: {
                    companyId,
                    direction: "OUT",
                    partyId: {
                        in: partyIds
                    },
                    projectId: {
                        in: projectIds
                    }
                },
                _sum: {
                    amount: true
                }
            });
            for (const g of groups){
                const pid = Number(g.partyId);
                const paid = Number(g._sum?.amount ?? 0);
                if (pid) paidMap.set(pid, paid);
            }
        }
        // ساخت خروجی نهایی: فقط پیمانکارهایی که در contractorProfile هستند
        const result = profiles.map((p)=>{
            const contractorId = Number(p.id);
            const partyId = Number(p.partyId);
            const total = Number(totalByContractor.get(contractorId) ?? 0);
            const projectCount = Number(projectsCountByContractor.get(contractorId) ?? 0);
            const paid = Number(paidMap.get(partyId) ?? 0);
            const remaining = Math.max(0, total - paid);
            // سطح هشدار ساده و کاربردی
            const level = remaining <= 0 ? "OK" : paid > 0 ? "WARNING" : "CRITICAL";
            return {
                id: contractorId,
                partyId,
                name: contractorName.get(contractorId) || `#${contractorId}`,
                projectsCount: projectCount,
                totalAmount: total,
                paidAmount: paid,
                remainingAmount: remaining,
                level
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: e?.message || "خطای سرور"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5278073a._.js.map