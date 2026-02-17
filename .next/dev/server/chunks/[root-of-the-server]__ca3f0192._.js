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
"[project]/app/api/projects/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/projects/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript) <locals>"); // همان فایل auth خودت
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
;
;
;
function mustInt(v, name = "id") {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
        throw new Error(`${name} نامعتبر است.`);
    }
    return n;
}
function isUniqueConstraintError(e) {
    return e?.code === "P2002" || String(e?.message || "").includes("Unique constraint");
}
// ===== QC apply helpers (همان چیزی که داشتی) =====
const STAGE_DEFS = [
    "طراحی",
    "برش",
    "اسکلت",
    "دیوار",
    "سقف",
    "برق",
    "لوله",
    "کف",
    "رنگ",
    "تحویل"
];
async function applyQcTemplateForProject(tx, projectId, projectTypeId) {
    if (!projectTypeId) return;
    const template = await tx.qcTemplate.findFirst({
        where: {
            projectTypeId
        },
        include: {
            items: {
                orderBy: [
                    {
                        stageOrder: "asc"
                    },
                    {
                        id: "asc"
                    }
                ]
            }
        }
    });
    if (!template) return;
    const stages = await tx.projectStage.findMany({
        where: {
            projectId
        },
        orderBy: {
            id: "asc"
        },
        select: {
            id: true,
            name: true
        }
    });
    const checklistData = [];
    for (const item of template.items){
        let targetStage = null;
        if (item.stageOrder && item.stageOrder > 0) {
            const idx = item.stageOrder - 1;
            if (idx >= 0 && idx < stages.length) targetStage = stages[idx];
        }
        if (!targetStage) {
            targetStage = stages.find((s)=>s.name === item.stageName) || null;
        }
        if (!targetStage) continue;
        checklistData.push({
            stageId: targetStage.id,
            title: item.title,
            description: item.description ?? null,
            isRequired: item.isRequired,
            status: item.defaultStatus ?? __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["QCStatus"].PENDING,
            checklistTemplateId: item.id
        });
    }
    if (checklistData.length > 0) {
        await tx.projectStageChecklistItem.createMany({
            data: checklistData
        });
    }
}
// محاسبه progress پروژه (فقط required ها)
async function calcProgressForProjects(companyId, projectIds) {
    if (projectIds.length === 0) return new Map();
    const requiredItems = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectStageChecklistItem.findMany({
        where: {
            isRequired: true,
            stage: {
                project: {
                    companyId,
                    isDeleted: false,
                    deletedAt: null
                }
            },
            // Prisma اجازه دو تا stage را نمی‌دهد؛ یکی‌اش کافی است:
            // stage: { projectId: { in: projectIds } },
            stage: {
                projectId: {
                    in: projectIds
                }
            }
        },
        select: {
            status: true,
            stage: {
                select: {
                    projectId: true
                }
            }
        }
    });
    const total = new Map();
    const passed = new Map();
    for (const it of requiredItems){
        const pid = it.stage.projectId;
        total.set(pid, (total.get(pid) || 0) + 1);
        if (it.status === "PASSED") passed.set(pid, (passed.get(pid) || 0) + 1);
    }
    const out = new Map();
    for (const pid of projectIds){
        const t = total.get(pid) || 0;
        const p = passed.get(pid) || 0;
        out.set(pid, t === 0 ? 0 : Math.round(p / t * 100));
    }
    return out;
}
async function GET(req) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCurrentUser"])();
        if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "UNAUTHORIZED"
        }, {
            status: 401
        });
        const { searchParams } = new URL(req.url);
        const idParam = searchParams.get("id");
        const statusParam = searchParams.get("status");
        const q = (searchParams.get("q") || "").trim();
        // GET by id (برای صفحات جزئیات)
        if (idParam) {
            const id = mustInt(idParam, "شناسه پروژه");
            const project = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
                where: {
                    id,
                    companyId: user.companyId,
                    isDeleted: false,
                    deletedAt: null
                },
                include: {
                    stages: {
                        orderBy: {
                            id: "asc"
                        },
                        include: {
                            checklist: {
                                orderBy: {
                                    id: "asc"
                                }
                            }
                        }
                    },
                    customerParty: true,
                    projectType: true,
                    bomTemplate: true,
                    contractors: {
                        include: {
                            contractor: {
                                include: {
                                    party: true
                                }
                            }
                        }
                    }
                }
            });
            if (!project) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "پروژه پیدا نشد."
            }, {
                status: 404
            });
            const required = project.stages.flatMap((s)=>s.checklist || []).filter((x)=>x.isRequired);
            const total = required.length;
            const passedCount = required.filter((x)=>x.status === "PASSED").length;
            const progress = total ? Math.round(passedCount / total * 100) : 0;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ...project,
                customerName: project.customerParty?.name ?? null,
                progress
            });
        }
        const where = {
            companyId: user.companyId,
            isDeleted: false,
            deletedAt: null
        };
        if (statusParam && [
            "IN_PROGRESS",
            "COMPLETED",
            "STOPPED"
        ].includes(statusParam)) {
            where.status = statusParam;
        }
        if (q) {
            where.OR = [
                {
                    title: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                {
                    code: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                {
                    name: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                {
                    customerParty: {
                        name: {
                            contains: q,
                            mode: "insensitive"
                        }
                    }
                }
            ];
        }
        const projects = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findMany({
            where,
            orderBy: {
                id: "desc"
            },
            include: {
                projectType: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                },
                customerParty: {
                    select: {
                        id: true,
                        name: true,
                        mobile: true,
                        phone: true
                    }
                },
                bomTemplate: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });
        const ids = projects.map((p)=>p.id);
        const progressMap = await calcProgressForProjects(user.companyId, ids);
        const out = projects.map((p)=>({
                id: p.id,
                title: p.title,
                code: p.code,
                name: p.name,
                status: p.status,
                type: p.type,
                startDate: p.startDate,
                endDate: p.endDate,
                customerId: p.customerId,
                customerName: p.customerParty?.name ?? null,
                projectTypeId: p.projectTypeId,
                projectTypeName: p.projectType?.name ?? null,
                bomTemplateId: p.bomTemplateId,
                progress: progressMap.get(p.id) ?? 0
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(out);
    } catch (err) {
        console.error("Error in GET /api/projects:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "خطای داخلی سرور"
        }, {
            status: 500
        });
    }
}
async function generateNextProjectCode(tx, companyId, projectTypeId, now) {
    // این تابع در پروژه شما وجود داشته؛ اگر داری از همان استفاده کن.
    // اینجا یک نسخه ساده گذاشتم که با الگوی قبلی‌ات نزدیک است.
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prefix = `PRJ-${ym}-C${companyId}-PT${projectTypeId}-`;
    const last = await tx.project.findFirst({
        where: {
            companyId,
            code: {
                startsWith: prefix
            }
        },
        orderBy: {
            code: "desc"
        },
        select: {
            code: true
        }
    });
    const lastNum = last?.code?.split("-").pop();
    const n = lastNum ? Number(lastNum) : 0;
    const next = Number.isFinite(n) ? n + 1 : 1;
    return `${prefix}${String(next).padStart(4, "0")}`;
}
async function POST(req) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCurrentUser"])();
        if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "UNAUTHORIZED"
        }, {
            status: 401
        });
        const body = await req.json();
        if (!body.title || !body.type || !body.customerId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "عنوان، کارفرما و نوع پروژه اجباری است."
            }, {
                status: 400
            });
        }
        const now = new Date();
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const customerId = mustInt(body.customerId, "شناسه مشتری");
            const customerParty = await tx.party.findFirst({
                where: {
                    id: customerId,
                    companyId: user.companyId
                },
                select: {
                    id: true,
                    name: true
                }
            });
            if (!customerParty) {
                throw new Error("کارفرما یافت نشد یا متعلق به این شرکت نیست.");
            }
            const ptid = body.projectTypeId ? mustInt(body.projectTypeId, "ProjectType") : null;
            let code;
            if (ptid) code = await generateNextProjectCode(tx, user.companyId, ptid, now);
            else code = `P-${user.companyId}-${Date.now()}`;
            const name = (body.name?.trim() || body.title.trim() || code).trim();
            let project = null;
            for(let attempt = 0; attempt < 10; attempt++){
                try {
                    project = await tx.project.create({
                        data: {
                            title: body.title.trim(),
                            customerId: customerParty.id,
                            type: body.type,
                            size: body.size ?? null,
                            description: body.description ?? null,
                            startDate: body.startDate ? new Date(body.startDate) : null,
                            endDate: body.endDate ? new Date(body.endDate) : null,
                            code,
                            name,
                            companyId: user.companyId,
                            projectTypeId: ptid,
                            bomTemplateId: body.bomTemplateId ?? null,
                            status: body.status ?? "IN_PROGRESS",
                            isDeleted: false,
                            deletedAt: null,
                            createdAt: now,
                            updatedAt: now
                        }
                    });
                    break;
                } catch (e) {
                    if (!isUniqueConstraintError(e)) throw e;
                    if (ptid) code = await generateNextProjectCode(tx, user.companyId, ptid, now);
                    else code = `P-${user.companyId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
                }
            }
            if (!project) throw new Error("ثبت پروژه ناموفق بود. (retry code)");
            await tx.projectStage.createMany({
                data: STAGE_DEFS.map((stageName)=>({
                        projectId: project.id,
                        name: stageName
                    }))
            });
            const contractorIds = body.contractorIds ?? [];
            if (contractorIds.length > 0) {
                await tx.projectContractor.createMany({
                    data: contractorIds.map((cid)=>({
                            projectId: project.id,
                            contractorId: cid
                        }))
                });
            }
            await applyQcTemplateForProject(tx, project.id, ptid);
            return project;
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result, {
            status: 201
        });
    } catch (err) {
        console.error("Error in POST /api/projects:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err?.message || "خطا در ایجاد پروژه"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ca3f0192._.js.map