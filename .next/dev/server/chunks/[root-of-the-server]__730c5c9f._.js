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
"[project]/app/api/projects/[id]/contracts/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/projects/[id]/contracts/route.ts
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
function toNumber(v, def = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
}
/** قفل/باز کردن پروژه بر اساس DONE شدن همه پیمانکارها */ async function syncProjectLock(projectId, companyId) {
    const total = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectContractor.count({
        where: {
            projectId,
            companyId
        }
    });
    const notDone = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectContractor.count({
        where: {
            projectId,
            companyId,
            status: {
                not: "DONE"
            }
        }
    });
    // اگر هیچ پیمانکاری ثبت نشده، پروژه را خودکار قفل/باز نکن
    if (total === 0) return;
    const project = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
        where: {
            id: projectId,
            companyId,
            deletedAt: null,
            isDeleted: false
        },
        select: {
            id: true,
            status: true,
            endDate: true
        }
    });
    if (!project) return;
    // STOPPED را دست نزن
    if (project.status === "STOPPED") return;
    if (notDone === 0) {
        // همه DONE → قفل پروژه (COMPLETED)
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.update({
            where: {
                id: projectId
            },
            data: {
                status: "COMPLETED",
                endDate: project.endDate ?? new Date()
            }
        });
    } else {
        // حداقل یکی DONE نیست → باز (IN_PROGRESS) (اگر قبلاً COMPLETED شده بود)
        if (project.status === "COMPLETED") {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].project.update({
                where: {
                    id: projectId
                },
                data: {
                    status: "IN_PROGRESS"
                }
            });
        }
    }
}
async function GET(req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = Number(me?.companyId) || Number(me?.company?.id) || Number(me?.user?.companyId) || Number(me?.user?.company?.id);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "عدم دسترسی شرکت"
            }, {
                status: 401
            });
        }
        const { id } = await getParams(ctx);
        const projectId = mustInt(id, "شناسه پروژه");
        // قراردادهای پیمانکار
        const pcs = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectContractor.findMany({
            where: {
                projectId,
                companyId
            },
            select: {
                id: true,
                agreedAmount: true,
                status: true,
                contractor: {
                    select: {
                        id: true,
                        partyId: true,
                        party: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                id: "desc"
            }
        });
        // اگر contractor.partyId داری:
        const partyIds = [];
        for (const x of pcs){
            const pid = Number(x?.contractor?.partyId);
            if (pid) partyIds.push(pid);
        }
        const paidMap = new Map();
        if (partyIds.length > 0) {
            const groups = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].treasuryPayment.groupBy({
                by: [
                    "partyId"
                ],
                where: {
                    companyId,
                    projectId,
                    direction: "OUT",
                    partyId: {
                        in: partyIds
                    }
                },
                _sum: {
                    amount: true
                }
            });
            for (const g of groups){
                const pid = Number(g.partyId);
                const sum = Number(g._sum?.amount ?? 0);
                if (pid) paidMap.set(pid, sum);
            }
        }
        const contracts = pcs.map((x)=>{
            const total = Number(x.agreedAmount ?? 0);
            const pid = Number(x?.contractor?.partyId) || 0;
            const paid = pid ? Number(paidMap.get(pid) ?? 0) : 0;
            const remaining = Math.max(0, total - paid);
            const payStatus = paid <= 0 ? "UNPAID" : paid < total ? "PARTIAL" : "PAID";
            return {
                id: x.id,
                contractor: {
                    id: x.contractor.id,
                    name: x.contractor.party?.name || `#${x.contractor.id}`
                },
                totalAmount: total,
                paidAmount: paid,
                remainingAmount: remaining,
                status: payStatus,
                contractStatus: x.status
            };
        });
        const summary = {
            totalAmount: contracts.reduce((s, c)=>s + c.totalAmount, 0),
            paidAmount: contracts.reduce((s, c)=>s + c.paidAmount, 0),
            remainingAmount: contracts.reduce((s, c)=>s + c.remainingAmount, 0),
            statusCounts: {
                PAID: contracts.filter((c)=>c.status === "PAID").length,
                PARTIAL: contracts.filter((c)=>c.status === "PARTIAL").length,
                UNPAID: contracts.filter((c)=>c.status === "UNPAID").length
            }
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            contracts,
            summary
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: e?.message || "خطا"
        }, {
            status: 400
        });
    }
}
async function POST(req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = Number(me?.companyId) || Number(me?.company?.id) || Number(me?.user?.companyId) || Number(me?.user?.company?.id);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "عدم دسترسی شرکت"
            }, {
                status: 401
            });
        }
        const { id } = await getParams(ctx);
        const projectId = mustInt(id, "شناسه پروژه");
        const body = await req.json().catch(()=>({}));
        const contractorId = mustInt(body.contractorId, "پیمانکار");
        const agreedAmount = toNumber(body.agreedAmount, 0);
        const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectContractor.create({
            data: {
                companyId,
                projectId,
                contractorId,
                agreedAmount,
                role: body.role || null,
                note: body.note || null,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                status: body.status || "ACTIVE"
            },
            select: {
                id: true
            }
        });
        await syncProjectLock(projectId, companyId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            id: created.id
        }, {
            status: 201
        });
    } catch (e) {
        const msg = e?.message || "خطا";
        // unique constraint (projectId, contractorId)
        if (msg.toLowerCase().includes("unique") || msg.includes("P2002")) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "این پیمانکار قبلاً برای این پروژه ثبت شده است."
            }, {
                status: 409
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: msg
        }, {
            status: 400
        });
    }
}
async function PATCH(req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = Number(me?.companyId) || Number(me?.company?.id) || Number(me?.user?.companyId) || Number(me?.user?.company?.id);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "عدم دسترسی شرکت"
            }, {
                status: 401
            });
        }
        const { id } = await getParams(ctx);
        const projectId = mustInt(id, "شناسه پروژه");
        const body = await req.json().catch(()=>({}));
        const pcId = mustInt(body.id, "شناسه قرارداد");
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectContractor.update({
            where: {
                id: pcId
            },
            data: {
                agreedAmount: body.agreedAmount !== undefined ? toNumber(body.agreedAmount, 0) : undefined,
                role: body.role !== undefined ? body.role || null : undefined,
                note: body.note !== undefined ? body.note || null : undefined,
                startDate: body.startDate !== undefined ? body.startDate ? new Date(body.startDate) : null : undefined,
                endDate: body.endDate !== undefined ? body.endDate ? new Date(body.endDate) : null : undefined,
                status: body.status !== undefined ? body.status : undefined
            }
        });
        await syncProjectLock(projectId, companyId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: e?.message || "خطا"
        }, {
            status: 400
        });
    }
}
async function DELETE(req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = Number(me?.companyId) || Number(me?.company?.id) || Number(me?.user?.companyId) || Number(me?.user?.company?.id);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "عدم دسترسی شرکت"
            }, {
                status: 401
            });
        }
        const { id } = await getParams(ctx);
        const projectId = mustInt(id, "شناسه پروژه");
        const body = await req.json().catch(()=>({}));
        const pcId = mustInt(body.id, "شناسه قرارداد");
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].projectContractor.delete({
            where: {
                id: pcId
            }
        });
        await syncProjectLock(projectId, companyId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: e?.message || "خطا"
        }, {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__730c5c9f._.js.map