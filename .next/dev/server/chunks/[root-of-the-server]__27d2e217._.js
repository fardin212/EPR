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
"[project]/app/api/invoices/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authMe.ts [app-route] (ecmascript)");
;
;
;
function toInt(v, def = 0) {
    const n = Number(v);
    if (!Number.isFinite(n)) return def;
    return Math.round(n);
}
function safeStr(v, max = 500) {
    const s = String(v ?? "").trim();
    return s.length > max ? s.slice(0, max) : s;
}
function parseDate(v) {
    const d = v ? new Date(v) : null;
    if (d && Number.isNaN(d.getTime())) return null;
    return d;
}
function docPrefix(docType) {
    return docType === "INVOICE" ? "I" : "P";
}
async function nextSerialNo(tx, companyId, docType) {
    // قفل در سطح transaction: با unique(docNo) هم امن است
    const last = await tx.invoice.findFirst({
        where: {
            companyId,
            docType
        },
        orderBy: {
            serialNo: "desc"
        },
        select: {
            serialNo: true
        }
    });
    return (last?.serialNo ?? 0) + 1;
}
function makeDocNo(docType, serialNo) {
    const p = docPrefix(docType);
    return `${p}-${String(serialNo).padStart(6, "0")}`;
}
function calcTotals(items, discount, shipping, tax) {
    const subtotal = items.reduce((s, it)=>s + Math.round(it.qty * it.unitPrice), 0);
    const total = subtotal - discount + shipping + tax;
    return {
        subtotal,
        total
    };
}
async function GET(req) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = me.companyId;
        const { searchParams } = new URL(req.url);
        const take = Math.min(Math.max(Number(searchParams.get("take") || 50), 1), 200);
        const docType = searchParams.get("docType"); // PROFORMA | INVOICE
        const status = searchParams.get("status"); // DRAFT | ISSUED | PAID | CANCELLED
        const q = (searchParams.get("q") || "").trim();
        const from = parseDate(searchParams.get("from"));
        const to = parseDate(searchParams.get("to"));
        const where = {
            companyId
        };
        if (docType) where.docType = String(docType).toUpperCase();
        if (status) where.status = String(status).toUpperCase();
        if (from) where.date = {
            ...where.date || {},
            gte: from
        };
        if (to) {
            const t = new Date(to);
            t.setHours(23, 59, 59, 999);
            where.date = {
                ...where.date || {},
                lte: t
            };
        }
        if (q) {
            where.OR = [
                {
                    docNo: {
                        contains: q
                    }
                },
                {
                    customerName: {
                        contains: q
                    }
                },
                {
                    customerMobile: {
                        contains: q
                    }
                },
                {
                    customerPhone: {
                        contains: q
                    }
                }
            ];
        }
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].invoice.findMany({
            where,
            orderBy: {
                date: "desc"
            },
            take,
            select: {
                id: true,
                docType: true,
                status: true,
                docNo: true,
                date: true,
                dueDate: true,
                customerName: true,
                customerMobile: true,
                total: true
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: rows.map((r)=>({
                    ...r,
                    date: r.date.toISOString(),
                    dueDate: r.dueDate ? r.dueDate.toISOString() : null
                }))
        });
    } catch (e) {
        console.error(e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("خطا در دریافت لیست فاکتورها", {
            status: 500
        });
    }
}
async function POST(req) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = me.companyId;
        const body = await req.json();
        const docType = String(body.docType || "PROFORMA").toUpperCase();
        if (docType !== "PROFORMA" && docType !== "INVOICE") {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("docType نامعتبر است", {
                status: 400
            });
        }
        const date = body.date ? new Date(body.date) : new Date();
        if (Number.isNaN(date.getTime())) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("date نامعتبر است", {
            status: 400
        });
        const dueDate = body.dueDate ? new Date(body.dueDate) : null;
        if (dueDate && Number.isNaN(dueDate.getTime())) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("dueDate نامعتبر است", {
            status: 400
        });
        const partyId = body.partyId != null ? Number(body.partyId) : null;
        const customerName = safeStr(body.customerName, 200);
        if (!customerName) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("نام مشتری الزامی است", {
            status: 400
        });
        const customerMobile = safeStr(body.customerMobile, 50) || null;
        const customerPhone = safeStr(body.customerPhone, 50) || null;
        const customerAddress = safeStr(body.customerAddress, 500) || null;
        const discount = toInt(body.discount, 0);
        const shipping = toInt(body.shipping, 0);
        const tax = toInt(body.tax, 0);
        const deliveryTime = safeStr(body.deliveryTime, 200) || null;
        const storagePenalty = safeStr(body.storagePenalty, 200) || null;
        const transportTerms = safeStr(body.transportTerms, 300) || null;
        const notes = safeStr(body.notes, 2000) || null;
        const itemsIn = Array.isArray(body.items) ? body.items : [];
        if (!itemsIn.length) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("حداقل یک آیتم قیمت لازم است", {
            status: 400
        });
        const itemsParsed = itemsIn.map((it, idx)=>{
            const title = safeStr(it.title, 200);
            if (!title) throw new Error(`title آیتم ردیف ${idx + 1} الزامی است`);
            const qty = Number(it.qty ?? 1);
            if (!Number.isFinite(qty) || qty <= 0) throw new Error(`qty آیتم ردیف ${idx + 1} نامعتبر است`);
            const unit = safeStr(it.unit, 30) || null;
            const unitPrice = toInt(it.unitPrice, 0);
            if (unitPrice < 0) throw new Error(`unitPrice آیتم ردیف ${idx + 1} نامعتبر است`);
            const lineTotal = Math.round(qty * unitPrice);
            return {
                title,
                qty,
                unit,
                unitPrice,
                lineTotal,
                sortOrder: toInt(it.sortOrder, idx),
                note: safeStr(it.note, 300) || null
            };
        });
        const totals = calcTotals(itemsParsed, discount, shipping, tax);
        const spec = body.spec || null;
        const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const serialNo = await nextSerialNo(tx, companyId, docType);
            const docNo = makeDocNo(docType, serialNo);
            const inv = await tx.invoice.create({
                data: {
                    companyId,
                    docType,
                    status: "DRAFT",
                    serialNo,
                    docNo,
                    date,
                    dueDate: dueDate || undefined,
                    partyId: partyId || undefined,
                    customerName,
                    customerMobile,
                    customerPhone,
                    customerAddress,
                    subtotal: totals.subtotal,
                    discount,
                    shipping,
                    tax,
                    total: totals.total,
                    deliveryTime,
                    storagePenalty,
                    transportTerms,
                    notes,
                    createdById: me.id
                },
                select: {
                    id: true,
                    docNo: true
                }
            });
            await tx.invoiceItem.createMany({
                data: itemsParsed.map((it)=>({
                        invoiceId: inv.id,
                        title: it.title,
                        qty: it.qty,
                        unit: it.unit,
                        unitPrice: it.unitPrice,
                        lineTotal: it.lineTotal,
                        sortOrder: it.sortOrder,
                        note: it.note
                    }))
            });
            if (spec) {
                await tx.invoiceSpec.create({
                    data: {
                        invoiceId: inv.id,
                        dimensions: safeStr(spec.dimensions, 200) || null,
                        area: safeStr(spec.area, 200) || null,
                        chassis: safeStr(spec.chassis, 200) || null,
                        profile: safeStr(spec.profile, 200) || null,
                        bodySheet: safeStr(spec.bodySheet, 200) || null,
                        roofSheet: safeStr(spec.roofSheet, 200) || null,
                        interior: safeStr(spec.interior, 200) || null,
                        insulationType: safeStr(spec.insulationType, 200) || null,
                        floor: safeStr(spec.floor, 200) || null,
                        bodyColor: safeStr(spec.bodyColor, 200) || null,
                        door: safeStr(spec.door, 200) || null,
                        window: safeStr(spec.window, 200) || null,
                        extras: safeStr(spec.extras, 500) || null,
                        strapSheet: safeStr(spec.strapSheet, 200) || null,
                        gutter: safeStr(spec.gutter, 200) || null,
                        service: safeStr(spec.service, 200) || null
                    }
                });
            }
            return inv;
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            id: created.id,
            docNo: created.docNo
        }, {
            status: 201
        });
    } catch (e) {
        console.error(e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](e?.message || "خطا در ایجاد فاکتور", {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__27d2e217._.js.map