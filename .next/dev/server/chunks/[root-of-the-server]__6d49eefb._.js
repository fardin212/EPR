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
"[project]/app/api/parties/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/parties/[id]/route.ts
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
function normStr(v, max = 200) {
    const s = String(v ?? "").trim();
    if (!s) return null;
    return s.length > max ? s.slice(0, max) : s;
}
function normIban(v) {
    const s = normStr(v, 34);
    if (!s) return null;
    return s.replace(/\s+/g, "").toUpperCase();
}
function normCard(v) {
    const s = normStr(v, 19);
    if (!s) return null;
    return s.replace(/[^\d]/g, "").slice(0, 16) || null;
}
function normAccountNo(v) {
    const s = normStr(v, 64);
    if (!s) return null;
    return s.replace(/\s+/g, " ");
}
async function GET(_req, context) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = me.companyId;
        const { id } = await context.params; // ✅ fix Next params Promise
        const partyId = Number(id);
        if (!Number.isFinite(partyId) || partyId <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "شناسه نامعتبر است"
            }, {
                status: 400
            });
        }
        const party = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.findFirst({
            where: {
                id: partyId,
                companyId
            },
            include: {
                contractorProfile: {
                    include: {
                        skills: true
                    }
                },
                employee: true,
                partyBankAccounts: {
                    orderBy: [
                        {
                            isDefault: "desc"
                        },
                        {
                            id: "desc"
                        }
                    ],
                    select: {
                        id: true,
                        title: true,
                        bankName: true,
                        accountNo: true,
                        cardNumber: true,
                        iban: true,
                        isDefault: true
                    }
                }
            }
        });
        if (!party) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "یافت نشد"
            }, {
                status: 404
            });
        }
        const bankAccounts = party.partyBankAccounts ?? [];
        const defaultBankAccount = bankAccounts.find((b)=>b.isDefault) ?? bankAccounts[0] ?? null;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ...party,
            bankAccounts,
            defaultBankAccount,
            partyBankAccounts: undefined
        });
    } catch (err) {
        console.error("GET /api/parties/[id] error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "خطا در دریافت طرف‌حساب"
        }, {
            status: 500
        });
    }
}
async function PATCH(req, context) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = me.companyId;
        const { id } = await context.params; // ✅ fix Next params Promise
        const partyId = Number(id);
        if (!Number.isFinite(partyId) || partyId <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "شناسه نامعتبر است"
            }, {
                status: 400
            });
        }
        const body = await req.json();
        const { name, kind, type, phone, mobile, email, nationalId, companyName, address, note, description, contractor, bankAccount } = body;
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.findFirst({
            where: {
                id: partyId,
                companyId
            },
            include: {
                contractorProfile: {
                    include: {
                        skills: true
                    }
                }
            }
        });
        if (!existing) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "یافت نشد"
            }, {
                status: 404
            });
        }
        let contractorUpdate = undefined;
        if (contractor !== undefined) {
            if (!existing.contractorProfile && contractor) {
                contractorUpdate = {
                    create: {
                        companyId,
                        specialty: contractor.specialty ?? undefined,
                        note: contractor.note ?? undefined,
                        dayRate: contractor.dayRate ?? undefined,
                        skills: contractor.skills ? {
                            create: contractor.skills.map((s)=>({
                                    name: s.name,
                                    level: s.level,
                                    category: s.category ?? "",
                                    projectTypeId: s.projectTypeId ?? null,
                                    description: s.description
                                }))
                        } : undefined
                    }
                };
            } else if (existing.contractorProfile && contractor === null) {
                contractorUpdate = {
                    delete: true
                };
            } else if (existing.contractorProfile && contractor) {
                contractorUpdate = {
                    update: {
                        specialty: contractor.specialty ?? undefined,
                        note: contractor.note ?? undefined,
                        dayRate: contractor.dayRate ?? undefined
                    }
                };
                if (contractor.skills) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].contractorSkill.deleteMany({
                        where: {
                            contractorId: existing.contractorProfile.id
                        }
                    });
                    contractorUpdate.update.skills = {
                        create: contractor.skills.map((s)=>({
                                name: s.name,
                                level: s.level,
                                category: s.category ?? "",
                                projectTypeId: s.projectTypeId ?? null,
                                description: s.description
                            }))
                    };
                }
            }
        }
        // ✅ بانک: ساخت/آپدیت حساب پیش‌فرض بدون DELETE (تا اگر در پرداخت‌ها استفاده شده، نشکند)
        const bankTitle = normStr(bankAccount?.title, 120);
        const bankName = normStr(bankAccount?.bankName, 120);
        const accountNo = normAccountNo(bankAccount?.accountNo);
        const cardNumber = normCard(bankAccount?.cardNumber);
        const iban = normIban(bankAccount?.iban);
        const hasBank = bankAccount !== undefined && (bankTitle || bankName || accountNo || cardNumber || iban);
        const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const party = await tx.party.update({
                where: {
                    id: partyId
                },
                data: {
                    name,
                    kind,
                    type,
                    phone,
                    mobile,
                    email,
                    nationalId,
                    companyName,
                    address,
                    note,
                    description,
                    contractorProfile: contractorUpdate
                },
                include: {
                    contractorProfile: {
                        include: {
                            skills: true
                        }
                    },
                    employee: true
                }
            });
            if (bankAccount === null) {
            // اگر خواستی بعداً UI برای "غیرفعال کردن" بسازیم. فعلاً حذف نمی‌کنیم.
            // می‌گذاریم دست‌نخورده بماند تا تراکنش‌ها نشکنند.
            } else if (hasBank) {
                // پیش‌فرض‌های قبلی خاموش
                await tx.partyBankAccount.updateMany({
                    where: {
                        partyId,
                        isDefault: true
                    },
                    data: {
                        isDefault: false
                    }
                });
                if (bankAccount?.id) {
                    await tx.partyBankAccount.update({
                        where: {
                            id: Number(bankAccount.id)
                        },
                        data: {
                            title: bankTitle ?? undefined,
                            bankName,
                            accountNo,
                            cardNumber,
                            iban,
                            isDefault: true
                        }
                    });
                } else {
                    await tx.partyBankAccount.create({
                        data: {
                            companyId,
                            partyId,
                            title: bankTitle ?? "حساب پیش‌فرض",
                            bankName,
                            accountNo,
                            cardNumber,
                            iban,
                            isDefault: true
                        }
                    });
                }
            }
            const bankAccounts = await tx.partyBankAccount.findMany({
                where: {
                    partyId
                },
                orderBy: [
                    {
                        isDefault: "desc"
                    },
                    {
                        id: "desc"
                    }
                ],
                select: {
                    id: true,
                    title: true,
                    bankName: true,
                    accountNo: true,
                    cardNumber: true,
                    iban: true,
                    isDefault: true
                }
            });
            const defaultBankAccount = bankAccounts.find((b)=>b.isDefault) ?? bankAccounts[0] ?? null;
            return {
                party,
                bankAccounts,
                defaultBankAccount
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(updated);
    } catch (err) {
        console.error("PATCH /api/parties/[id] error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "خطا در ویرایش طرف‌حساب"
        }, {
            status: 500
        });
    }
}
async function DELETE(_req, context) {
    try {
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$authMe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getMeServer"])();
        const companyId = me.companyId;
        const { id } = await context.params; // ✅ fix Next params Promise
        const partyId = Number(id);
        if (!Number.isFinite(partyId) || partyId <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "شناسه نامعتبر است"
            }, {
                status: 400
            });
        }
        // فقط داخل شرکت خودت حذف شود
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.findFirst({
            where: {
                id: partyId,
                companyId
            },
            select: {
                id: true
            }
        });
        if (!existing) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "یافت نشد"
        }, {
            status: 404
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].party.delete({
            where: {
                id: partyId
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true
        });
    } catch (err) {
        console.error("DELETE /api/parties/[id] error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "خطا در حذف. احتمالاً این طرف‌حساب در پروژه، وچر یا رکورد دیگری استفاده شده است."
        }, {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6d49eefb._.js.map