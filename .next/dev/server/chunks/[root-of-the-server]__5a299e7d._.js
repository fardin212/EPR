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
"[project]/app/api/treasury/payments/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/treasury/payments/route.ts
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
function mustInt(v, name) {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error(`${name} نامعتبر است`);
    return n;
}
function mustPositiveInt(v, name) {
    const n = mustInt(v, name);
    if (n <= 0) throw new Error(`${name} باید بزرگتر از صفر باشد`);
    return n;
}
function parseDate(v) {
    const d = v ? new Date(v) : new Date();
    if (Number.isNaN(d.getTime())) throw new Error("date نامعتبر است");
    return d;
}
function normEnum(v) {
    return String(v ?? "").trim().toUpperCase();
}
function safeStr(v, max = 500) {
    const s = String(v ?? "").trim();
    return s.length > max ? s.slice(0, max) : s;
}
function isTruthy(v) {
    return v === true || v === "true" || v === 1 || v === "1";
}
function httpError(message, status = 400) {
    const err = new Error(message);
    err.status = status;
    return err;
}
// قفل حسابداری: اگر تاریخ داخل بازه قفل باشد، اجازه ثبت/ویرایش نداریم
async function assertNotLocked(tx, companyId, date) {
    const lock = await tx.accountingPeriodLock.findFirst({
        where: {
            companyId,
            periodFrom: {
                lte: date
            },
            periodTo: {
                gte: date
            }
        },
        select: {
            id: true
        }
    });
    if (lock) throw httpError("این بازه حسابداری بسته شده و امکان ثبت/ویرایش وجود ندارد.", 423);
}
// ساخت سند حسابداری برای تراکنش خزانه
async function createVoucherForTreasuryTx(tx, args) {
    const { companyId, date, direction, amount, description, partyId, projectId, fromTreasuryAccountId, toTreasuryAccountId, legacy = false } = args;
    // ✅ قوانین کسب‌وکار باید THROW شوند، نه NextResponse
    if (direction === "IN" && !projectId) {
        throw httpError("برای ثبت دریافت از کارفرما، انتخاب پروژه الزامی است", 400);
    }
    // ✅ پرداخت پیمانکار بدون پروژه فقط در حالت legacy مجاز است
    if (direction === "OUT" && partyId && !projectId && !legacy) {
        throw httpError("برای پرداخت پیمانکار، پروژه الزامی است. اگر مربوط به پروژه‌های قبل است، گزینه «قدیمی/بدون پروژه» را فعال کن.", 400);
    }
    // refNo بعدی (ساده)
    const last = await tx.accountingVoucher.findFirst({
        orderBy: {
            id: "desc"
        },
        select: {
            refNo: true
        }
    });
    const lastNum = last?.refNo ? parseInt(last.refNo, 10) || 0 : 0;
    const refNo = String(lastNum + 1).padStart(5, "0");
    // حساب طرف حساب‌ها (AR/AP) - طبق ساختار فعلی شما
    const partyAcc = await tx.accountingAccount.findUnique({
        where: {
            code: "9000"
        }
    });
    if (!partyAcc) throw httpError("حساب 9000 (طرف حساب‌ها) یافت نشد", 500);
    // گرفتن حسابداری حساب خزانه از روی TreasuryAccount
    async function treasuryToAccountingAccountId(treasuryAccountId) {
        const tAcc = await tx.treasuryAccount.findUnique({
            where: {
                id: treasuryAccountId
            },
            select: {
                accountingAccountId: true
            }
        });
        if (!tAcc) throw httpError(`TreasuryAccount با id=${treasuryAccountId} یافت نشد`, 500);
        if (!tAcc.accountingAccountId) throw httpError(`برای خزانه ${treasuryAccountId} حساب حسابداری تعریف نشده`, 500);
        return tAcc.accountingAccountId;
    }
    const amountDec = amount;
    // الگو:
    // IN : بدهکار خزانه مقصد، بستانکار طرف حساب‌ها
    // OUT: بدهکار طرف حساب‌ها، بستانکار خزانه مبدا
    // XFER: بدهکار خزانه مقصد، بستانکار خزانه مبدا
    let voucherType = "GENERAL";
    let items = [];
    if (direction === "IN") {
        if (!toTreasuryAccountId) throw httpError("برای دریافت (IN) باید toAccountId مشخص شود", 400);
        const toAccId = await treasuryToAccountingAccountId(toTreasuryAccountId);
        items = [
            {
                accountId: toAccId,
                debit: amountDec,
                credit: 0,
                description: "دریافت به خزانه",
                projectId,
                partyId
            },
            {
                accountId: partyAcc.id,
                debit: 0,
                credit: amountDec,
                description: "طرف حساب‌ها",
                projectId,
                partyId
            }
        ];
    } else if (direction === "OUT") {
        if (!fromTreasuryAccountId) throw httpError("برای پرداخت (OUT) باید fromAccountId مشخص شود", 400);
        const fromAccId = await treasuryToAccountingAccountId(fromTreasuryAccountId);
        items = [
            {
                accountId: partyAcc.id,
                debit: amountDec,
                credit: 0,
                description: "طرف حساب‌ها",
                projectId,
                partyId
            },
            {
                accountId: fromAccId,
                debit: 0,
                credit: amountDec,
                description: "پرداخت از خزانه",
                projectId,
                partyId
            }
        ];
    } else {
        voucherType = "TRANSFER";
        if (!fromTreasuryAccountId || !toTreasuryAccountId) {
            throw httpError("برای انتقال (XFER) باید fromAccountId و toAccountId مشخص شود", 400);
        }
        const fromAccId = await treasuryToAccountingAccountId(fromTreasuryAccountId);
        const toAccId = await treasuryToAccountingAccountId(toTreasuryAccountId);
        items = [
            {
                accountId: toAccId,
                debit: amountDec,
                credit: 0,
                description: "انتقال به حساب",
                projectId,
                partyId: null
            },
            {
                accountId: fromAccId,
                debit: 0,
                credit: amountDec,
                description: "انتقال از حساب",
                projectId,
                partyId: null
            }
        ];
    }
    const totalDebit = items.reduce((s, it)=>s + Number(it.debit || 0), 0);
    const totalCredit = items.reduce((s, it)=>s + Number(it.credit || 0), 0);
    const voucher = await tx.accountingVoucher.create({
        data: {
            companyId,
            projectId,
            date,
            refNo,
            type: voucherType,
            description: description ?? undefined,
            partyId: partyId ?? undefined,
            totalDebit,
            totalCredit
        },
        select: {
            id: true
        }
    });
    await tx.accountingVoucherItem.createMany({
        data: items.map((it)=>({
                voucherId: voucher.id,
                accountId: it.accountId,
                description: it.description ?? null,
                debit: it.debit,
                credit: it.credit,
                projectId: it.projectId ?? null,
                partyId: it.partyId ?? null
            }))
    });
    // ✅ حتماً عدد
    const voucherId = Number(voucher.id);
    if (!Number.isFinite(voucherId) || voucherId <= 0) throw httpError("voucherId نامعتبر است", 500);
    return voucherId;
}
async function GET(req) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        if (!me) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Unauthorized", {
            status: 401
        });
        const companyId = Number(me.companyId);
        const { searchParams } = new URL(req.url);
        const take = Math.min(Math.max(Number(searchParams.get("take") || 100), 1), 500);
        const fromStr = searchParams.get("from");
        const toStr = searchParams.get("to");
        const accountIdStr = searchParams.get("accountId");
        const direction = searchParams.get("direction");
        const method = searchParams.get("method");
        const where = {
            companyId
        };
        if (fromStr) {
            const from = new Date(fromStr);
            if (!Number.isNaN(from.getTime())) where.date = {
                ...where.date || {},
                gte: from
            };
        }
        if (toStr) {
            const to = new Date(toStr);
            if (!Number.isNaN(to.getTime())) {
                to.setHours(23, 59, 59, 999);
                where.date = {
                    ...where.date || {},
                    lte: to
                };
            }
        }
        if (direction) where.direction = String(direction).toUpperCase();
        if (method) where.method = String(method).toUpperCase();
        if (accountIdStr) {
            const accountId = Number(accountIdStr);
            if (Number.isFinite(accountId)) where.OR = [
                {
                    fromAccountId: accountId
                },
                {
                    toAccountId: accountId
                }
            ];
        }
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].treasuryTransaction.findMany({
            where,
            orderBy: {
                date: "desc"
            },
            take,
            include: {
                party: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                fromAccount: {
                    select: {
                        id: true,
                        title: true,
                        type: true
                    }
                },
                toAccount: {
                    select: {
                        id: true,
                        title: true,
                        type: true
                    }
                },
                partyBankAccount: {
                    select: {
                        id: true,
                        title: true,
                        bankName: true,
                        cardNumber: true,
                        iban: true
                    }
                }
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(rows.map((t)=>({
                id: t.id,
                date: t.date.toISOString(),
                direction: t.direction,
                method: t.method,
                amount: Number(t.amount),
                fromAccount: t.fromAccount ? {
                    id: t.fromAccount.id,
                    title: t.fromAccount.title,
                    type: t.fromAccount.type
                } : null,
                toAccount: t.toAccount ? {
                    id: t.toAccount.id,
                    title: t.toAccount.title,
                    type: t.toAccount.type
                } : null,
                party: t.party ? {
                    id: t.party.id,
                    name: t.party.name
                } : null,
                project: t.project ? {
                    id: t.project.id,
                    title: t.project.title
                } : null,
                partyBankAccount: t.partyBankAccount ? {
                    id: t.partyBankAccount.id,
                    title: t.partyBankAccount.title,
                    bankName: t.partyBankAccount.bankName,
                    cardNumber: t.partyBankAccount.cardNumber,
                    iban: t.partyBankAccount.iban
                } : null,
                trackingNo: t.trackingNo ?? null,
                refNo: t.refNo ?? null,
                note: t.note ?? "",
                accountingVoucherId: t.accountingVoucherId ?? null
            })));
    } catch (e) {
        console.error(e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("خطا در دریافت تراکنش‌های خزانه", {
            status: 500
        });
    }
}
async function POST(req) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        if (!me) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("Unauthorized", {
            status: 401
        });
        const companyId = Number(me.companyId);
        const body = await req.json();
        const legacy = body.legacy === true || body.legacy === "true" || body.legacy === 1 || body.legacy === "1";
        const date = parseDate(body.date);
        const direction = normEnum(body.direction);
        if (![
            "IN",
            "OUT",
            "XFER"
        ].includes(direction)) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("direction باید یکی از IN | OUT | XFER باشد", {
                status: 400
            });
        }
        const method = normEnum(body.method || "TRANSFER");
        if (![
            "CASH",
            "CARD",
            "TRANSFER",
            "CHEQUE"
        ].includes(method)) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("method نامعتبر است", {
                status: 400
            });
        }
        const amount = mustPositiveInt(body.amount, "amount");
        const fromAccountId = body.fromAccountId != null ? mustInt(body.fromAccountId, "fromAccountId") : null;
        const toAccountId = body.toAccountId != null ? mustInt(body.toAccountId, "toAccountId") : null;
        const partyId = body.partyId != null ? mustInt(body.partyId, "partyId") : null;
        const projectId = body.projectId != null ? mustInt(body.projectId, "projectId") : null;
        const partyBankAccountId = body.partyBankAccountId != null ? mustInt(body.partyBankAccountId, "partyBankAccountId") : null;
        const trackingNo = safeStr(body.trackingNo, 100) || null;
        const refNo = safeStr(body.refNo, 100) || null;
        const note = safeStr(body.note ?? body.description, 1000) || null;
        const createVoucher = body.createVoucher !== undefined ? isTruthy(body.createVoucher) : method === "CHEQUE" ? false : true;
        // قوانین سخت
        if (direction === "IN") {
            if (!toAccountId) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("برای دریافت (IN) باید toAccountId مشخص شود", {
                status: 400
            });
            if (fromAccountId) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("برای دریافت (IN)، fromAccountId نباید پر شود", {
                status: 400
            });
        }
        if (direction === "OUT") {
            if (!fromAccountId) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("برای پرداخت (OUT) باید fromAccountId مشخص شود", {
                status: 400
            });
            if (toAccountId) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("برای پرداخت (OUT)، toAccountId نباید پر شود", {
                status: 400
            });
        }
        if (direction === "XFER") {
            if (!fromAccountId || !toAccountId) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("برای انتقال (XFER) باید fromAccountId و toAccountId مشخص شود", {
                status: 400
            });
            if (fromAccountId === toAccountId) return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"]("fromAccountId و toAccountId نباید برابر باشند", {
                status: 400
            });
        }
        const created = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            await assertNotLocked(tx, companyId, date);
            const t = await tx.treasuryTransaction.create({
                data: {
                    companyId,
                    date,
                    direction: direction,
                    method: method,
                    amount,
                    fromAccountId,
                    toAccountId,
                    partyId,
                    projectId,
                    partyBankAccountId,
                    trackingNo,
                    refNo,
                    note
                }
            });
            let voucherId = null;
            if (createVoucher) {
                voucherId = await createVoucherForTreasuryTx(tx, {
                    companyId,
                    date,
                    direction,
                    amount,
                    description: note,
                    partyId,
                    projectId,
                    fromTreasuryAccountId: fromAccountId,
                    toTreasuryAccountId: toAccountId
                });
                if (direction === "OUT" && partyId && !projectId && !legacy) {
                    throw httpError("پرداخت پیمانکار باید به پروژه وصل باشد (مگر قدیمی/بدون پروژه).", 400);
                }
                await tx.treasuryTransaction.update({
                    where: {
                        id: t.id
                    },
                    data: {
                        accountingVoucherId: voucherId
                    }
                });
            }
            return {
                transaction: t,
                accountingVoucherId: voucherId
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            ...created
        }, {
            status: 201
        });
    } catch (e) {
        console.error(e);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](e?.message || "خطا در ثبت تراکنش خزانه", {
            status: e?.status || 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5a299e7d._.js.map