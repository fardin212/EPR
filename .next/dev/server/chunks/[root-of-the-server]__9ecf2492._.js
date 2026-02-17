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
"[project]/app/api/qc-templates/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/qc-templates/[id]/route.ts
__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST,
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
function defaultStageName(stageOrder) {
    return `مرحله ${stageOrder}`;
}
function cleanStageName(raw, fallback) {
    const t = String(raw ?? "").trim();
    return t || fallback;
}
function jsonError(err, fallback, status = 400) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: err?.message || fallback
    }, {
        status
    });
}
/**
 * ✅ select مینیمال
 */ const qcItemSelect = {
    id: true,
    templateId: true,
    stageOrder: true,
    stageName: true,
    title: true,
    description: true,
    isRequired: true,
    defaultStatus: true
};
/* ===================== Template Helper ===================== */ async function getOrCreateTemplate(projectTypeId) {
    // ✅ در schema شما projectTypeId ندارید → relation
    let tpl = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].qcTemplate.findFirst({
        where: {
            projectType: {
                id: projectTypeId
            }
        },
        select: {
            id: true
        }
    });
    if (tpl?.id) return tpl;
    const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].qcTemplate.create({
        data: {
            title: `QC Template - PT#${projectTypeId}`,
            isDefault: true,
            projectType: {
                connect: {
                    id: projectTypeId
                }
            }
        },
        select: {
            id: true
        }
    });
    return created;
}
async function GET(_req, ctx) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const { id } = await getParams(ctx);
        const projectTypeId = mustInt(id, "شناسه نوع پروژه");
        const tpl = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].qcTemplate.findFirst({
            where: {
                projectType: {
                    id: projectTypeId
                }
            },
            select: {
                id: true
            }
        });
        // ✅ مهم: هم items و هم length
        if (!tpl?.id) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: [],
            length: 0
        });
        const items = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].qcTemplateItem.findMany({
            where: {
                templateId: tpl.id
            },
            orderBy: [
                {
                    stageOrder: "asc"
                },
                {
                    id: "asc"
                }
            ],
            select: qcItemSelect
        });
        const mappedItems = items.map((x)=>{
            const fallback = defaultStageName(Number(x.stageOrder) || 1);
            return {
                id: x.id,
                projectTypeId,
                templateId: x.templateId,
                stageOrder: x.stageOrder,
                stageName: cleanStageName(x.stageName, fallback),
                title: x.title,
                description: x.description ?? "",
                isRequired: Boolean(x.isRequired),
                defaultStatus: x.defaultStatus ?? null
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: mappedItems,
            length: mappedItems.length
        });
    } catch (err) {
        return jsonError(err, "خطا در دریافت QC");
    }
}
async function POST(req, ctx) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const { id } = await getParams(ctx);
        const projectTypeId = mustInt(id, "شناسه نوع پروژه");
        const body = await req.json();
        const title = String(body?.title ?? "").trim();
        if (!title) return jsonError(null, "عنوان آیتم QC الزامی است.");
        const stageOrder = Number(body?.stageOrder ?? 1) || 1;
        const stageName = cleanStageName(body?.stageName, defaultStageName(stageOrder));
        const description = String(body?.description ?? "").trim();
        const isRequired = Boolean(body?.isRequired);
        const tpl = await getOrCreateTemplate(projectTypeId);
        const item = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].qcTemplateItem.create({
            data: {
                templateId: tpl.id,
                stageOrder,
                stageName,
                title,
                description,
                isRequired
            },
            select: qcItemSelect
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            item: {
                ...item,
                projectTypeId,
                stageName: cleanStageName(item.stageName, defaultStageName(item.stageOrder))
            }
        });
    } catch (err) {
        return jsonError(err, "خطا در افزودن آیتم QC");
    }
}
async function PATCH(req, ctx) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const { id } = await getParams(ctx);
        const projectTypeId = mustInt(id, "شناسه نوع پروژه");
        const body = await req.json();
        const itemId = mustInt(body?.id, "شناسه آیتم");
        const data = {};
        if (body?.title != null) {
            const t = String(body.title).trim();
            if (!t) return jsonError(null, "عنوان آیتم QC الزامی است.");
            data.title = t;
        }
        if (body?.description != null) data.description = String(body.description ?? "");
        if (body?.isRequired != null) data.isRequired = Boolean(body.isRequired);
        if (body?.defaultStatus != null) data.defaultStatus = body.defaultStatus;
        if (body?.stageOrder != null) {
            const so = Number(body.stageOrder) || 1;
            data.stageOrder = so;
            data.stageName = cleanStageName(body?.stageName, defaultStageName(so));
        } else if (body?.stageName != null) {
            data.stageName = cleanStageName(body.stageName, defaultStageName(1));
        }
        const tpl = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].qcTemplate.findFirst({
            where: {
                projectType: {
                    id: projectTypeId
                }
            },
            select: {
                id: true
            }
        });
        if (!tpl?.id) return jsonError(null, "QC Template برای این نوع پروژه وجود ندارد.", 404);
        const item = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].qcTemplateItem.update({
            where: {
                id: itemId
            },
            data,
            select: qcItemSelect
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            item: {
                ...item,
                projectTypeId,
                stageName: cleanStageName(item.stageName, defaultStageName(item.stageOrder))
            }
        });
    } catch (err) {
        return jsonError(err, "خطا در ویرایش آیتم QC");
    }
}
async function DELETE(req, ctx) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const { id } = await getParams(ctx);
        mustInt(id, "شناسه نوع پروژه");
        const body = await req.json().catch(()=>({}));
        const itemId = mustInt(body?.id, "شناسه آیتم");
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].qcTemplateItem.delete({
            where: {
                id: itemId
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (err) {
        return jsonError(err, "خطا در حذف آیتم QC");
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9ecf2492._.js.map