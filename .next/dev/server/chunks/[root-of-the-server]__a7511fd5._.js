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
"[project]/app/api/parties/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/parties/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/authMe.ts [app-route] (ecmascript)");
;
;
;
function normStr(v, max = 200) {
    const s = (v ?? "").toString().trim();
    if (!s) return "";
    return s.length > max ? s.slice(0, max) : s;
}
function kindToType(kind) {
    if (kind === "CUSTOMER") return "CUSTOMER";
    if (kind === "SUPPLIER") return "SUPPLIER";
    if (kind === "CONTRACTOR") return "CONTRACTOR";
    return "OTHER";
}
// ✅ تلاش برای Sync مشتری‌های CRM به Party (فقط وقتی kind=CUSTOMER)
async function syncCrmCustomersToParties(companyId) {
    try {
        // توجه: اسم جدول را فرض کردیم CrmCustomer (طبق UI شما)
        // اگر اسم جدول فرق داشت، این قسمت صرفاً fail می‌شود و سیستم به کارش ادامه می‌دهد.
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`
      SELECT id, name, mobile, phone, nationalId, companyName, address
      FROM \`CrmCustomer\`
      WHERE companyId = ?
      ORDER BY id DESC
      LIMIT 500
      `, companyId);
        if (!Array.isArray(rows) || rows.length === 0) return;
        for (const c of rows){
            const name = normStr(c?.name, 200);
            if (!name) continue;
            const mobile = normStr(c?.mobile, 40) || null;
            const phone = normStr(c?.phone, 40) || null;
            const nationalId = normStr(c?.nationalId, 40) || null;
            const companyName = normStr(c?.companyName, 200) || null;
            const address = normStr(c?.address, 500) || null;
            // معیار پیدا کردن Party موجود:
            // اول nationalId، بعد mobile، بعد name
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.findFirst({
                where: {
                    companyId,
                    kind: "CUSTOMER",
                    OR: [
                        ...nationalId ? [
                            {
                                nationalId
                            }
                        ] : [],
                        ...mobile ? [
                            {
                                mobile
                            }
                        ] : [],
                        {
                            name
                        }
                    ]
                },
                select: {
                    id: true
                }
            });
            if (existing) continue;
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.create({
                data: {
                    companyId,
                    kind: "CUSTOMER",
                    type: "CUSTOMER",
                    name,
                    mobile,
                    phone,
                    nationalId,
                    companyName,
                    address
                }
            });
        }
    } catch (e) {
        // مهم: اگر جدول/ستون وجود نداشت، سیستم نباید بخوابد.
        console.warn("syncCrmCustomersToParties skipped:", e?.message || e);
    }
}
async function GET(req) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = Number(me?.companyId);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "UNAUTHORIZED"
            }, {
                status: 401
            });
        }
        const { searchParams } = new URL(req.url);
        const kind = searchParams.get("kind") ?? null;
        const q = (searchParams.get("q") || "").trim();
        // ✅ اگر مشتری می‌خوای، اول Sync کن تا dropdown کامل شود
        if (kind === "CUSTOMER" && !q) {
            await syncCrmCustomersToParties(companyId);
        }
        const where = {
            companyId
        };
        if (kind) where.kind = kind;
        if (q) {
            where.OR = [
                {
                    name: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                {
                    mobile: {
                        contains: q
                    }
                },
                {
                    phone: {
                        contains: q
                    }
                },
                {
                    companyName: {
                        contains: q,
                        mode: "insensitive"
                    }
                }
            ];
        }
        const parties = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.findMany({
            where,
            orderBy: {
                id: "desc"
            },
            take: 300,
            include: {
                bankAccounts: {
                    orderBy: [
                        {
                            isDefault: "desc"
                        },
                        {
                            id: "desc"
                        }
                    ],
                    take: 1,
                    select: {
                        id: true,
                        title: true,
                        bankName: true,
                        accountNumber: true,
                        cardNumber: true,
                        iban: true,
                        isDefault: true,
                        ownerName: true
                    }
                }
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(parties.map((p)=>({
                ...p,
                defaultBankAccount: p.bankAccounts?.[0] ?? null
            })));
    } catch (err) {
        console.error("GET /api/parties error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "خطا در دریافت طرف‌حساب‌ها"
        }, {
            status: 500
        });
    }
}
async function POST(req) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = Number(me?.companyId);
        if (!companyId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "UNAUTHORIZED"
            }, {
                status: 401
            });
        }
        const body = await req.json();
        const kind = String(body.kind || "").toUpperCase().trim() || "CUSTOMER";
        const type = (body.type ? String(body.type).toUpperCase().trim() : null) || kindToType(kind);
        const name = normStr(body.name, 200);
        if (!name) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "نام الزامی است"
        }, {
            status: 400
        });
        const phone = normStr(body.phone, 40) || null;
        const mobile = normStr(body.mobile, 40) || null;
        const email = normStr(body.email, 120) || null;
        const nationalId = normStr(body.nationalId, 40) || null;
        const companyName = normStr(body.companyName, 200) || null;
        const address = normStr(body.address, 500) || null;
        const note = normStr(body.note, 500) || null;
        const description = normStr(body.description, 2000) || null;
        const bankAccount = body.bankAccount ?? null;
        const hasBank = bankAccount && (normStr(bankAccount.title, 200) || normStr(bankAccount.cardNumber, 30) || normStr(bankAccount.accountNumber, 40) || normStr(bankAccount.iban, 40));
        const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const party = await tx.party.create({
                data: {
                    companyId,
                    kind,
                    type,
                    name,
                    phone,
                    mobile,
                    email,
                    nationalId,
                    companyName,
                    address,
                    note,
                    description
                }
            });
            if (hasBank) {
                await tx.partyBankAccount.create({
                    data: {
                        companyId,
                        partyId: party.id,
                        title: normStr(bankAccount.title, 200) || "حساب",
                        bankName: normStr(bankAccount.bankName, 120) || null,
                        accountNumber: normStr(bankAccount.accountNumber, 40) || null,
                        cardNumber: normStr(bankAccount.cardNumber, 30) || null,
                        iban: normStr(bankAccount.iban, 40) || null,
                        ownerName: normStr(bankAccount.ownerName, 200) || null,
                        isDefault: true
                    }
                });
            }
            return party;
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(created, {
            status: 201
        });
    } catch (err) {
        console.error("POST /api/parties error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "خطا در ایجاد طرف حساب"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a7511fd5._.js.map