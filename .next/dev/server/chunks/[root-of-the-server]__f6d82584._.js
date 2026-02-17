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
"[project]/app/api/invoices/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authMe.ts [app-route] (ecmascript)");
;
;
;
function mustInt(v, name) {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) throw new Error(`${name} نامعتبر است`);
    return n;
}
function toInt(v, def = 0) {
    const n = Number(v);
    if (!Number.isFinite(n)) return def;
    return Math.round(n);
}
function safeStr(v, max = 500) {
    const s = String(v ?? "").trim();
    if (!s) return "";
    return s.slice(0, max);
}
function computeTotals(items, discount, shipping, tax) {
    const subtotal = items.reduce((s, it)=>s + Math.round((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)), 0);
    const total = subtotal - discount + shipping + tax;
    return {
        subtotal,
        total
    };
}
function safeIso(d) {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return null;
    return x.toISOString();
}
async function GET(_req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = me.companyId;
        const { id: idStr } = await ctx.params;
        const id = mustInt(idStr, "id");
        const inv = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].invoice.findFirst({
            where: {
                id,
                companyId,
                deletedAt: null
            },
            include: {
                items: {
                    orderBy: {
                        sortOrder: "asc"
                    }
                },
                spec: true,
                party: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });
        if (!inv) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("فاکتور یافت نشد", {
            status: 404
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: inv.id,
            companyId: inv.companyId,
            docType: inv.docType,
            status: inv.status,
            serialNo: inv.serialNo,
            docNo: inv.docNo,
            date: safeIso(inv.date),
            dueDate: inv.dueDate ? safeIso(inv.dueDate) : null,
            partyId: inv.partyId,
            customerName: inv.customerName,
            customerMobile: inv.customerMobile,
            customerPhone: inv.customerPhone,
            customerAddress: inv.customerAddress,
            subtotal: inv.subtotal,
            discount: inv.discount,
            shipping: inv.shipping,
            tax: inv.tax,
            total: inv.total,
            deliveryTime: inv.deliveryTime,
            storagePenalty: inv.storagePenalty,
            transportTerms: inv.transportTerms,
            notes: inv.notes,
            items: inv.items.map((it)=>({
                    id: it.id,
                    title: it.title,
                    qty: Number(it.qty),
                    unit: it.unit,
                    unitPrice: it.unitPrice,
                    lineTotal: it.lineTotal,
                    sortOrder: it.sortOrder,
                    note: it.note
                })),
            spec: inv.spec ? {
                dimensions: inv.spec.dimensions,
                area: inv.spec.area,
                chassis: inv.spec.chassis,
                profile: inv.spec.profile,
                bodySheet: inv.spec.bodySheet,
                roofSheet: inv.spec.roofSheet,
                interior: inv.spec.interior,
                insulationType: inv.spec.insulationType,
                floor: inv.spec.floor,
                bodyColor: inv.spec.bodyColor,
                door: inv.spec.door,
                window: inv.spec.window,
                extras: inv.spec.extras,
                strapSheet: inv.spec.strapSheet,
                gutter: inv.spec.gutter,
                service: inv.spec.service
            } : null,
            // برای UI role-based
            meRole: me.role
        });
    } catch (e) {
        console.error(e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](e?.message || "خطا در دریافت فاکتور", {
            status: 500
        });
    }
}
async function PATCH(req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = me.companyId;
        const { id: idStr } = await ctx.params;
        const id = mustInt(idStr, "id");
        const body = await req.json().catch(()=>({}));
        const inv = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].invoice.findFirst({
            where: {
                id,
                companyId
            },
            select: {
                id: true,
                status: true,
                deletedAt: true
            }
        });
        if (!inv) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("فاکتور یافت نشد", {
            status: 404
        });
        if (inv.deletedAt) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("فاکتور حذف شده و قابل ویرایش نیست", {
            status: 409
        });
        if (inv.status === "CANCELLED") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("فاکتور باطل شده قابل ویرایش نیست", {
            status: 409
        });
        const patch = {};
        if (body.status) patch.status = String(body.status).toUpperCase();
        if (body.date) {
            const d = new Date(body.date);
            if (Number.isNaN(d.getTime())) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("date نامعتبر است", {
                status: 400
            });
            patch.date = d;
        }
        if (body.dueDate !== undefined) {
            if (!body.dueDate) patch.dueDate = null;
            else {
                const d = new Date(body.dueDate);
                if (Number.isNaN(d.getTime())) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("dueDate نامعتبر است", {
                    status: 400
                });
                patch.dueDate = d;
            }
        }
        if (body.customerName !== undefined) patch.customerName = safeStr(body.customerName, 200);
        if (body.customerMobile !== undefined) patch.customerMobile = safeStr(body.customerMobile, 50) || null;
        if (body.customerPhone !== undefined) patch.customerPhone = safeStr(body.customerPhone, 50) || null;
        if (body.customerAddress !== undefined) patch.customerAddress = safeStr(body.customerAddress, 500) || null;
        if (body.deliveryTime !== undefined) patch.deliveryTime = safeStr(body.deliveryTime, 200) || null;
        if (body.storagePenalty !== undefined) patch.storagePenalty = safeStr(body.storagePenalty, 200) || null;
        if (body.transportTerms !== undefined) patch.transportTerms = safeStr(body.transportTerms, 200) || null;
        if (body.notes !== undefined) patch.notes = safeStr(body.notes, 5000) || null;
        if (body.discount !== undefined) patch.discount = toInt(body.discount, 0);
        if (body.shipping !== undefined) patch.shipping = toInt(body.shipping, 0);
        if (body.tax !== undefined) patch.tax = toInt(body.tax, 0);
        const incomingItems = Array.isArray(body.items) ? body.items : null;
        // ✅ Transaction
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            // Update invoice head
            await tx.invoice.update({
                where: {
                    id
                },
                data: patch
            });
            // Items (replace-all)
            if (incomingItems) {
                await tx.invoiceItem.deleteMany({
                    where: {
                        invoiceId: id
                    }
                });
                let sortOrder = 0;
                const cleaned = incomingItems.map((x)=>({
                        title: safeStr(x.title, 300),
                        qty: toInt(x.qty, 0),
                        unit: safeStr(x.unit, 40) || null,
                        unitPrice: toInt(x.unitPrice, 0),
                        note: safeStr(x.note, 500) || null,
                        sortOrder: sortOrder++
                    })).filter((x)=>x.title && x.qty > 0);
                const totals = computeTotals(cleaned.map((x)=>({
                        qty: x.qty,
                        unitPrice: x.unitPrice
                    })), toInt(patch.discount ?? body.discount ?? 0, 0), toInt(patch.shipping ?? body.shipping ?? 0, 0), toInt(patch.tax ?? body.tax ?? 0, 0));
                await tx.invoiceItem.createMany({
                    data: cleaned.map((x)=>({
                            invoiceId: id,
                            title: x.title,
                            qty: x.qty,
                            unit: x.unit,
                            unitPrice: x.unitPrice,
                            lineTotal: Math.round((x.qty || 0) * (x.unitPrice || 0)),
                            sortOrder: x.sortOrder,
                            note: x.note
                        }))
                });
                await tx.invoice.update({
                    where: {
                        id
                    },
                    data: {
                        subtotal: totals.subtotal,
                        total: totals.total,
                        discount: toInt(patch.discount ?? body.discount ?? 0, 0),
                        shipping: toInt(patch.shipping ?? body.shipping ?? 0, 0),
                        tax: toInt(patch.tax ?? body.tax ?? 0, 0)
                    }
                });
            }
            // Spec upsert
            if (body.spec) {
                const s = body.spec || {};
                await tx.invoiceSpec.upsert({
                    where: {
                        invoiceId: id
                    },
                    create: {
                        invoiceId: id,
                        dimensions: safeStr(s.dimensions, 200) || null,
                        area: safeStr(s.area, 200) || null,
                        chassis: safeStr(s.chassis, 200) || null,
                        profile: safeStr(s.profile, 200) || null,
                        bodySheet: safeStr(s.bodySheet, 200) || null,
                        roofSheet: safeStr(s.roofSheet, 200) || null,
                        interior: safeStr(s.interior, 200) || null,
                        insulationType: safeStr(s.insulationType, 200) || null,
                        floor: safeStr(s.floor, 200) || null,
                        bodyColor: safeStr(s.bodyColor, 200) || null,
                        door: safeStr(s.door, 200) || null,
                        window: safeStr(s.window, 200) || null,
                        extras: safeStr(s.extras, 2000) || null,
                        strapSheet: safeStr(s.strapSheet, 200) || null,
                        gutter: safeStr(s.gutter, 200) || null,
                        service: safeStr(s.service, 200) || null
                    },
                    update: {
                        dimensions: safeStr(s.dimensions, 200) || null,
                        area: safeStr(s.area, 200) || null,
                        chassis: safeStr(s.chassis, 200) || null,
                        profile: safeStr(s.profile, 200) || null,
                        bodySheet: safeStr(s.bodySheet, 200) || null,
                        roofSheet: safeStr(s.roofSheet, 200) || null,
                        interior: safeStr(s.interior, 200) || null,
                        insulationType: safeStr(s.insulationType, 200) || null,
                        floor: safeStr(s.floor, 200) || null,
                        bodyColor: safeStr(s.bodyColor, 200) || null,
                        door: safeStr(s.door, 200) || null,
                        window: safeStr(s.window, 200) || null,
                        extras: safeStr(s.extras, 2000) || null,
                        strapSheet: safeStr(s.strapSheet, 200) || null,
                        gutter: safeStr(s.gutter, 200) || null,
                        service: safeStr(s.service, 200) || null
                    }
                });
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (e) {
        console.error(e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](e?.message || "خطا در ویرایش فاکتور", {
            status: 500
        });
    }
}
async function DELETE(_req, ctx) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = me.companyId;
        if (me.role !== "ADMIN") {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("فقط ادمین مجاز به حذف است", {
                status: 403
            });
        }
        const { id: idStr } = await ctx.params;
        const id = mustInt(idStr, "id");
        const inv = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].invoice.findFirst({
            where: {
                id,
                companyId
            },
            select: {
                id: true,
                status: true,
                deletedAt: true
            }
        });
        if (!inv) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("فاکتور یافت نشد", {
            status: 404
        });
        if (inv.status === "PAID") return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("فاکتور تسویه‌شده قابل حذف نیست", {
            status: 409
        });
        if (inv.deletedAt) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("قبلاً حذف شده", {
            status: 409
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].invoice.update({
            where: {
                id
            },
            data: {
                deletedAt: new Date(),
                deletedBy: me.id
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (e) {
        console.error(e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](e?.message || "خطا در حذف فاکتور", {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f6d82584._.js.map