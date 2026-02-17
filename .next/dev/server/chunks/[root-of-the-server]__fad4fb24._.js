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
"[project]/app/api/projects/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/projects/[id]/route.ts
__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authMe.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
const dynamic = "force-dynamic";
/* ===================== Utils ===================== */ async function getParams(ctx) {
    const p = ctx.params;
    return typeof p?.then === "function" ? await p : p;
}
function mustInt(v, name = "id") {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
        throw new Error(`${name} نامعتبر است.`);
    }
    return n;
}
function pickCompanyId(me) {
    return Number(me?.companyId) || Number(me?.company?.id) || Number(me?.user?.companyId) || Number(me?.user?.company?.id) || 0;
}
/**
 * مشتری/طرف حساب از جدول Party می‌آید.
 * این تابع فقط برای نمایش نام استفاده می‌شود و چیزی را در Project ذخیره نمی‌کند.
 */ async function resolveCustomerName(companyId, customerId) {
    const party = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.findFirst({
        where: {
            id: customerId,
            companyId
        },
        select: {
            name: true
        }
    });
    return party?.name ?? null;
}
async function GET(req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = pickCompanyId(me);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "UNAUTHORIZED"
            }, {
                status: 401
            });
        }
        const { id } = await getParams(ctx);
        const projectId = mustInt(id, "شناسه پروژه");
        const url = new URL(req.url);
        const include = (url.searchParams.get("include") || "").trim(); // "qc"
        // ❌ customerName در Prisma Schema وجود ندارد => حذف شد
        const project = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
            where: {
                id: projectId,
                companyId,
                isDeleted: false,
                deletedAt: null
            },
            select: {
                id: true,
                companyId: true,
                title: true,
                type: true,
                projectTypeId: true,
                size: true,
                code: true,
                name: true,
                description: true,
                startDate: true,
                endDate: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                customerId: true,
                bomTemplateId: true,
                specFrame: true,
                specWalls: true,
                specInterior: true,
                specMEP: true,
                specLogistic: true,
                // ✅ برای نمایش نام مشتری (اختیاری ولی بهتر از query جدا)
                customerParty: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        if (!project) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "پروژه پیدا نشد."
            }, {
                status: 404
            });
        }
        // ✅ customerName فقط برای خروجی API محاسبه می‌شود
        const customerNameResolved = project.customerParty?.name ?? (project.customerId ? await resolveCustomerName(companyId, project.customerId) : null);
        let projectType = null;
        if (project.projectTypeId) {
            projectType = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectType.findFirst({
                where: {
                    id: project.projectTypeId
                },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true
                }
            });
        }
        // ===== QC Summary (Always) =====
        const qcBase = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectStageChecklistItem.findMany({
            where: {
                stage: {
                    projectId: project.id
                }
            },
            select: {
                isRequired: true,
                status: true
            }
        });
        let required = 0, passed = 0, failed = 0, pending = 0;
        for (const it of qcBase){
            if (!it.isRequired) continue;
            required++;
            if (it.status === "PASSED") passed++;
            else if (it.status === "FAILED") failed++;
            else pending++;
        }
        const progress = required > 0 ? Math.round(passed / required * 100) : 0;
        const qcSummary = {
            required,
            passed,
            failed,
            pending,
            progress
        };
        // ===== include=qc =====
        if (include === "qc") {
            const stages = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectStage.findMany({
                where: {
                    projectId: project.id
                },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    startedAt: true,
                    finishedAt: true,
                    note: true,
                    checklist: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            isRequired: true,
                            status: true,
                            checkedAt: true,
                            checkedById: true,
                            note: true,
                            checkedBy: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        },
                        orderBy: {
                            id: "asc"
                        }
                    }
                },
                orderBy: {
                    id: "asc"
                }
            });
            const qcStages = stages.map((s)=>{
                let r = 0, p = 0, f = 0, pn = 0;
                for (const it of s.checklist){
                    if (!it.isRequired) continue;
                    r++;
                    if (it.status === "PASSED") p++;
                    else if (it.status === "FAILED") f++;
                    else pn++;
                }
                const prog = r > 0 ? Math.round(p / r * 100) : 0;
                return {
                    ...s,
                    qcSummary: {
                        required: r,
                        passed: p,
                        failed: f,
                        pending: pn,
                        progress: prog
                    }
                };
            });
            // ✅ customerParty را هم می‌توانی نگه داری یا حذف کنی (اینجا نگه داشتیم)
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ...project,
                customerName: customerNameResolved,
                projectType,
                qcSummary,
                qcStages
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ...project,
            customerName: customerNameResolved,
            projectType,
            qcSummary
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err?.message || "خطا در دریافت پروژه"
        }, {
            status: 400
        });
    }
}
async function PATCH(req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = pickCompanyId(me);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "UNAUTHORIZED"
            }, {
                status: 401
            });
        }
        const { id } = await getParams(ctx);
        const projectId = mustInt(id, "شناسه پروژه");
        const body = await req.json();
        const data = {};
        const allow = [
            "title",
            "type",
            "projectTypeId",
            "size",
            "name",
            "code",
            "description",
            "startDate",
            "endDate",
            "status",
            "customerId",
            "bomTemplateId",
            "specFrame",
            "specWalls",
            "specInterior",
            "specMEP",
            "specLogistic"
        ];
        for (const k of allow){
            if (Object.prototype.hasOwnProperty.call(body, k)) data[k] = body[k];
        }
        if (typeof data.startDate === "string" && data.startDate) data.startDate = new Date(data.startDate);
        if (typeof data.endDate === "string" && data.endDate) data.endDate = new Date(data.endDate);
        // ✅ فقط customerId را validate می‌کنیم. customerName دیگر ذخیره نمی‌شود.
        if (typeof data.customerId !== "undefined" && data.customerId !== null) {
            const cid = mustInt(data.customerId, "شناسه مشتری");
            data.customerId = cid;
            // ✅ اختیاری: اطمینان از وجود Party
            const exists = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.findFirst({
                where: {
                    id: cid,
                    companyId
                },
                select: {
                    id: true
                }
            });
            if (!exists) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "مشتری/طرف حساب یافت نشد."
                }, {
                    status: 400
                });
            }
        }
        const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.updateMany({
            where: {
                id: projectId,
                companyId,
                isDeleted: false,
                deletedAt: null
            },
            data
        });
        if (!updated.count) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "پروژه پیدا نشد."
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err?.message || "خطا در ویرایش پروژه"
        }, {
            status: 400
        });
    }
}
async function DELETE(_req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = pickCompanyId(me);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "UNAUTHORIZED"
            }, {
                status: 401
            });
        }
        const { id } = await getParams(ctx);
        const projectId = mustInt(id, "شناسه پروژه");
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.updateMany({
            where: {
                id: projectId,
                companyId,
                isDeleted: false,
                deletedAt: null
            },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        if (!res.count) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "پروژه پیدا نشد."
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err?.message || "خطا در حذف پروژه"
        }, {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fad4fb24._.js.map