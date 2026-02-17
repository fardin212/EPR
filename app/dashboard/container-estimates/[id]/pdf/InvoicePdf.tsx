import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

Font.register({
  family: "Vazirmatn",
  fonts: [
    { src: `${process.cwd()}/public/fonts/Vazirmatn-Regular.ttf` },
    { src: `${process.cwd()}/public/fonts/Vazirmatn-Bold.ttf`, fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Vazirmatn",
    fontSize: 10,
    padding: 24,
    direction: "rtl",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  brand: { flexDirection: "column", gap: 4 },
  title: { fontSize: 16, fontWeight: 700 },
  sub: { color: "#4b5563" },

  infoRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoBox: {
    width: "49%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  infoTitle: { fontWeight: 700, marginBottom: 6 },
  infoText: { color: "#111827", lineHeight: 1.5 },

  table: { marginTop: 14, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 },
  trHead: {
    flexDirection: "row-reverse",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontWeight: 700,
  },
  tr: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  td: { paddingHorizontal: 4 },
  c1: { width: "42%" }, // شرح
  c2: { width: "10%", textAlign: "center" }, // واحد
  c3: { width: "14%", textAlign: "center" }, // مقدار
  c4: { width: "17%", textAlign: "left" }, // قیمت واحد
  c5: { width: "17%", textAlign: "left" }, // مبلغ

  totalsWrap: { marginTop: 14, flexDirection: "row-reverse", gap: 10 },
  totals: {
    width: "49%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
  },
  totalRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: { color: "#374151" },
  totalVal: { fontWeight: 700 },

  footer: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    color: "#6b7280",
    fontSize: 9,
    lineHeight: 1.5,
  },
});

type PdfItem = {
  materialName: string;
  unit: string;
  quantity: any;
  unitPrice: any;
  totalPrice: any;
};

type PdfExtra = { title: string; amount: any };

export function InvoicePdf(props: {
  estimate: {
    id: number;
    createdAt: Date;
    length: any;
    width: any;
    height: any;
    baseCost: any;
    profitType: "FIXED" | "PERCENT";
    profitValue: any;
    finalPrice: any;
    notes: string | null;
  };
  modelTitle: string;
  customerName?: string | null;
  items: PdfItem[];
  extras: PdfExtra[];
}) {
  const { estimate, modelTitle, customerName, items, extras } = props;

  const toFaMoney = (n: any) =>
    Number(n || 0).toLocaleString("fa-IR");

  const dateFa = new Date(estimate.createdAt).toLocaleDateString("fa-IR");

  const extrasTotal = extras.reduce((s, e) => s + Number(e.amount || 0), 0);
  const materialsTotal = Number(estimate.baseCost) - extrasTotal;

  const profitText =
    estimate.profitType === "FIXED"
      ? `${toFaMoney(estimate.profitValue)} تومان`
      : `${Number(estimate.profitValue || 0).toLocaleString("fa-IR")}٪`;

  return (
    <Document title={`پیش‌فاکتور کانکس نیکان - ${estimate.id}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.title}>پیش‌فاکتور کانکس نیکان</Text>
            <Text style={styles.sub}>شماره: {estimate.id} — تاریخ: {dateFa}</Text>
          </View>

          <Image
            src={`${process.cwd()}/public/brand/nikan-logo.png`}
            style={{ width: 92, height: 42, objectFit: "contain" }}
          />
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>مشخصات کانکس</Text>
            <Text style={styles.infoText}>
              مدل: {modelTitle}{"\n"}
              ابعاد: {Number(estimate.length)} × {Number(estimate.width)} × {Number(estimate.height)}{"\n"}
              توضیحات: {estimate.notes ? estimate.notes : "—"}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>مشخصات مشتری</Text>
            <Text style={styles.infoText}>
              نام: {customerName || "—"}{"\n"}
              صادرکننده: کارگاه کانکس نیکان{"\n"}
              اعتبار پیش‌فاکتور: 48 ساعت
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.td, styles.c1]}>شرح</Text>
            <Text style={[styles.td, styles.c2]}>واحد</Text>
            <Text style={[styles.td, styles.c3]}>مقدار</Text>
            <Text style={[styles.td, styles.c4]}>قیمت واحد</Text>
            <Text style={[styles.td, styles.c5]}>مبلغ</Text>
          </View>

          {items.map((it, idx) => (
            <View key={idx} style={styles.tr}>
              <Text style={[styles.td, styles.c1]}>{it.materialName}</Text>
              <Text style={[styles.td, styles.c2]}>{it.unit}</Text>
              <Text style={[styles.td, styles.c3]}>
                {Number(it.quantity || 0).toLocaleString("fa-IR")}
              </Text>
              <Text style={[styles.td, styles.c4]}>{toFaMoney(it.unitPrice)}</Text>
              <Text style={[styles.td, styles.c5]}>{toFaMoney(it.totalPrice)}</Text>
            </View>
          ))}

          {/* Extras as lines */}
          {extras.map((ex, idx) => (
            <View key={`ex-${idx}`} style={styles.tr}>
              <Text style={[styles.td, styles.c1]}>{ex.title}</Text>
              <Text style={[styles.td, styles.c2]}>—</Text>
              <Text style={[styles.td, styles.c3]}>—</Text>
              <Text style={[styles.td, styles.c4]}>—</Text>
              <Text style={[styles.td, styles.c5]}>{toFaMoney(ex.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>جمع مصالح</Text>
              <Text style={styles.totalVal}>{toFaMoney(materialsTotal)} تومان</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>جمع هزینه‌های دستی</Text>
              <Text style={styles.totalVal}>{toFaMoney(extrasTotal)} تومان</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>بهای تمام‌شده</Text>
              <Text style={styles.totalVal}>{toFaMoney(estimate.baseCost)} تومان</Text>
            </View>
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>سود</Text>
              <Text style={styles.totalVal}>{profitText}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>مبلغ نهایی</Text>
              <Text style={[styles.totalVal, { fontSize: 12 }]}>
                {toFaMoney(estimate.finalPrice)} تومان
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          شرایط: هزینه حمل و نصب در صورت نیاز جداگانه محاسبه می‌شود.{"\n"}
          امضا و مهر: ______________________
        </Text>
      </Page>
    </Document>
  );
}
