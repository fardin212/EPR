import React from "react";
import path from "path";
import fs from "fs";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

/* ===================== SAFE TEXT (جلوگیری از crash textkit) ===================== */
function safeText(v: any, fallback = "—") {
  const s = String(v ?? "").trim();
  if (!s) return fallback;

  // حذف کاراکترهای کنترل و bidi که بعضی وقت‌ها textkit را می‌ترکاند
  return s
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(
      /[\u200f\u200e\u202a\u202b\u202c\u202d\u202e]/g,
      ""
    );
}

/* ===================== Safe Font Register (Once) ===================== */
function registerVazirmatnOnceOrThrow() {
  const g = globalThis as any;
  if (g.__PDF_VAZIRMATN_REGISTERED__) return;

  const regularPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Vazirmatn-Regular.ttf"
  );
  const boldPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Vazirmatn-Bold.ttf"
  );

  const hasRegular = fs.existsSync(regularPath);
  const hasBold = fs.existsSync(boldPath);

  if (!hasRegular || !hasBold) {
    g.__PDF_VAZIRMATN_REGISTERED__ = true;
    g.__PDF_VAZIRMATN_OK__ = false;

    // ❗️به هیچ وجه fallback نرو چون Helvetica فارسی نداره و textkit می‌ترکونه
    throw new Error(
      `PDF font missing. Put Vazirmatn fonts in public/fonts:
- ${regularPath} ${hasRegular ? "✅" : "❌"}
- ${boldPath} ${hasBold ? "✅" : "❌"}`
    );
  }

  Font.register({
    family: "Vazirmatn",
    fonts: [
      { src: regularPath, fontWeight: 400 },
      { src: boldPath, fontWeight: 700 },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);

  g.__PDF_VAZIRMATN_REGISTERED__ = true;
  g.__PDF_VAZIRMATN_OK__ = true;
}

function pdfFontFamily() {
  // اگر اینجا خطا بده یعنی فونت موجود نیست
  registerVazirmatnOnceOrThrow();
  return "Vazirmatn";
}

/* ===================== Types ===================== */
type Props = {
  workshop?: {
    name?: string;
    phones?: Array<string | null | undefined>;
    instagram?: string;
    website?: string;
    address?: string;
    logoUrl?: string;
  };

  docType?: "PROFORMA" | "INVOICE";
  docNo?: string;
  date?: Date | string | null;

  customer?: {
    name?: string | null;
    mobile?: string | null;
    phone?: string | null;
    address?: string | null;
  };

  spec?: null | Partial<{
    dimensions: string;
    area: string;
    chassis: string;
    profile: string;
    bodySheet: string;
    roofSheet: string;
    interior: string;
    insulationType: string;

    floor: string;
    bodyColor: string;
    door: string;
    window: string;
    extras: string;
    strapSheet: string;
    gutter: string;
    service: string;
  }>;

  items?: Array<{
    title?: string | null;
    qty?: number | string | null;
    unit?: string | null;
    unitPrice?: number | null;
    lineTotal?: number | null;
  }>;

  totals?: {
    subtotal?: number | null;
    discount?: number | null;
    shipping?: number | null;
    tax?: number | null;
    total?: number | null;
  };

  terms?: {
    deliveryTime?: string | null;
    transportTerms?: string | null;
    storagePenalty?: string | null;
    notes?: string | null;
  };
};

/* ===================== Helpers ===================== */
function faDocType(t: "PROFORMA" | "INVOICE") {
  return t === "INVOICE" ? "فاکتور فروش" : "پیش‌فاکتور";
}

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  if (d instanceof Date) return d;
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// (فعلاً میلادی نمایش می‌ده. اگر خواستی شمسی کنیم بعداً.)
function faDate(d: Date | string | null | undefined) {
  const dd = toDate(d);
  if (!dd) return "—";
  const yyyy = dd.getFullYear();
  const mm = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${day}`;
}

function toNum(v: any, fallback = 0) {
  const n = typeof v === "string" ? Number(v) : Number(v ?? fallback);
  return Number.isFinite(n) ? n : fallback;
}

function tomanToRial(toman: number) {
  return Math.round(toNum(toman, 0) * 10);
}

/** عدد را با جداکننده هزارگان، و تبدیل ارقام به فارسی خروجی می‌دهد */
function formatFaNumber(n: number) {
  const s = Math.trunc(Math.abs(toNum(n, 0))).toString();
  const withCommas = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fa = withCommas.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
  return (n < 0 ? "−" : "") + fa;
}

function faMoneyRialFromToman(nToman: number) {
  const rial = tomanToRial(nToman);
  return formatFaNumber(rial);
}

/* ===== number-to-words (ریال) ===== */
const FA_ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const FA_TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];
const FA_TENS = ["", "ده", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const FA_HUNDREDS = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const FA_SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

function threeDigitsToFaWords(n: number) {
  const h = Math.floor(n / 100);
  const last2 = n % 100;
  const t = Math.floor(last2 / 10);
  const o = last2 % 10;

  const parts: string[] = [];
  if (h) parts.push(FA_HUNDREDS[h]);

  if (last2) {
    if (last2 < 10) parts.push(FA_ONES[last2]);
    else if (last2 < 20) parts.push(FA_TEENS[last2 - 10]);
    else {
      if (t) parts.push(FA_TENS[t]);
      if (o) parts.push(FA_ONES[o]);
    }
  }
  return parts.filter(Boolean).join(" و ");
}

function numberToFaWords(n: number) {
  n = Math.floor(Math.abs(toNum(n, 0)));
  if (n === 0) return "صفر";

  const chunks: number[] = [];
  while (n > 0) {
    chunks.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const out: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (!chunk) continue;
    const w = threeDigitsToFaWords(chunk);
    const scale = FA_SCALES[i] || "";
    out.push(scale ? `${w} ${scale}` : w);
  }
  return out.join(" و ").trim();
}

/* ===================== Component ===================== */
export function InvoicePdf(p: Props) {
  const workshop = p.workshop ?? {};
  const customer = p.customer ?? {};
  const spec = p.spec ?? null;
  const items = Array.isArray(p.items) ? p.items : [];
  const totals = p.totals ?? {};
  const terms = p.terms ?? {};

  // ✅ spec mapping درست
  const specRows = [
    ["۱", "ابعاد", safeText(spec?.dimensions)],
    ["۲", "متراژ", safeText(spec?.area)],
    ["۳", "شاسی", safeText(spec?.chassis)],
    ["۴", "پروفیل", safeText(spec?.profile)],
    ["۵", "ورق بدنه", safeText(spec?.bodySheet)],
    ["۶", "ورق سقف", safeText(spec?.roofSheet)],
    ["۷", "داخل کار", safeText(spec?.interior)],
    ["۸", "نوع عایق", safeText(spec?.insulationType)],
    ["۹", "کف", safeText(spec?.floor)],
    ["۱۰", "رنگ بدنه", safeText(spec?.bodyColor)],
    ["۱۱", "درب", safeText(spec?.door)],
    ["۱۲", "پنجره", safeText(spec?.window)],
    ["۱۳", "لوازم اضافه", safeText(spec?.extras)],
    ["۱۴", "سیم کشی", safeText(spec?.strapSheet)], // اگر wiring جدا داری اینجا عوضش کن
    ["۱۵", "آبدارخانه", safeText(spec?.gutter)],   // اگر pantry جدا داری اینجا عوضش کن
    ["۱۶", "سرویس", safeText(spec?.service)],
  ];

  const totalToman = toNum(totals.total ?? 0);
  const totalRial = tomanToRial(totalToman);
  const totalWords = `${numberToFaWords(totalRial)} ریال`;

  const itemsToShow = items.slice(0, 8);
  const phones = (workshop.phones ?? []).filter(Boolean).join(" - ");

  const fontFamily = pdfFontFamily();

  return (
    <Document>
      <Page size="A4" style={s.page(fontFamily)} wrap={false}>
        {/* HEADER */}
        <View style={s.header}>
          <View style={s.headerRight}>
            <Text style={s.workshopName}>{safeText(workshop.name)}</Text>
            <Text style={s.small}>تلفن: {safeText(phones)}</Text>
            <Text style={s.small}>سایت: {safeText(workshop.website)}</Text>
            <Text style={s.small}>اینستاگرام: {safeText(workshop.instagram)}</Text>
            <Text style={s.small}>آدرس: {safeText(workshop.address)}</Text>
          </View>

          <View style={s.headerLeft}>
            {workshop.logoUrl ? (
              <Image src={workshop.logoUrl} style={s.logo} />
            ) : (
              <View style={s.logoPlaceholder}>
                <Text style={s.small}>LOGO</Text>
              </View>
            )}

            <View style={s.docBox}>
              <Text style={s.docTitle}>
                {safeText(faDocType((p.docType ?? "PROFORMA") as any))}
              </Text>
              <Text style={s.docMeta}>شماره: {safeText(p.docNo)}</Text>
              <Text style={s.docMeta}>تاریخ: {safeText(faDate(p.date))}</Text>
            </View>
          </View>
        </View>

        {/* CUSTOMER */}
        <View style={s.card}>
          <Text style={s.cardTitle}> مشخصات خریدار</Text>

          <View style={s.rowRtl}>
            <Text style={[s.kv, s.mr8]}>
              <Text style={s.k}>نام/شرکت: </Text>
              {safeText(customer.name)}
            </Text>
            <Text style={s.kv}>
              <Text style={s.k}>همراه: </Text>
              {safeText(customer.mobile)}
            </Text>
          </View>

          <View style={[s.rowRtl, s.mt4]}>
            <Text style={[s.kv, s.mr8]}>
              <Text style={s.k}>تلفن: </Text>
              {safeText(customer.phone)}
            </Text>
            <Text style={s.kv}>
              <Text style={s.k}>آدرس: </Text>
              {safeText(customer.address)}
            </Text>
          </View>
        </View>

        {/* SPEC */}
        <View style={s.card}>
          <Text style={s.cardTitle}> مشخصات فنی</Text>

          <View style={s.specGrid}>
            {specRows.map((r, idx) => (
              <View key={idx} style={s.specCell}>
                <View style={s.specBadge}>
                  <Text style={s.specBadgeText}>{safeText(r[0], "")}</Text>
                </View>

                <Text style={s.specLabel}>{safeText(r[1], "")}:</Text>
                <Text style={s.specValue}>{safeText(r[2], "—")}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ITEMS + TOTALS */}
        <View style={s.twoCol}>
          <View style={s.itemsBox}>
            <Text style={s.cardTitle}> آیتم‌های قیمت</Text>

            <View style={s.itemsHeader}>
              <Text style={[s.th, { flex: 2 }]}>مبلغ (ریال)</Text>
              <Text style={[s.th, { flex: 2 }]}>قیمت واحد (ریال)</Text>
              <Text style={[s.th, { flex: 1 }]}>واحد</Text>
              <Text style={[s.th, { flex: 1 }]}>تعداد</Text>
              <Text style={[s.th, { flex: 4 }]}>شرح</Text>
            </View>

            {itemsToShow.map((it, idx) => {
              const zebra = idx % 2 === 1;

              const qty = toNum(it.qty ?? 0);
              const unitPriceToman = toNum(it.unitPrice ?? 0);
              const lineTotalToman = toNum(it.lineTotal ?? 0);

              return (
                <View key={idx} style={[s.itemsRow, zebra ? s.zebra : null]}>
                  <Text style={[s.tdNum, { flex: 2 }]}>
                    {safeText(faMoneyRialFromToman(lineTotalToman), "۰")}
                  </Text>
                  <Text style={[s.tdNum, { flex: 2 }]}>
                    {safeText(faMoneyRialFromToman(unitPriceToman), "۰")}
                  </Text>
                  <Text style={[s.td, { flex: 1 }]}>{safeText(it.unit, "—")}</Text>
                  <Text style={[s.tdNum, { flex: 1 }]}>{safeText(formatFaNumber(qty), "۰")}</Text>
                  <Text style={[s.td, { flex: 4 }]}>{safeText(it.title, "—")}</Text>
                </View>
              );
            })}

            {items.length > itemsToShow.length ? (
              <Text style={s.smallMuted}>
                * تعداد آیتم‌ها زیاد است. برای تک‌صفحه بودن، نمایش به {itemsToShow.length} ردیف محدود شد.
              </Text>
            ) : null}
          </View>

          <View style={s.totalsBox}>
            <Text style={s.cardTitle}>جمع‌بندی</Text>

            <View style={s.totalRow}>
              <Text style={s.totalK}>جمع جزء</Text>
              <Text style={s.totalV}>
                {safeText(faMoneyRialFromToman(toNum(totals.subtotal ?? 0)), "۰")} ریال
              </Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalK}>تخفیف</Text>
              <Text style={s.totalV}>
                {safeText(faMoneyRialFromToman(toNum(totals.discount ?? 0)), "۰")} ریال
              </Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalK}>حمل</Text>
              <Text style={s.totalV}>
                {safeText(faMoneyRialFromToman(toNum(totals.shipping ?? 0)), "۰")} ریال
              </Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalK}>مالیات</Text>
              <Text style={s.totalV}>
                {safeText(faMoneyRialFromToman(toNum(totals.tax ?? 0)), "۰")} ریال
              </Text>
            </View>

            <View style={s.totalFinal}>
              <Text style={s.totalFinalK}>جمع کل (ریال)</Text>
              <Text style={s.totalFinalV}>
                {safeText(faMoneyRialFromToman(totalToman), "۰")} ریال
              </Text>
            </View>

            <View style={s.wordsBox}>
              <Text style={s.wordsLabel}>مبلغ به حروف (ریال):</Text>
              <Text style={s.wordsValue}>{safeText(totalWords, "—")}</Text>
            </View>
          </View>
        </View>

        {/* TERMS + SIGN */}
        <View style={s.bottomRow}>
          <View style={s.termsBox}>
            <Text style={s.cardTitle}> توضیحات و شرایط</Text>
            <Text style={s.termLine}>• زمان تحویل: {safeText(terms.deliveryTime)}</Text>
            <Text style={s.termLine}>• حمل: {safeText(terms.transportTerms)}</Text>
            <Text style={s.termLine}>• انبارداری/تاخیر: {safeText(terms.storagePenalty)}</Text>
            <Text style={s.termLine}>• توضیحات: {safeText(terms.notes)}</Text>
          </View>

          <View style={s.signCol}>
            <View style={[s.signBox, s.mb6]}>
              <Text style={s.signTitle}>مهر و امضای خریدار</Text>
            </View>
            <View style={s.signBox}>
              <Text style={s.signTitle}>مهر و امضای فروشنده</Text>
            </View>
          </View>
        </View>

        <Text style={s.footer}>
          {safeText(workshop.website)} • {safeText(workshop.instagram)}
        </Text>
      </Page>
    </Document>
  );
}

/* ===================== Styles ===================== */
const s = StyleSheet.create({
  page: (fontFamily: string) => ({
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 14,
    fontSize: 9,

    // ❗️direction را حذف کردیم چون بعضی نسخه‌ها با RTL crash می‌کنند
    textAlign: "right",
    fontFamily,
    color: "#000",
  }),

  header: {
    flexDirection: "row-reverse",
    borderWidth: 1.4,
    borderColor: "#000",
    borderRadius: 10,
    padding: 8,
    marginBottom: 7,
  },
  headerRight: { flex: 1, paddingRight: 8 },
  headerLeft: { width: 180, alignItems: "flex-start" },

  logo: { width: 88, height: 48, marginBottom: 5 },
  logoPlaceholder: {
    width: 88,
    height: 48,
    borderWidth: 1.2,
    borderColor: "#000",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },

  workshopName: { fontSize: 12, fontWeight: 700, textAlign: "right" },
  small: { fontSize: 8, marginTop: 2, textAlign: "right", color: "#000" },

  docBox: {
    borderWidth: 1.2,
    borderColor: "#000",
    borderRadius: 10,
    padding: 7,
    width: "100%",
  },
  docTitle: { fontSize: 11, fontWeight: 700, textAlign: "center" },
  docMeta: { fontSize: 8, marginTop: 2, textAlign: "center", color: "#000" },

  card: {
    borderWidth: 1.2,
    borderColor: "#000",
    borderRadius: 10,
    padding: 8,
    marginBottom: 7,
  },
  cardTitle: { fontSize: 10, fontWeight: 700, marginBottom: 5, textAlign: "right" },

  rowRtl: { flexDirection: "row-reverse", justifyContent: "space-between" },
  kv: { flex: 1, fontSize: 9, textAlign: "right" },
  k: { fontWeight: 700 },

  mr8: { marginLeft: 8 },
  mt4: { marginTop: 4 },
  mb6: { marginBottom: 6 },

  specGrid: { flexDirection: "row-reverse", flexWrap: "wrap" },
  specCell: {
    width: "50%",
    paddingVertical: 5,
    paddingHorizontal: 6,
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 5,
  },
  specBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  specBadgeText: { color: "#fff", fontSize: 8, paddingTop: 1 },
  specLabel: { fontSize: 9, fontWeight: 700, marginLeft: 6, textAlign: "right", color: "#000" },
  specValue: { fontSize: 9, flex: 1, textAlign: "right", color: "#000" },

  twoCol: { flexDirection: "row-reverse", marginBottom: 7 },
  itemsBox: {
    flex: 1.45,
    borderWidth: 1.2,
    borderColor: "#000",
    borderRadius: 10,
    padding: 8,
    marginLeft: 7,
  },
  totalsBox: { flex: 1, borderWidth: 1.2, borderColor: "#000", borderRadius: 10, padding: 8 },

  itemsHeader: {
    flexDirection: "row-reverse",
    borderWidth: 1.2,
    borderColor: "#000",
    borderRadius: 10,
    backgroundColor: "#EDEDED",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  itemsRow: {
    flexDirection: "row-reverse",
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: 4,
    backgroundColor: "#FFF",
  },
  zebra: { backgroundColor: "#F4F4F4" },

  th: { fontSize: 8, fontWeight: 700, textAlign: "right", color: "#000" },
  td: { fontSize: 8.5, textAlign: "right", color: "#000" },
  tdNum: { fontSize: 8.5, textAlign: "left", color: "#000" },

  smallMuted: { fontSize: 7.5, marginTop: 5, color: "#000", textAlign: "right" },

  totalRow: { flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: 2 },
  totalK: { fontSize: 9, fontWeight: 700, textAlign: "right", color: "#000" },
  totalV: { fontSize: 9, fontWeight: 700, textAlign: "left", color: "#000" },

  totalFinal: {
    marginTop: 5,
    borderWidth: 1.6,
    borderColor: "#000",
    borderRadius: 10,
    padding: 7,
    backgroundColor: "#EDEDED",
  },
  totalFinalK: { fontSize: 9, fontWeight: 700, textAlign: "right", color: "#000" },
  totalFinalV: { fontSize: 11, fontWeight: 700, textAlign: "right", marginTop: 3, color: "#000" },

  wordsBox: { marginTop: 5, borderWidth: 1.1, borderColor: "#000", borderRadius: 10, padding: 7 },
  wordsLabel: { fontSize: 8, color: "#000", textAlign: "right" },
  wordsValue: { fontSize: 9, fontWeight: 700, textAlign: "right", marginTop: 3, color: "#000" },

  bottomRow: { flexDirection: "row-reverse", marginTop: "auto" },

  termsBox: { flex: 1.65, borderWidth: 1.2, borderColor: "#000", borderRadius: 10, padding: 6, marginLeft: 7 },
  termLine: { fontSize: 8, marginTop: 1, textAlign: "right", color: "#000" },

  signCol: { flex: 1 },
  signBox: {
    borderWidth: 1.2,
    borderColor: "#000",
    borderRadius: 10,
    padding: 8,
    height: 58,
    justifyContent: "flex-start",
  },
  signTitle: { fontSize: 9, fontWeight: 700, textAlign: "right", color: "#000" },

  footer: { fontSize: 7.5, color: "#000", textAlign: "center", marginTop: 6 },
});
