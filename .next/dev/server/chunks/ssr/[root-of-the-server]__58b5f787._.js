module.exports = [
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/authMe.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/authMe.ts
__turbopack_context__.s([
    "getMeServer",
    ()=>getMeServer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-rsc] (ecmascript)");
;
;
async function getMeServer() {
    // در Next 16 cookies() async است
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie?.value) {
        throw new Error("دسترسی غیرمجاز: لطفاً وارد شوید");
    }
    // در پروژه شما session = userId (عددی) است
    const userId = Number(sessionCookie.value);
    if (!Number.isFinite(userId) || userId <= 0) {
        throw new Error("دسترسی غیرمجاز: لطفاً وارد شوید");
    }
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
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
"[project]/app/actions/container-estimate.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40fce2062e0187dfc9573f7e15ff4273729670a86a":"createContainerEstimate"},"",""] */ __turbopack_context__.s([
    "createContainerEstimate",
    ()=>createContainerEstimate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authMe.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
/* ================= utils ================= */ function n(v) {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
}
function round0(v) {
    return Math.round(v);
}
function bi0(v) {
    return BigInt(round0(v));
}
async function createContainerEstimate(input) {
    const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getMeServer"])();
    const companyId = Number(me.companyId);
    if (!companyId) throw new Error("companyId نامعتبر است");
    const { estimateType, containerModelId, sizePresetId, length, width, height, spec, specSummary, customerName, customerPhone, projectLocation, usageType, validUntil, deliveryDays, paymentTerms, warrantyTerms, transportTerms, notesForCustomer, profitType, profitValue, displayItems, extras } = input;
    if (!customerName?.trim()) throw new Error("نام مشتری الزامی است");
    if (!customerPhone?.trim()) throw new Error("شماره تماس مشتری الزامی است");
    if (!containerModelId) throw new Error("نوع کانکس الزامی است");
    if (!sizePresetId) throw new Error("سایز (preset) الزامی است");
    if (!Array.isArray(displayItems) || displayItems.length === 0) {
        throw new Error("حداقل یک آیتم قیمت‌دار (طبقه/تراس/...) وارد کن");
    }
    // ✅ امنیت چندشرکتی: این مدل کانکس باید متعلق به همین شرکت باشد
    const model = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].containerModel.findUnique({
        where: {
            id: containerModelId
        },
        select: {
            id: true,
            companyId: true
        }
    });
    if (!model) throw new Error("نوع کانکس معتبر نیست");
    if (Number(model.companyId) !== companyId) throw new Error("دسترسی غیرمجاز");
    /* ---------- sanitize display items ---------- */ const displaySan = displayItems.map((x)=>({
            title: String(x.title ?? "").trim(),
            amount: round0(n(x.amount))
        })).filter((x)=>x.title && x.amount > 0);
    if (displaySan.length === 0) throw new Error("آیتم‌های قیمت‌دار معتبر نیستند");
    /* ---------- extras (optional) ---------- */ const extrasSan = (extras ?? []).map((e)=>({
            title: String(e.title ?? "").trim(),
            amount: round0(n(e.amount))
        })).filter((e)=>e.title && e.amount > 0);
    /* ---------- totals ---------- */ const materialsTotal = round0(displaySan.reduce((s, x)=>s + x.amount, 0)); // پایه قیمت مشتری
    const extrasTotal = round0(extrasSan.reduce((s, e)=>s + e.amount, 0));
    const baseCost = materialsTotal + extrasTotal;
    const profitAmount = profitType === __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["ProfitType"].FIXED ? round0(profitValue) : round0(baseCost * (profitValue / 100));
    const finalPrice = round0(baseCost + profitAmount);
    /* ---------- save ---------- */ const estimate = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].containerEstimate.create({
        data: {
            // ❌ companyId حذف شد چون در مدل ContainerEstimate وجود ندارد
            estimateType,
            containerModelId,
            sizePresetId,
            length,
            width,
            height,
            spec: spec ?? undefined,
            specSummary: specSummary?.trim() || null,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            projectLocation: projectLocation?.trim() || null,
            usageType: usageType?.trim() || null,
            validUntil: validUntil ?? null,
            deliveryDays: deliveryDays ?? null,
            paymentTerms: paymentTerms?.trim() || null,
            warrantyTerms: warrantyTerms?.trim() || null,
            transportTerms: transportTerms?.trim() || null,
            notesForCustomer: notesForCustomer?.trim() || null,
            profitType,
            profitValue: n(profitValue),
            // snapshot totals
            materialsTotal: bi0(materialsTotal),
            extrasTotal: bi0(extrasTotal),
            profitAmount: bi0(profitAmount),
            finalPrice: bi0(finalPrice),
            // ✅ ردیف‌های مشتری
            displayItems: {
                create: displaySan.map((x, i)=>({
                        sortOrder: i + 1,
                        title: x.title,
                        amount: bi0(x.amount)
                    }))
            },
            // ✅ هزینه‌های دستی
            extras: {
                create: extrasSan.map((e)=>({
                        title: e.title,
                        amount: bi0(e.amount)
                    }))
            }
        },
        select: {
            id: true
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/container-estimates");
    return estimate;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createContainerEstimate
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createContainerEstimate, "40fce2062e0187dfc9573f7e15ff4273729670a86a", null);
}),
"[project]/.next-internal/server/app/dashboard/container-estimates/new/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/container-estimate.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$container$2d$estimate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/container-estimate.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/dashboard/container-estimates/new/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/container-estimate.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40fce2062e0187dfc9573f7e15ff4273729670a86a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$container$2d$estimate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createContainerEstimate"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$container$2d$estimates$2f$new$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$container$2d$estimate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/dashboard/container-estimates/new/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions/container-estimate.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$container$2d$estimate$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/container-estimate.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__58b5f787._.js.map