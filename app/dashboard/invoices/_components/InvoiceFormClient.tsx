// app/dashboard/invoices/_components/InvoiceFormClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DocType = "PROFORMA" | "INVOICE";

// ✅ Spec دقیقاً مطابق DB و View/PDF
type Spec = {
  dimensions?: string; // 1 ابعاد
  area?: string; // 2 متراژ
  chassis?: string; // 3 شاسی
  profile?: string; // 4 پروفیل
  bodySheet?: string; // 5 ورق بدنه
  roofSheet?: string; // 6 ورق سقف
  interior?: string; // 7 داخل کار
  insulationType?: string; // 8 نوع عایق
  floor?: string; // 9 کف
  bodyColor?: string; // 10 رنگ بدنه
  door?: string; // 11 درب
  window?: string; // 12 پنجره
  extras?: string; // 13 لوازم اضافه
  strapSheet?: string; // 14 سیم‌کشی
  gutter?: string; // 15 آبدارخانه
  service?: string; // 16 سرویس
};

type Item = {
  title: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  note?: string;
};

/* ===================== Number utils (حل مشکل ورود اعداد فارسی + جداکننده‌ها) ===================== */

function normalizeDigits(input: string) {
  const map: Record<string, string> = {
    "۰": "0","۱": "1","۲": "2","۳": "3","۴": "4","۵": "5","۶": "6","۷": "7","۸": "8","۹": "9",
    "٠": "0","١": "1","٢": "2","٣": "3","٤": "4","٥": "5","٦": "6","٧": "7","٨": "8","٩": "9",
  };

  return String(input ?? "")
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replaceAll("٬", "")
    .replaceAll("٫", "")
    .replaceAll(",", "")
    .replaceAll("،", "")
    .replaceAll("\u00A0", "")
    .replaceAll(" ", "")
    .trim();
}

function safeNum(v: any) {
  const s = normalizeDigits(String(v ?? ""));
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function moneyFa(n: number) {
  return Number(n || 0).toLocaleString("fa-IR");
}

/* ===================== MoneyInput (حل قطعی مشکل تایپ مبلغ) ===================== */
function MoneyInput({
  value,
  onValueChange,
  placeholder,
  className = "input",
  hint,
}: {
  value: number;
  onValueChange: (n: number) => void;
  placeholder?: string;
  className?: string;
  hint?: string;
}) {
  const [text, setText] = useState<string>(value ? moneyFa(value) : "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value ? moneyFa(value) : "");
  }, [value, focused]);

  return (
    <div>
      <input
        className={className}
        inputMode="numeric"
        placeholder={placeholder}
        value={text}
        onFocus={() => {
          setFocused(true);
          const raw = normalizeDigits(text);
          setText(raw || "");
        }}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          onValueChange(safeNum(v));
        }}
        onBlur={() => {
          setFocused(false);
          setText(value ? moneyFa(value) : "");
        }}
      />
      {hint ? <div className="text-[11px] text-zinc-500 mt-1">{hint}</div> : null}
    </div>
  );
}

function QtyInput({
  value,
  onValueChange,
  placeholder,
  className = "input",
}: {
  value: number;
  onValueChange: (n: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState<string>(value ? String(value) : "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value ? String(value) : "");
  }, [value, focused]);

  return (
    <input
      className={className}
      inputMode="numeric"
      placeholder={placeholder}
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        setText(e.target.value);
        onValueChange(safeNum(e.target.value));
      }}
      onBlur={() => {
        setFocused(false);
        setText(value ? String(value) : "");
      }}
    />
  );
}

/* ===================== Jalali/Gregorian (بدون کتابخانه) ===================== */
function div(a: number, b: number) { return ~~(a / b); }
function mod(a: number, b: number) { return a - ~~(a / b) * b; }

