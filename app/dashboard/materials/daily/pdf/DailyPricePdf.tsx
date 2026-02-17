import React from "react";
import { Document, Page, Text, View, Font, StyleSheet } from "@react-pdf/renderer";

Font.register({
  family: "Vazirmatn",
  fonts: [
    { src: `${process.cwd()}/public/fonts/Vazirmatn-Regular.ttf` },
    { src: `${process.cwd()}/public/fonts/Vazirmatn-Bold.ttf`, fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { fontFamily: "Vazirmatn", fontSize: 10, padding: 24, direction: "rtl" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 6 },
  sub: { color: "#4b5563", marginBottom: 12 },
  table: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 },
  head: { flexDirection: "row-reverse", backgroundColor: "#f3f4f6", padding: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  row: { flexDirection: "row-reverse", padding: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  c1: { width: "38%" }, // نام
  c2: { width: "16%", textAlign: "center" }, // دسته
  c3: { width: "12%", textAlign: "center" }, // واحد
  c4: { width: "34%", textAlign: "left" }, // قیمت
});

export function DailyPricePdf(props: {
  companyName: string;
  date: Date;
  materials: { name: string; category: string; unit: string; unitPrice: any }[];
}) {
  const toFa = (n: any) => Number(n ?? 0).toLocaleString("fa-IR");
  const dateFa = props.date.toLocaleDateString("fa-IR");

  return (
    <Document title="لیست قیمت روزانه مصالح">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>لیست قیمت روزانه مصالح — {props.companyName}</Text>
        <Text style={styles.sub}>تاریخ: {dateFa}</Text>

        <View style={styles.table}>
          <View style={styles.head}>
            <Text style={styles.c1}>نام کالا</Text>
            <Text style={styles.c2}>دسته</Text>
            <Text style={styles.c3}>واحد</Text>
            <Text style={styles.c4}>قیمت واحد (تومان)</Text>
          </View>

          {props.materials.map((m, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.c1}>{m.name}</Text>
              <Text style={styles.c2}>{m.category}</Text>
              <Text style={styles.c3}>{m.unit}</Text>
              <Text style={styles.c4}>{toFa(m.unitPrice)}</Text>
            </View>
          ))}
        </View>

        <Text style={{ marginTop: 14, color: "#6b7280", fontSize: 9 }}>
          توضیح: این لیست برای محاسبه‌های جدید استفاده می‌شود. فاکتورهای صادرشده قیمت Snapshot دارند.
        </Text>
      </Page>
    </Document>
  );
}
