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
"[project]/lib/adminGuard.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/adminGuard.ts
__turbopack_context__.s([
    "requireAdmin",
    ()=>requireAdmin,
    "requireRole",
    ()=>requireRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
async function getBaseUrl() {
    // ✅ Next 16: headers() is Promise
    const h = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") || "http";
    if (!host) return "http://localhost:3000";
    return `${proto}://${host}`;
}
async function fetchMe() {
    const base = await getBaseUrl();
    // ✅ Next 16: cookies() is Promise
    const c = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const res = await fetch(`${base}/api/auth/me`, {
        method: "GET",
        cache: "no-store",
        headers: {
            // انتقال کوکی‌ها به API برای تشخیص لاگین
            cookie: c.toString()
        }
    });
    if (!res.ok) return {};
    return await res.json();
}
async function requireAdmin() {
    const me = await fetchMe();
    if (!me.user) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    if (me.user.role !== "ADMIN") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/dashboard");
    return me.user;
}
async function requireRole(roles) {
    const me = await fetchMe();
    if (!me.user) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    if (!roles.includes(me.user.role)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/dashboard");
    return me.user;
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/app/dashboard/settings/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/dashboard/settings/actions.ts
/* __next_internal_action_entry_do_not_use__ [{"403d239f2e4f68bc757cd7033b4d4b52c85181f2a4":"adminSetUserActive","408c9de0a569146b8bcbb00d2926aeb5ad312f1efa":"adminCreateUser","40ab709d30d32ffd879dfc835559627ebe7e8c01e3":"adminUpdateUserRole","40c68b05d0f702360315db63a82ee7519c994d933b":"adminListUsers"},"",""] */ __turbopack_context__.s([
    "adminCreateUser",
    ()=>adminCreateUser,
    "adminListUsers",
    ()=>adminListUsers,
    "adminSetUserActive",
    ()=>adminSetUserActive,
    "adminUpdateUserRole",
    ()=>adminUpdateUserRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminGuard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/adminGuard.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function safeRole(role) {
    if (role === "ADMIN" || role === "MANAGER" || role === "STAFF") return role;
    return "STAFF";
}
async function adminListUsers(q) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminGuard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const query = (q || "").trim();
    const users = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findMany({
        where: query ? {
            OR: [
                {
                    email: {
                        contains: query
                    }
                },
                {
                    name: {
                        contains: query
                    }
                }
            ]
        } : undefined,
        orderBy: [
            {
                isActive: "desc"
            },
            {
                createdAt: "desc"
            }
        ],
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return users;
}
async function adminCreateUser(input) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminGuard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const name = (input.name || "").trim();
    const email = normalizeEmail(input.email || "");
    const password = (input.password || "").trim();
    const role = safeRole(input.role || "STAFF");
    if (!name) throw new Error("نام کاربر الزامی است.");
    if (!email || !email.includes("@")) throw new Error("ایمیل معتبر وارد کنید.");
    if (password.length < 6) throw new Error("رمز عبور باید حداقل ۶ کاراکتر باشد.");
    const exists = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            email
        }
    });
    if (exists) throw new Error("این ایمیل قبلاً ثبت شده است.");
    const passwordHash = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].hash(password, 10);
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.create({
        data: {
            name,
            email,
            passwordHash,
            role,
            isActive: true
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/settings");
    return {
        ok: true
    };
}
async function adminUpdateUserRole(input) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminGuard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const role = safeRole(input.role);
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.update({
        where: {
            id: input.userId
        },
        data: {
            role
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/settings");
    return {
        ok: true
    };
}
async function adminSetUserActive(input) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$adminGuard$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.update({
        where: {
            id: input.userId
        },
        data: {
            isActive: !!input.isActive
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard/settings");
    return {
        ok: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    adminListUsers,
    adminCreateUser,
    adminUpdateUserRole,
    adminSetUserActive
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(adminListUsers, "40c68b05d0f702360315db63a82ee7519c994d933b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(adminCreateUser, "408c9de0a569146b8bcbb00d2926aeb5ad312f1efa", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(adminUpdateUserRole, "40ab709d30d32ffd879dfc835559627ebe7e8c01e3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(adminSetUserActive, "403d239f2e4f68bc757cd7033b4d4b52c85181f2a4", null);
}),
"[project]/.next-internal/server/app/dashboard/settings/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/dashboard/settings/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$settings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/dashboard/settings/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/.next-internal/server/app/dashboard/settings/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/dashboard/settings/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "403d239f2e4f68bc757cd7033b4d4b52c85181f2a4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$settings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminSetUserActive"],
    "408c9de0a569146b8bcbb00d2926aeb5ad312f1efa",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$settings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminCreateUser"],
    "40ab709d30d32ffd879dfc835559627ebe7e8c01e3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$settings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminUpdateUserRole"],
    "40c68b05d0f702360315db63a82ee7519c994d933b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$settings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminListUsers"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$settings$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$dashboard$2f$settings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/dashboard/settings/page/actions.js { ACTIONS_MODULE0 => "[project]/app/dashboard/settings/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$settings$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/dashboard/settings/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__984b1881._.js.map