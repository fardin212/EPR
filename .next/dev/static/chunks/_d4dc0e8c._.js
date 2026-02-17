(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/dashboard/invoices/_components/InvoiceFormClient.tsx
__turbopack_context__.s([
    "default",
    ()=>InvoiceFormClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
/* ===================== Number utils (حل مشکل ورود اعداد فارسی + جداکننده‌ها) ===================== */ function normalizeDigits(input) {
    const map = {
        "۰": "0",
        "۱": "1",
        "۲": "2",
        "۳": "3",
        "۴": "4",
        "۵": "5",
        "۶": "6",
        "۷": "7",
        "۸": "8",
        "۹": "9",
        "٠": "0",
        "١": "1",
        "٢": "2",
        "٣": "3",
        "٤": "4",
        "٥": "5",
        "٦": "6",
        "٧": "7",
        "٨": "8",
        "٩": "9"
    };
    return String(input ?? "").split("").map((ch)=>map[ch] ?? ch).join("").replaceAll("٬", "").replaceAll("٫", "").replaceAll(",", "").replaceAll("،", "").replaceAll("\u00A0", "").replaceAll(" ", "").trim();
}
function safeNum(v) {
    const s = normalizeDigits(String(v ?? ""));
    if (!s) return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}
function moneyFa(n) {
    return Number(n || 0).toLocaleString("fa-IR");
}
/* ===================== MoneyInput (حل قطعی مشکل تایپ مبلغ) ===================== */ function MoneyInput({ value, onValueChange, placeholder, className = "input", hint }) {
    _s();
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(value ? moneyFa(value) : "");
    const [focused, setFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MoneyInput.useEffect": ()=>{
            if (!focused) setText(value ? moneyFa(value) : "");
        }
    }["MoneyInput.useEffect"], [
        value,
        focused
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                className: className,
                inputMode: "numeric",
                placeholder: placeholder,
                value: text,
                onFocus: ()=>{
                    setFocused(true);
                    const raw = normalizeDigits(text);
                    setText(raw || "");
                },
                onChange: (e)=>{
                    const v = e.target.value;
                    setText(v);
                    onValueChange(safeNum(v));
                },
                onBlur: ()=>{
                    setFocused(false);
                    setText(value ? moneyFa(value) : "");
                }
            }, void 0, false, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            hint ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-[11px] text-zinc-500 mt-1",
                children: hint
            }, void 0, false, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 112,
                columnNumber: 15
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
_s(MoneyInput, "IqQLEO7TKE4exh+9sQeWh6Z+I8g=");
_c = MoneyInput;
function QtyInput({ value, onValueChange, placeholder, className = "input" }) {
    _s1();
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(value ? String(value) : "");
    const [focused, setFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QtyInput.useEffect": ()=>{
            if (!focused) setText(value ? String(value) : "");
        }
    }["QtyInput.useEffect"], [
        value,
        focused
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        className: className,
        inputMode: "numeric",
        placeholder: placeholder,
        value: text,
        onFocus: ()=>setFocused(true),
        onChange: (e)=>{
            setText(e.target.value);
            onValueChange(safeNum(e.target.value));
        },
        onBlur: ()=>{
            setFocused(false);
            setText(value ? String(value) : "");
        }
    }, void 0, false, {
        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this);
}
_s1(QtyInput, "HOsDgdKQDKLalVXI1rJY//uH+lM=");
_c1 = QtyInput;
/* ===================== Jalali/Gregorian (بدون کتابخانه) ===================== */ function div(a, b) {
    return ~~(a / b);
}
function mod(a, b) {
    return a - ~~(a / b) * b;
}
function g2d(gy, gm, gd) {
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
}
function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div(mod(j, 1461), 4) * 5 + 308;
    const gd = div(mod(i, 153), 5) + 1;
    const gm = mod(div(i, 153), 12) + 1;
    const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return {
        gy,
        gm,
        gd
    };
}
function jalCal(jy) {
    const breaks = [
        -61,
        9,
        38,
        199,
        426,
        686,
        756,
        818,
        1111,
        1181,
        1210,
        1635,
        2060,
        2097,
        2192,
        2262,
        2324,
        2394,
        2456,
        3178
    ];
    const bl = breaks.length;
    let gy = jy + 621;
    let leapJ = -14;
    let jp = breaks[0];
    let jm = 0;
    let jump = 0;
    for(let i = 1; i < bl; i += 1){
        jm = breaks[i];
        jump = jm - jp;
        if (jy < jm) break;
        leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
        jp = jm;
    }
    let n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return {
        leap,
        gy,
        march
    };
}
function j2d(jy, jm, jd) {
    const r = jalCal(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}
function d2j(jdn) {
    const g = d2g(jdn);
    let jy = g.gy - 621;
    const r = jalCal(jy);
    const jdn1f = g2d(g.gy, 3, r.march);
    let k = jdn - jdn1f;
    let jm = 0;
    let jd = 0;
    if (k >= 0) {
        if (k <= 185) {
            jm = 1 + div(k, 31);
            jd = mod(k, 31) + 1;
            return {
                jy,
                jm,
                jd
            };
        } else {
            k -= 186;
        }
    } else {
        jy -= 1;
        k += 179;
        if (r.leap === 1) k += 1;
    }
    jm = 7 + div(k, 30);
    jd = mod(k, 30) + 1;
    return {
        jy,
        jm,
        jd
    };
}
function pad2(n) {
    return String(n).padStart(2, "0");
}
function isoToJalali(iso) {
    const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "";
    const gy = Number(m[1]);
    const gm = Number(m[2]);
    const gd = Number(m[3]);
    const j = d2j(g2d(gy, gm, gd));
    return `${j.jy}/${pad2(j.jm)}/${pad2(j.jd)}`;
}
function jalaliToIso(jal) {
    const s = normalizeDigits(jal).replaceAll("-", "/");
    const m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!m) return null;
    const jy = Number(m[1]);
    const jm = Number(m[2]);
    const jd = Number(m[3]);
    if (!jy || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
    const g = d2g(j2d(jy, jm, jd));
    return `${g.gy}-${pad2(g.gm)}-${pad2(g.gd)}`;
}
function InvoiceFormClient({ mode, invoiceId, defaultDocType = "PROFORMA", initialData, initialLinks }) {
    _s2();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [projectId, setProjectId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.projectId ?? initialLinks?.projectId ?? null);
    const [partyId, setPartyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.partyId ?? initialLinks?.partyId ?? null);
    const [docType, setDocType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.docType ?? defaultDocType);
    const initialIsoDate = initialData?.date ?? new Date().toISOString().slice(0, 10);
    const initialIsoDue = initialData?.dueDate ?? "";
    const [dateJ, setDateJ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(isoToJalali(initialIsoDate));
    const [dueDateJ, setDueDateJ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialIsoDue ? isoToJalali(initialIsoDue) : "");
    const [customerName, setCustomerName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.customerName ?? "");
    const [customerMobile, setCustomerMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.customerMobile ?? "");
    const [customerPhone, setCustomerPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.customerPhone ?? "");
    const [customerAddress, setCustomerAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.customerAddress ?? "");
    // ✅ default spec یکدست با DB
    const [spec, setSpec] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.spec ?? {
        door: "P.V.C",
        window: "P.V.C",
        strapSheet: "سیم‌کشی روکار استاندارد",
        gutter: "ندارد",
        service: "ندارد"
    });
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.items?.length ? initialData.items : [
        {
            title: "ساخت کانکس طبق مشخصات",
            qty: 1,
            unit: "عدد",
            unitPrice: 0
        }
    ]);
    const [discount, setDiscount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.discount ?? 0);
    const [shipping, setShipping] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.shipping ?? 0);
    const [tax, setTax] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.tax ?? 0);
    const [deliveryTime, setDeliveryTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.deliveryTime ?? "");
    const [storagePenalty, setStoragePenalty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.storagePenalty ?? "");
    const [transportTerms, setTransportTerms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.transportTerms ?? "");
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.description ?? "");
    const [prepayPercent, setPrepayPercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Number(initialData?.prepayPercent ?? 50));
    const [paymentTerms, setPaymentTerms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.paymentTerms ?? "الباقی به صورت توافقی");
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialData?.notes ?? "");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const computed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InvoiceFormClient.useMemo[computed]": ()=>{
            const subtotal = items.reduce({
                "InvoiceFormClient.useMemo[computed].subtotal": (s, it)=>s + Math.round((it.qty || 0) * (it.unitPrice || 0))
            }["InvoiceFormClient.useMemo[computed].subtotal"], 0);
            const total = subtotal - (discount || 0) + (shipping || 0) + (tax || 0);
            return {
                subtotal,
                total
            };
        }
    }["InvoiceFormClient.useMemo[computed]"], [
        items,
        discount,
        shipping,
        tax
    ]);
    function updateItem(i, patch) {
        setItems((prev)=>prev.map((x, idx)=>idx === i ? {
                    ...x,
                    ...patch
                } : x));
    }
    function addItem() {
        setItems((prev)=>[
                ...prev,
                {
                    title: "",
                    qty: 1,
                    unit: "عدد",
                    unitPrice: 0
                }
            ]);
    }
    function removeItem(i) {
        setItems((prev)=>prev.filter((_, idx)=>idx !== i));
    }
    function setSpecField(key, value) {
        setSpec((prev)=>({
                ...prev,
                [key]: value
            }));
    }
    async function submit() {
        if (loading) return;
        if (!customerName.trim()) {
            alert("نام مشتری الزامی است");
            return;
        }
        const isoDate = jalaliToIso(dateJ);
        if (!isoDate) {
            alert("تاریخ سند نامعتبر است. نمونه صحیح: 1404/10/11");
            return;
        }
        const isoDue = dueDateJ ? jalaliToIso(dueDateJ) : null;
        if (dueDateJ && !isoDue) {
            alert("تاریخ سررسید نامعتبر است. نمونه صحیح: 1404/10/11");
            return;
        }
        const cleanItems = items.map((it)=>({
                title: String(it.title || "").trim(),
                qty: Number(it.qty || 0),
                unit: String(it.unit || "").trim() || null,
                unitPrice: Math.round(Number(it.unitPrice || 0)),
                note: String(it.note || "").trim() || null
            })).filter((x)=>x.title && x.qty > 0);
        if (!cleanItems.length) {
            alert("حداقل یک آیتم قیمت لازم است");
            return;
        }
        const payload = {
            docType,
            date: isoDate,
            dueDate: isoDue,
            projectId: projectId || null,
            partyId: partyId || null,
            customerName: customerName.trim(),
            customerMobile: customerMobile.trim() || null,
            customerPhone: customerPhone.trim() || null,
            customerAddress: customerAddress.trim() || null,
            discount: Math.round(Number(discount || 0)),
            shipping: Math.round(Number(shipping || 0)),
            tax: Math.round(Number(tax || 0)),
            deliveryTime: deliveryTime.trim() || null,
            storagePenalty: storagePenalty.trim() || null,
            transportTerms: transportTerms.trim() || null,
            description: description.trim() || null,
            prepayPercent: Number(prepayPercent || 0) || null,
            paymentTerms: paymentTerms.trim() || null,
            notes: notes.trim() || null,
            items: cleanItems,
            spec
        };
        const url = mode === "create" ? "/api/invoices" : `/api/invoices/${invoiceId}`;
        const method = mode === "create" ? "POST" : "PATCH";
        try {
            setLoading(true);
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                alert(await res.text());
                return;
            }
            const data = await res.json();
            router.push(`/dashboard/invoices/${data.id ?? invoiceId}`);
        } finally{
            setLoading(false);
        }
    }
    const specFields = [
        {
            no: 1,
            key: "dimensions",
            label: "ابعاد",
            placeholder: "مثلاً 2.90×5.80"
        },
        {
            no: 2,
            key: "area",
            label: "متراژ",
            placeholder: "مثلاً 16.82"
        },
        {
            no: 3,
            key: "chassis",
            label: "شاسی",
            placeholder: "مثلاً تیرآهن"
        },
        {
            no: 4,
            key: "profile",
            label: "پروفیل",
            placeholder: "مثلاً 80 و 1.2"
        },
        {
            no: 5,
            key: "bodySheet",
            label: "ورق بدنه",
            placeholder: "مثلاً سایدینگ رنگ استاتیک"
        },
        {
            no: 6,
            key: "roofSheet",
            label: "ورق سقف",
            placeholder: "مثلاً کرکره"
        },
        {
            no: 7,
            key: "interior",
            label: "داخل کار",
            placeholder: "مثلاً C.V.P"
        },
        {
            no: 8,
            key: "insulationType",
            label: "نوع عایق",
            placeholder: "مثلاً پشم شیشه / پشم سنگ"
        },
        {
            no: 9,
            key: "floor",
            label: "کف",
            placeholder: "مثلاً تخته سه‌لایی / کف‌پوش"
        },
        {
            no: 10,
            key: "bodyColor",
            label: "رنگ بدنه",
            placeholder: "به دلخواه مشتری"
        },
        {
            no: 11,
            key: "door",
            label: "درب (UPVC)",
            placeholder: "مثلاً U.P.V.C"
        },
        {
            no: 12,
            key: "window",
            label: "پنجره (UPVC)",
            placeholder: "مثلاً U.P.V.C"
        },
        {
            no: 13,
            key: "extras",
            label: "لوازم اضافه",
            placeholder: "مثلاً حفاظ پنجره"
        },
        {
            no: 14,
            key: "strapSheet",
            label: "سیم‌کشی",
            placeholder: "مثلاً سیم‌کشی توکار استاندارد"
        },
        {
            no: 15,
            key: "gutter",
            label: "آبدارخانه",
            placeholder: "ندارد / دارد"
        },
        {
            no: 16,
            key: "service",
            label: "سرویس",
            placeholder: "ندارد / دارد"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        dir: "rtl",
        className: "jsx-3f16a5e2d46f52ad" + " " + "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3f16a5e2d46f52ad" + " " + "flex items-center justify-between flex-wrap gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "text-xl font-extrabold",
                                children: mode === "create" ? "صدور سند جدید" : "ویرایش سند"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 465,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "text-sm text-zinc-500",
                                children: "پیش‌فاکتور یا فاکتور رسمی (مبالغ به ریال)"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 466,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 464,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "flex gap-2 items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "min-w-[160px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: docType,
                                        onChange: (e)=>setDocType(e.target.value),
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "input",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "PROFORMA",
                                                className: "jsx-3f16a5e2d46f52ad",
                                                children: "پیش‌فاکتور"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 472,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "INVOICE",
                                                className: "jsx-3f16a5e2d46f52ad",
                                                children: "فاکتور رسمی"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 473,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 471,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-[11px] text-zinc-500 mt-1",
                                        children: "پیش‌فاکتور: بدون ارزش مالیاتی | رسمی: قابل ثبت حسابداری"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 475,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 470,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: submit,
                                disabled: loading,
                                className: "jsx-3f16a5e2d46f52ad" + " " + "btn-primary",
                                children: loading ? "در حال ذخیره..." : mode === "create" ? "ثبت سند" : "ذخیره"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 478,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 469,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 463,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3f16a5e2d46f52ad" + " " + "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "card-title",
                        children: "تاریخ‌ها (شمسی)"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 486,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "grid md:grid-cols-3 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-xs text-zinc-500 mb-1",
                                        children: "تاریخ سند"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 489,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        placeholder: "مثلاً 1404/10/11",
                                        value: dateJ,
                                        onChange: (e)=>setDateJ(e.target.value),
                                        inputMode: "numeric",
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 490,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 488,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-xs text-zinc-500 mb-1",
                                        children: "تاریخ سررسید (اختیاری)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 493,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        placeholder: "مثلاً 1404/10/20",
                                        value: dueDateJ,
                                        onChange: (e)=>setDueDateJ(e.target.value),
                                        inputMode: "numeric",
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 494,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 492,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "text-xs text-zinc-500 flex items-center",
                                children: [
                                    "فرمت صحیح: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "mx-1 font-bold",
                                        children: "YYYY/MM/DD"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 497,
                                        columnNumber: 24
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 496,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 487,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 485,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3f16a5e2d46f52ad" + " " + "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "card-title",
                        children: "اتصال به پروژه/طرف حساب (اختیاری)"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 504,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "grid md:grid-cols-2 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-xs text-zinc-500 mb-1",
                                        children: "Project ID"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 507,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(QtyInput, {
                                        value: projectId ?? 0,
                                        onValueChange: (n)=>setProjectId(n ? n : null),
                                        placeholder: "مثلاً 12"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 508,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 506,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-xs text-zinc-500 mb-1",
                                        children: "Party ID (مشتری)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 511,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(QtyInput, {
                                        value: partyId ?? 0,
                                        onValueChange: (n)=>setPartyId(n ? n : null),
                                        placeholder: "مثلاً 45"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 512,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 510,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 505,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 503,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3f16a5e2d46f52ad" + " " + "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "card-title",
                        children: "مشخصات خریدار"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 519,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "grid md:grid-cols-4 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                placeholder: "نام/شرکت *",
                                value: customerName,
                                onChange: (e)=>setCustomerName(e.target.value),
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 521,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                placeholder: "همراه",
                                value: customerMobile,
                                onChange: (e)=>setCustomerMobile(e.target.value),
                                inputMode: "tel",
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 522,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                placeholder: "تلفن",
                                value: customerPhone,
                                onChange: (e)=>setCustomerPhone(e.target.value),
                                inputMode: "tel",
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 523,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                placeholder: "آدرس",
                                value: customerAddress,
                                onChange: (e)=>setCustomerAddress(e.target.value),
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input md:col-span-4"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 524,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 520,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 518,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3f16a5e2d46f52ad" + " " + "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "flex items-center justify-between gap-3 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "card-title m-0",
                                children: "مشخصات فنی (مطابق PDF)"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 531,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "text-xs text-zinc-500",
                                children: "آیتم‌ها به ترتیب شماره‌گذاری PDF (۱ تا ۱۶)"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 532,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 530,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "grid md:grid-cols-3 gap-3 mt-3",
                        children: specFields.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-xs text-zinc-600 mb-1 flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "badge",
                                                children: f.no
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 539,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "font-bold",
                                                children: f.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 540,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 538,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        placeholder: f.placeholder,
                                        value: spec[f.key] || "",
                                        onChange: (e)=>setSpecField(f.key, e.target.value),
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 542,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, String(f.key), true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 537,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 535,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 529,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3f16a5e2d46f52ad" + " " + "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "card-title",
                        children: "آیتم‌های قیمت"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 555,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "overflow-auto border rounded-xl",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "jsx-3f16a5e2d46f52ad" + " " + "w-full text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: "jsx-3f16a5e2d46f52ad" + " " + "bg-zinc-50",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "jsx-3f16a5e2d46f52ad",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "p-2 text-right",
                                                children: "شرح"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 561,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "p-2 text-right w-24",
                                                children: "تعداد"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 562,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "p-2 text-right w-24",
                                                children: "واحد"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 563,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "p-2 text-right w-52",
                                                children: "قیمت واحد (ریال)"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 564,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "p-2 text-right w-44",
                                                children: "مبلغ (ریال)"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 565,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "p-2 w-10"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 566,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 560,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                    lineNumber: 559,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    className: "jsx-3f16a5e2d46f52ad",
                                    children: items.map((it, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "jsx-3f16a5e2d46f52ad" + " " + "border-t align-top",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "jsx-3f16a5e2d46f52ad" + " " + "p-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            placeholder: "مثلاً ساخت کانکس طبق مشخصات",
                                                            value: it.title,
                                                            onChange: (e)=>updateItem(i, {
                                                                    title: e.target.value
                                                                }),
                                                            className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                            lineNumber: 573,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            placeholder: "توضیح/یادداشت (اختیاری)",
                                                            value: it.note || "",
                                                            onChange: (e)=>updateItem(i, {
                                                                    note: e.target.value
                                                                }),
                                                            className: "jsx-3f16a5e2d46f52ad" + " " + "input mt-2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                            lineNumber: 574,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                    lineNumber: 572,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "jsx-3f16a5e2d46f52ad" + " " + "p-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(QtyInput, {
                                                        value: it.qty,
                                                        onValueChange: (n)=>updateItem(i, {
                                                                qty: n
                                                            }),
                                                        placeholder: "مثلاً 1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                        lineNumber: 578,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                    lineNumber: 577,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "jsx-3f16a5e2d46f52ad" + " " + "p-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        placeholder: "عدد",
                                                        value: it.unit || "",
                                                        onChange: (e)=>updateItem(i, {
                                                                unit: e.target.value
                                                            }),
                                                        className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                        lineNumber: 582,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                    lineNumber: 581,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "jsx-3f16a5e2d46f52ad" + " " + "p-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MoneyInput, {
                                                        value: it.unitPrice,
                                                        onValueChange: (n)=>updateItem(i, {
                                                                unitPrice: n
                                                            }),
                                                        placeholder: "مثلاً 1500000000",
                                                        hint: "در حال تایپ، فرمت نمی‌شود. بعد از خروج از فیلد، خودکار فرمت می‌شود."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                        lineNumber: 586,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                    lineNumber: 585,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "jsx-3f16a5e2d46f52ad" + " " + "p-2 font-extrabold whitespace-nowrap",
                                                    children: moneyFa((it.qty || 0) * (it.unitPrice || 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                    lineNumber: 594,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "jsx-3f16a5e2d46f52ad" + " " + "p-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>removeItem(i),
                                                        type: "button",
                                                        title: "حذف آیتم",
                                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-red-600",
                                                        children: "✕"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                    lineNumber: 598,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                            lineNumber: 571,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                    lineNumber: 569,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                            lineNumber: 558,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 557,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: addItem,
                        type: "button",
                        className: "jsx-3f16a5e2d46f52ad" + " " + "btn-secondary mt-3",
                        children: "+ افزودن آیتم"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 609,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 554,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3f16a5e2d46f52ad" + " " + "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "card-title",
                        children: "جمع‌بندی"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 616,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "grid md:grid-cols-4 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "md:col-span-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-xs text-zinc-500 mb-1",
                                        children: "جمع جزء (ریال)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 620,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "input flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "text-zinc-500",
                                                children: "Subtotal"
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 622,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-3f16a5e2d46f52ad" + " " + "font-extrabold",
                                                children: moneyFa(computed.subtotal)
                                            }, void 0, false, {
                                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                                lineNumber: 623,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 621,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 619,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MoneyInput, {
                                value: discount,
                                onValueChange: setDiscount,
                                placeholder: "تخفیف (ریال)"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 627,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MoneyInput, {
                                value: shipping,
                                onValueChange: setShipping,
                                placeholder: "هزینه حمل (ریال)"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 628,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MoneyInput, {
                                value: tax,
                                onValueChange: setTax,
                                placeholder: "مالیات (ریال)"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 629,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "md:col-span-4 flex items-center justify-between border-t pt-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "text-sm text-zinc-500",
                                        children: "مبلغ نهایی (ریال)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 632,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "font-extrabold text-xl",
                                        children: moneyFa(computed.total)
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 633,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 631,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 618,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 615,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-3f16a5e2d46f52ad" + " " + "card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "card-title",
                        children: "توضیحات و شرایط"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 640,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-3f16a5e2d46f52ad" + " " + "grid md:grid-cols-3 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                placeholder: "زمان تحویل (مثلاً 10 روز کاری)",
                                value: deliveryTime,
                                onChange: (e)=>setDeliveryTime(e.target.value),
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 643,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                placeholder: "حمل (مثلاً هزینه حمل و بارگیری به عهده مشتری)",
                                value: transportTerms,
                                onChange: (e)=>setTransportTerms(e.target.value),
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 644,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                placeholder: "انبارداری/تاخیر (اختیاری)",
                                value: storagePenalty,
                                onChange: (e)=>setStoragePenalty(e.target.value),
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 645,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                placeholder: "توضیحات فنی تکمیلی (مثلاً یکطرف شیب باکس دار)",
                                value: description,
                                onChange: (e)=>setDescription(e.target.value),
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 647,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-3f16a5e2d46f52ad" + " " + "md:col-span-2 grid grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(QtyInput, {
                                        value: prepayPercent,
                                        onValueChange: setPrepayPercent,
                                        placeholder: "درصد پیش‌پرداخت (مثلاً 50)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 650,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        placeholder: "شرایط الباقی (مثلاً تسویه هنگام تحویل)",
                                        value: paymentTerms,
                                        onChange: (e)=>setPaymentTerms(e.target.value),
                                        className: "jsx-3f16a5e2d46f52ad" + " " + "input"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                        lineNumber: 651,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 649,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                placeholder: "یادداشت‌های تکمیلی (اختیاری)",
                                value: notes,
                                onChange: (e)=>setNotes(e.target.value),
                                className: "jsx-3f16a5e2d46f52ad" + " " + "input md:col-span-3 min-h-[120px]"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                                lineNumber: 654,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                        lineNumber: 642,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
                lineNumber: 639,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "3f16a5e2d46f52ad",
                children: ".card{background:#fff;border:1px solid #e4e4e7;border-radius:20px;padding:16px}.card-title{margin-bottom:12px;font-weight:800}.input{background:#fff;border:1px solid #e4e4e7;border-radius:14px;width:100%;padding:10px 12px}.btn-primary{color:#fff;opacity:1;background:#111827;border-radius:16px;padding:10px 16px;font-weight:800}.btn-primary:disabled{opacity:.6;cursor:not-allowed}.btn-secondary{background:#f4f4f5;border-radius:14px;padding:8px 12px;font-weight:700}.badge{color:#fff;background:#111827;border-radius:999px;justify-content:center;align-items:center;min-width:24px;height:20px;padding:0 6px;font-size:12px;font-weight:800;line-height:1;display:inline-flex}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/invoices/_components/InvoiceFormClient.tsx",
        lineNumber: 462,
        columnNumber: 5
    }, this);
}
_s2(InvoiceFormClient, "kyT1Llz/U2PjgBRvDkzmKcFnf6I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c2 = InvoiceFormClient;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "MoneyInput");
__turbopack_context__.k.register(_c1, "QtyInput");
__turbopack_context__.k.register(_c2, "InvoiceFormClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/client-only/index.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/node_modules/styled-jsx/dist/index/index.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
__turbopack_context__.r("[project]/node_modules/next/dist/compiled/client-only/index.js [app-client] (ecmascript)");
var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {
        'default': e
    };
}
var React__default = /*#__PURE__*/ _interopDefaultLegacy(React);
/*
Based on Glamor's sheet
https://github.com/threepointone/glamor/blob/667b480d31b3721a905021b26e1290ce92ca2879/src/sheet.js
*/ function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var isProd = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== "undefined" && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env && ("TURBOPACK compile-time value", "development") === "production";
var isString = function(o) {
    return Object.prototype.toString.call(o) === "[object String]";
};
var StyleSheet = /*#__PURE__*/ function() {
    function StyleSheet(param) {
        var ref = param === void 0 ? {} : param, _name = ref.name, name = _name === void 0 ? "stylesheet" : _name, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? isProd : _optimizeForSpeed;
        invariant$1(isString(name), "`name` must be a string");
        this._name = name;
        this._deletedRulePlaceholder = "#" + name + "-deleted-rule____{}";
        invariant$1(typeof optimizeForSpeed === "boolean", "`optimizeForSpeed` must be a boolean");
        this._optimizeForSpeed = optimizeForSpeed;
        this._serverSheet = undefined;
        this._tags = [];
        this._injected = false;
        this._rulesCount = 0;
        var node = typeof window !== "undefined" && document.querySelector('meta[property="csp-nonce"]');
        this._nonce = node ? node.getAttribute("content") : null;
    }
    var _proto = StyleSheet.prototype;
    _proto.setOptimizeForSpeed = function setOptimizeForSpeed(bool) {
        invariant$1(typeof bool === "boolean", "`setOptimizeForSpeed` accepts a boolean");
        invariant$1(this._rulesCount === 0, "optimizeForSpeed cannot be when rules have already been inserted");
        this.flush();
        this._optimizeForSpeed = bool;
        this.inject();
    };
    _proto.isOptimizeForSpeed = function isOptimizeForSpeed() {
        return this._optimizeForSpeed;
    };
    _proto.inject = function inject() {
        var _this = this;
        invariant$1(!this._injected, "sheet already injected");
        this._injected = true;
        if (typeof window !== "undefined" && this._optimizeForSpeed) {
            this._tags[0] = this.makeStyleTag(this._name);
            this._optimizeForSpeed = "insertRule" in this.getSheet();
            if (!this._optimizeForSpeed) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode.");
                }
                this.flush();
                this._injected = true;
            }
            return;
        }
        this._serverSheet = {
            cssRules: [],
            insertRule: function(rule, index) {
                if (typeof index === "number") {
                    _this._serverSheet.cssRules[index] = {
                        cssText: rule
                    };
                } else {
                    _this._serverSheet.cssRules.push({
                        cssText: rule
                    });
                }
                return index;
            },
            deleteRule: function(index) {
                _this._serverSheet.cssRules[index] = null;
            }
        };
    };
    _proto.getSheetForTag = function getSheetForTag(tag) {
        if (tag.sheet) {
            return tag.sheet;
        }
        // this weirdness brought to you by firefox
        for(var i = 0; i < document.styleSheets.length; i++){
            if (document.styleSheets[i].ownerNode === tag) {
                return document.styleSheets[i];
            }
        }
    };
    _proto.getSheet = function getSheet() {
        return this.getSheetForTag(this._tags[this._tags.length - 1]);
    };
    _proto.insertRule = function insertRule(rule, index) {
        invariant$1(isString(rule), "`insertRule` accepts only strings");
        if (typeof window === "undefined") {
            if (typeof index !== "number") {
                index = this._serverSheet.cssRules.length;
            }
            this._serverSheet.insertRule(rule, index);
            return this._rulesCount++;
        }
        if (this._optimizeForSpeed) {
            var sheet = this.getSheet();
            if (typeof index !== "number") {
                index = sheet.cssRules.length;
            }
            // this weirdness for perf, and chrome's weird bug
            // https://stackoverflow.com/questions/20007992/chrome-suddenly-stopped-accepting-insertrule
            try {
                sheet.insertRule(rule, index);
            } catch (error) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
                }
                return -1;
            }
        } else {
            var insertionPoint = this._tags[index];
            this._tags.push(this.makeStyleTag(this._name, rule, insertionPoint));
        }
        return this._rulesCount++;
    };
    _proto.replaceRule = function replaceRule(index, rule) {
        if (this._optimizeForSpeed || typeof window === "undefined") {
            var sheet = typeof window !== "undefined" ? this.getSheet() : this._serverSheet;
            if (!rule.trim()) {
                rule = this._deletedRulePlaceholder;
            }
            if (!sheet.cssRules[index]) {
                // @TBD Should we throw an error?
                return index;
            }
            sheet.deleteRule(index);
            try {
                sheet.insertRule(rule, index);
            } catch (error) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
                }
                // In order to preserve the indices we insert a deleteRulePlaceholder
                sheet.insertRule(this._deletedRulePlaceholder, index);
            }
        } else {
            var tag = this._tags[index];
            invariant$1(tag, "old rule at index `" + index + "` not found");
            tag.textContent = rule;
        }
        return index;
    };
    _proto.deleteRule = function deleteRule(index) {
        if (typeof window === "undefined") {
            this._serverSheet.deleteRule(index);
            return;
        }
        if (this._optimizeForSpeed) {
            this.replaceRule(index, "");
        } else {
            var tag = this._tags[index];
            invariant$1(tag, "rule at index `" + index + "` not found");
            tag.parentNode.removeChild(tag);
            this._tags[index] = null;
        }
    };
    _proto.flush = function flush() {
        this._injected = false;
        this._rulesCount = 0;
        if (typeof window !== "undefined") {
            this._tags.forEach(function(tag) {
                return tag && tag.parentNode.removeChild(tag);
            });
            this._tags = [];
        } else {
            // simpler on server
            this._serverSheet.cssRules = [];
        }
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        if (typeof window === "undefined") {
            return this._serverSheet.cssRules;
        }
        return this._tags.reduce(function(rules, tag) {
            if (tag) {
                rules = rules.concat(Array.prototype.map.call(_this.getSheetForTag(tag).cssRules, function(rule) {
                    return rule.cssText === _this._deletedRulePlaceholder ? null : rule;
                }));
            } else {
                rules.push(null);
            }
            return rules;
        }, []);
    };
    _proto.makeStyleTag = function makeStyleTag(name, cssString, relativeToTag) {
        if (cssString) {
            invariant$1(isString(cssString), "makeStyleTag accepts only strings as second parameter");
        }
        var tag = document.createElement("style");
        if (this._nonce) tag.setAttribute("nonce", this._nonce);
        tag.type = "text/css";
        tag.setAttribute("data-" + name, "");
        if (cssString) {
            tag.appendChild(document.createTextNode(cssString));
        }
        var head = document.head || document.getElementsByTagName("head")[0];
        if (relativeToTag) {
            head.insertBefore(tag, relativeToTag);
        } else {
            head.appendChild(tag);
        }
        return tag;
    };
    _createClass(StyleSheet, [
        {
            key: "length",
            get: function get() {
                return this._rulesCount;
            }
        }
    ]);
    return StyleSheet;
}();
function invariant$1(condition, message) {
    if (!condition) {
        throw new Error("StyleSheet: " + message + ".");
    }
}
function hash(str) {
    var _$hash = 5381, i = str.length;
    while(i){
        _$hash = _$hash * 33 ^ str.charCodeAt(--i);
    }
    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */ return _$hash >>> 0;
}
var stringHash = hash;
var sanitize = function(rule) {
    return rule.replace(/\/style/gi, "\\/style");
};
var cache = {};
/**
 * computeId
 *
 * Compute and memoize a jsx id from a basedId and optionally props.
 */ function computeId(baseId, props) {
    if (!props) {
        return "jsx-" + baseId;
    }
    var propsToString = String(props);
    var key = baseId + propsToString;
    if (!cache[key]) {
        cache[key] = "jsx-" + stringHash(baseId + "-" + propsToString);
    }
    return cache[key];
}
/**
 * computeSelector
 *
 * Compute and memoize dynamic selectors.
 */ function computeSelector(id, css) {
    var selectoPlaceholderRegexp = /__jsx-style-dynamic-selector/g;
    // Sanitize SSR-ed CSS.
    // Client side code doesn't need to be sanitized since we use
    // document.createTextNode (dev) and the CSSOM api sheet.insertRule (prod).
    if (typeof window === "undefined") {
        css = sanitize(css);
    }
    var idcss = id + css;
    if (!cache[idcss]) {
        cache[idcss] = css.replace(selectoPlaceholderRegexp, id);
    }
    return cache[idcss];
}
function mapRulesToStyle(cssRules, options) {
    if (options === void 0) options = {};
    return cssRules.map(function(args) {
        var id = args[0];
        var css = args[1];
        return /*#__PURE__*/ React__default["default"].createElement("style", {
            id: "__" + id,
            // Avoid warnings upon render with a key
            key: "__" + id,
            nonce: options.nonce ? options.nonce : undefined,
            dangerouslySetInnerHTML: {
                __html: css
            }
        });
    });
}
var StyleSheetRegistry = /*#__PURE__*/ function() {
    function StyleSheetRegistry(param) {
        var ref = param === void 0 ? {} : param, _styleSheet = ref.styleSheet, styleSheet = _styleSheet === void 0 ? null : _styleSheet, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? false : _optimizeForSpeed;
        this._sheet = styleSheet || new StyleSheet({
            name: "styled-jsx",
            optimizeForSpeed: optimizeForSpeed
        });
        this._sheet.inject();
        if (styleSheet && typeof optimizeForSpeed === "boolean") {
            this._sheet.setOptimizeForSpeed(optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    }
    var _proto = StyleSheetRegistry.prototype;
    _proto.add = function add(props) {
        var _this = this;
        if (undefined === this._optimizeForSpeed) {
            this._optimizeForSpeed = Array.isArray(props.children);
            this._sheet.setOptimizeForSpeed(this._optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        if (typeof window !== "undefined" && !this._fromServer) {
            this._fromServer = this.selectFromServer();
            this._instancesCounts = Object.keys(this._fromServer).reduce(function(acc, tagName) {
                acc[tagName] = 0;
                return acc;
            }, {});
        }
        var ref = this.getIdAndRules(props), styleId = ref.styleId, rules = ref.rules;
        // Deduping: just increase the instances count.
        if (styleId in this._instancesCounts) {
            this._instancesCounts[styleId] += 1;
            return;
        }
        var indices = rules.map(function(rule) {
            return _this._sheet.insertRule(rule);
        }) // Filter out invalid rules
        .filter(function(index) {
            return index !== -1;
        });
        this._indices[styleId] = indices;
        this._instancesCounts[styleId] = 1;
    };
    _proto.remove = function remove(props) {
        var _this = this;
        var styleId = this.getIdAndRules(props).styleId;
        invariant(styleId in this._instancesCounts, "styleId: `" + styleId + "` not found");
        this._instancesCounts[styleId] -= 1;
        if (this._instancesCounts[styleId] < 1) {
            var tagFromServer = this._fromServer && this._fromServer[styleId];
            if (tagFromServer) {
                tagFromServer.parentNode.removeChild(tagFromServer);
                delete this._fromServer[styleId];
            } else {
                this._indices[styleId].forEach(function(index) {
                    return _this._sheet.deleteRule(index);
                });
                delete this._indices[styleId];
            }
            delete this._instancesCounts[styleId];
        }
    };
    _proto.update = function update(props, nextProps) {
        this.add(nextProps);
        this.remove(props);
    };
    _proto.flush = function flush() {
        this._sheet.flush();
        this._sheet.inject();
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        var fromServer = this._fromServer ? Object.keys(this._fromServer).map(function(styleId) {
            return [
                styleId,
                _this._fromServer[styleId]
            ];
        }) : [];
        var cssRules = this._sheet.cssRules();
        return fromServer.concat(Object.keys(this._indices).map(function(styleId) {
            return [
                styleId,
                _this._indices[styleId].map(function(index) {
                    return cssRules[index].cssText;
                }).join(_this._optimizeForSpeed ? "" : "\n")
            ];
        }) // filter out empty rules
        .filter(function(rule) {
            return Boolean(rule[1]);
        }));
    };
    _proto.styles = function styles(options) {
        return mapRulesToStyle(this.cssRules(), options);
    };
    _proto.getIdAndRules = function getIdAndRules(props) {
        var css = props.children, dynamic = props.dynamic, id = props.id;
        if (dynamic) {
            var styleId = computeId(id, dynamic);
            return {
                styleId: styleId,
                rules: Array.isArray(css) ? css.map(function(rule) {
                    return computeSelector(styleId, rule);
                }) : [
                    computeSelector(styleId, css)
                ]
            };
        }
        return {
            styleId: computeId(id),
            rules: Array.isArray(css) ? css : [
                css
            ]
        };
    };
    /**
   * selectFromServer
   *
   * Collects style tags from the document with id __jsx-XXX
   */ _proto.selectFromServer = function selectFromServer() {
        var elements = Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]'));
        return elements.reduce(function(acc, element) {
            var id = element.id.slice(2);
            acc[id] = element;
            return acc;
        }, {});
    };
    return StyleSheetRegistry;
}();
function invariant(condition, message) {
    if (!condition) {
        throw new Error("StyleSheetRegistry: " + message + ".");
    }
}
var StyleSheetContext = /*#__PURE__*/ React.createContext(null);
StyleSheetContext.displayName = "StyleSheetContext";
function createStyleRegistry() {
    return new StyleSheetRegistry();
}
function StyleRegistry(param) {
    var configuredRegistry = param.registry, children = param.children;
    var rootRegistry = React.useContext(StyleSheetContext);
    var ref = React.useState({
        "StyleRegistry.useState[ref]": function() {
            return rootRegistry || configuredRegistry || createStyleRegistry();
        }
    }["StyleRegistry.useState[ref]"]), registry = ref[0];
    return /*#__PURE__*/ React__default["default"].createElement(StyleSheetContext.Provider, {
        value: registry
    }, children);
}
function useStyleRegistry() {
    return React.useContext(StyleSheetContext);
}
// Opt-into the new `useInsertionEffect` API in React 18, fallback to `useLayoutEffect`.
// https://github.com/reactwg/react-18/discussions/110
var useInsertionEffect = React__default["default"].useInsertionEffect || React__default["default"].useLayoutEffect;
var defaultRegistry = typeof window !== "undefined" ? createStyleRegistry() : undefined;
function JSXStyle(props) {
    var registry = defaultRegistry ? defaultRegistry : useStyleRegistry();
    // If `registry` does not exist, we do nothing here.
    if (!registry) {
        return null;
    }
    if (typeof window === "undefined") {
        registry.add(props);
        return null;
    }
    useInsertionEffect({
        "JSXStyle.useInsertionEffect": function() {
            registry.add(props);
            return ({
                "JSXStyle.useInsertionEffect": function() {
                    registry.remove(props);
                }
            })["JSXStyle.useInsertionEffect"];
        // props.children can be string[], will be striped since id is identical
        }
    }["JSXStyle.useInsertionEffect"], [
        props.id,
        String(props.dynamic)
    ]);
    return null;
}
JSXStyle.dynamic = function(info) {
    return info.map(function(tagInfo) {
        var baseId = tagInfo[0];
        var props = tagInfo[1];
        return computeId(baseId, props);
    }).join(" ");
};
exports.StyleRegistry = StyleRegistry;
exports.createStyleRegistry = createStyleRegistry;
exports.style = JSXStyle;
exports.useStyleRegistry = useStyleRegistry;
}),
"[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/styled-jsx/dist/index/index.js [app-client] (ecmascript)").style;
}),
]);

//# sourceMappingURL=_d4dc0e8c._.js.map