function g2d(gy: number, gm: number, gd: number) {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const bl = breaks.length;
  let gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = 0;
  let jump = 0;
  for (let i = 1; i < bl; i += 1) {
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

  return { leap, gy, march };
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn: number) {
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
      return { jy, jm, jd };
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
  return { jy, jm, jd };
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

function isoToJalali(iso: string) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const gy = Number(m[1]);
  const gm = Number(m[2]);
  const gd = Number(m[3]);
  const j = d2j(g2d(gy, gm, gd));
  return `${j.jy}/${pad2(j.jm)}/${pad2(j.jd)}`;
}

function jalaliToIso(jal: string) {
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

/* ===================== Props ===================== */

type Props = {
  mode: "create" | "edit";
  invoiceId?: number;
  defaultDocType?: DocType;
  initialData?: any;
  initialLinks?: { projectId: number | null; partyId: number | null };
};

export default function InvoiceFormClient({
  mode,
  invoiceId,
  defaultDocType = "PROFORMA",
  initialData,
  initialLinks,
}: Props) {
  const router = useRouter();

  const [projectId, setProjectId] = useState<number | null>(
    initialData?.projectId ?? initialLinks?.projectId ?? null
  );
  const [partyId, setPartyId] = useState<number | null>(
    initialData?.partyId ?? initialLinks?.partyId ?? null
  );

  const [docType, setDocType] = useState<DocType>(
    initialData?.docType ?? defaultDocType
  );

  const initialIsoDate = initialData?.date ?? new Date().toISOString().slice(0, 10);
  const initialIsoDue = initialData?.dueDate ?? "";

  const [dateJ, setDateJ] = useState<string>(isoToJalali(initialIsoDate));
  const [dueDateJ, setDueDateJ] = useState<string>(initialIsoDue ? isoToJalali(initialIsoDue) : "");

  const [customerName, setCustomerName] = useState(initialData?.customerName ?? "");
  const [customerMobile, setCustomerMobile] = useState(initialData?.customerMobile ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone ?? "");
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress ?? "");

  // ✅ default spec یکدست با DB
  const [spec, setSpec] = useState<Spec>(
    initialData?.spec ?? {
      door: "P.V.C",
      window: "P.V.C",
      strapSheet: "سیم‌کشی روکار استاندارد",
      gutter: "ندارد",
      service: "ندارد",
    }
  );

  const [items, setItems] = useState<Item[]>(
    initialData?.items?.length
      ? initialData.items
      : [{ title: "ساخت کانکس طبق مشخصات", qty: 1, unit: "عدد", unitPrice: 0 }]
  );

  const [discount, setDiscount] = useState(initialData?.discount ?? 0);
  const [shipping, setShipping] = useState(initialData?.shipping ?? 0);
  const [tax, setTax] = useState(initialData?.tax ?? 0);

  const [deliveryTime, setDeliveryTime] = useState(initialData?.deliveryTime ?? "");
  const [storagePenalty, setStoragePenalty] = useState(initialData?.storagePenalty ?? "");
  const [transportTerms, setTransportTerms] = useState(initialData?.transportTerms ?? "");

  const [description, setDescription] = useState(initialData?.description ?? "");
  const [prepayPercent, setPrepayPercent] = useState<number>(Number(initialData?.prepayPercent ?? 50));
  const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms ?? "الباقی به صورت توافقی");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const [loading, setLoading] = useState(false);

  const computed = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + Math.round((it.qty || 0) * (it.unitPrice || 0)), 0);
    const total = subtotal - (discount || 0) + (shipping || 0) + (tax || 0);
    return { subtotal, total };
  }, [items, discount, shipping, tax]);

  function updateItem(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function addItem() {
    setItems((prev) => [...prev, { title: "", qty: 1, unit: "عدد", unitPrice: 0 }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function setSpecField<K extends keyof Spec>(key: K, value: string) {
    setSpec((prev) => ({ ...prev, [key]: value }));
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

    const cleanItems = items
      .map((it) => ({
        title: String(it.title || "").trim(),
        qty: Number(it.qty || 0),
        unit: String(it.unit || "").trim() || null,
        unitPrice: Math.round(Number(it.unitPrice || 0)),
        note: String(it.note || "").trim() || null,
      }))
      .filter((x) => x.title && x.qty > 0);

    if (!cleanItems.length) {
      alert("حداقل یک آیتم قیمت لازم است");
      return;
    }

    const payload: any = {
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
      spec,
    };

    const url = mode === "create" ? "/api/invoices" : `/api/invoices/${invoiceId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert(await res.text());
        return;
      }

      const data = await res.json();
      router.push(`/dashboard/invoices/${data.id ?? invoiceId}`);
    } finally {
      setLoading(false);
    }
  }

  const specFields: Array<{ no: number; key: keyof Spec; label: string; placeholder?: string }> = [
    { no: 1, key: "dimensions", label: "ابعاد", placeholder: "مثلاً 2.90×5.80" },
    { no: 2, key: "area", label: "متراژ", placeholder: "مثلاً 16.82" },
    { no: 3, key: "chassis", label: "شاسی", placeholder: "مثلاً تیرآهن" },
    { no: 4, key: "profile", label: "پروفیل", placeholder: "مثلاً 80 و 1.2" },
    { no: 5, key: "bodySheet", label: "ورق بدنه", placeholder: "مثلاً سایدینگ رنگ استاتیک" },
    { no: 6, key: "roofSheet", label: "ورق سقف", placeholder: "مثلاً کرکره" },
    { no: 7, key: "interior", label: "داخل کار", placeholder: "مثلاً C.V.P" },
    { no: 8, key: "insulationType", label: "نوع عایق", placeholder: "مثلاً پشم شیشه / پشم سنگ" },
    { no: 9, key: "floor", label: "کف", placeholder: "مثلاً تخته سه‌لایی / کف‌پوش" },
    { no: 10, key: "bodyColor", label: "رنگ بدنه", placeholder: "به دلخواه مشتری" },
    { no: 11, key: "door", label: "درب (UPVC)", placeholder: "مثلاً U.P.V.C" },
    { no: 12, key: "window", label: "پنجره (UPVC)", placeholder: "مثلاً U.P.V.C" },
    { no: 13, key: "extras", label: "لوازم اضافه", placeholder: "مثلاً حفاظ پنجره" },
    { no: 14, key: "strapSheet", label: "سیم‌کشی", placeholder: "مثلاً سیم‌کشی توکار استاندارد" },
    { no: 15, key: "gutter", label: "آبدارخانه", placeholder: "ندارد / دارد" },
    { no: 16, key: "service", label: "سرویس", placeholder: "ندارد / دارد" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold">{mode === "create" ? "صدور سند جدید" : "ویرایش سند"}</h1>
          <p className="text-sm text-zinc-500">پیش‌فاکتور یا فاکتور رسمی (مبالغ به ریال)</p>
        </div>

        <div className="flex gap-2 items-center">
          <div className="min-w-[160px]">
            <select className="input" value={docType} onChange={(e) => setDocType(e.target.value as DocType)}>
              <option value="PROFORMA">پیش‌فاکتور</option>
              <option value="INVOICE">فاکتور رسمی</option>
            </select>
            <div className="text-[11px] text-zinc-500 mt-1">پیش‌فاکتور: بدون ارزش مالیاتی | رسمی: قابل ثبت حسابداری</div>
          </div>

          <button className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? "در حال ذخیره..." : mode === "create" ? "ثبت سند" : "ذخیره"}
          </button>
        </div>
      </div>

      {/* Dates (شمسی) */}
      <div className="card">
        <h2 className="card-title">تاریخ‌ها (شمسی)</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-zinc-500 mb-1">تاریخ سند</div>
            <input className="input" placeholder="مثلاً 1404/10/11" value={dateJ} onChange={(e) => setDateJ(e.target.value)} inputMode="numeric" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">تاریخ سررسید (اختیاری)</div>
            <input className="input" placeholder="مثلاً 1404/10/20" value={dueDateJ} onChange={(e) => setDueDateJ(e.target.value)} inputMode="numeric" />
          </div>
          <div className="text-xs text-zinc-500 flex items-center">
            فرمت صحیح: <span className="mx-1 font-bold">YYYY/MM/DD</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="card">
        <h2 className="card-title">اتصال به پروژه/طرف حساب (اختیاری)</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Project ID</div>
            <QtyInput value={projectId ?? 0} onValueChange={(n) => setProjectId(n ? n : null)} placeholder="مثلاً 12" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">Party ID (مشتری)</div>
            <QtyInput value={partyId ?? 0} onValueChange={(n) => setPartyId(n ? n : null)} placeholder="مثلاً 45" />
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="card">
        <h2 className="card-title">مشخصات خریدار</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <input className="input" placeholder="نام/شرکت *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input className="input" placeholder="همراه" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} inputMode="tel" />
          <input className="input" placeholder="تلفن" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} inputMode="tel" />
          <input className="input md:col-span-4" placeholder="آدرس" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
        </div>
      </div>

      {/* Spec */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="card-title m-0">مشخصات فنی (مطابق PDF)</h2>
          <div className="text-xs text-zinc-500">آیتم‌ها به ترتیب شماره‌گذاری PDF (۱ تا ۱۶)</div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {specFields.map((f) => (
            <div key={String(f.key)}>
              <div className="text-xs text-zinc-600 mb-1 flex items-center gap-2">
                <span className="badge">{f.no}</span>
                <span className="font-bold">{f.label}</span>
              </div>
              <input
                className="input"
                placeholder={f.placeholder}
                value={(spec[f.key] as string) || ""}
                onChange={(e) => setSpecField(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <h2 className="card-title">آیتم‌های قیمت</h2>

        <div className="overflow-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-2 text-right">شرح</th>
                <th className="p-2 text-right w-24">تعداد</th>
                <th className="p-2 text-right w-24">واحد</th>
                <th className="p-2 text-right w-52">قیمت واحد (ریال)</th>
                <th className="p-2 text-right w-44">مبلغ (ریال)</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-t align-top">
                  <td className="p-2">
                    <input className="input" placeholder="مثلاً ساخت کانکس طبق مشخصات" value={it.title} onChange={(e) => updateItem(i, { title: e.target.value })} />
                    <input className="input mt-2" placeholder="توضیح/یادداشت (اختیاری)" value={it.note || ""} onChange={(e) => updateItem(i, { note: e.target.value })} />
                  </td>

                  <td className="p-2">
                    <QtyInput value={it.qty} onValueChange={(n) => updateItem(i, { qty: n })} placeholder="مثلاً 1" />
                  </td>

                  <td className="p-2">
                    <input className="input" placeholder="عدد" value={it.unit || ""} onChange={(e) => updateItem(i, { unit: e.target.value })} />
                  </td>

                  <td className="p-2">
                    <MoneyInput
                      value={it.unitPrice}
                      onValueChange={(n) => updateItem(i, { unitPrice: n })}
                      placeholder="مثلاً 1500000000"
                      hint="در حال تایپ، فرمت نمی‌شود. بعد از خروج از فیلد، خودکار فرمت می‌شود."
                    />
                  </td>

                  <td className="p-2 font-extrabold whitespace-nowrap">
                    {moneyFa((it.qty || 0) * (it.unitPrice || 0))}
                  </td>

                  <td className="p-2">
                    <button onClick={() => removeItem(i)} className="text-red-600" type="button" title="حذف آیتم">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addItem} className="btn-secondary mt-3" type="button">
          + افزودن آیتم
        </button>
      </div>

      {/* Totals */}
      <div className="card">
        <h2 className="card-title">جمع‌بندی</h2>

        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <div className="text-xs text-zinc-500 mb-1">جمع جزء (ریال)</div>
            <div className="input flex items-center justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-extrabold">{moneyFa(computed.subtotal)}</span>
            </div>
          </div>

          <MoneyInput value={discount} onValueChange={setDiscount} placeholder="تخفیف (ریال)" />
          <MoneyInput value={shipping} onValueChange={setShipping} placeholder="هزینه حمل (ریال)" />
          <MoneyInput value={tax} onValueChange={setTax} placeholder="مالیات (ریال)" />

          <div className="md:col-span-4 flex items-center justify-between border-t pt-3">
            <div className="text-sm text-zinc-500">مبلغ نهایی (ریال)</div>
            <div className="font-extrabold text-xl">{moneyFa(computed.total)}</div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="card">
        <h2 className="card-title">توضیحات و شرایط</h2>

        <div className="grid md:grid-cols-3 gap-3">
          <input className="input" placeholder="زمان تحویل (مثلاً 10 روز کاری)" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
          <input className="input" placeholder="حمل (مثلاً هزینه حمل و بارگیری به عهده مشتری)" value={transportTerms} onChange={(e) => setTransportTerms(e.target.value)} />
          <input className="input" placeholder="انبارداری/تاخیر (اختیاری)" value={storagePenalty} onChange={(e) => setStoragePenalty(e.target.value)} />

          <input className="input" placeholder="توضیحات فنی تکمیلی (مثلاً یکطرف شیب باکس دار)" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <QtyInput value={prepayPercent} onValueChange={setPrepayPercent} placeholder="درصد پیش‌پرداخت (مثلاً 50)" />
            <input className="input" placeholder="شرایط الباقی (مثلاً تسویه هنگام تحویل)" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
          </div>

          <textarea className="input md:col-span-3 min-h-[120px]" placeholder="یادداشت‌های تکمیلی (اختیاری)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <style jsx global>{`
        .card { background: white; border: 1px solid #e4e4e7; border-radius: 20px; padding: 16px; }
        .card-title { font-weight: 800; margin-bottom: 12px; }
        .input { width: 100%; border: 1px solid #e4e4e7; padding: 10px 12px; border-radius: 14px; background: #fff; }
        .btn-primary { background: #111827; color: white; padding: 10px 16px; border-radius: 16px; font-weight: 800; opacity: 1; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: #f4f4f5; padding: 8px 12px; border-radius: 14px; font-weight: 700; }
        .badge { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 20px; padding: 0 6px; border-radius: 999px; background: #111827; color: white; font-size: 12px; font-weight: 800; line-height: 1; }
      `}</style>
    </div>
  );
}
