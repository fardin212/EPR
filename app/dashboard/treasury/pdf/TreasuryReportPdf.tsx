import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";

type Props = {
  companyName: string;
  from: Date;
  to: Date;
  accounts: Array<{ title: string; type: string; openingBalance: number; balance: number }>;
  cashflow: { inflow: number; outflow: number; net: number };
  txs: Array<{ date: Date; direction: string; method: string; amount: number; account: string; refNo: string; note: string }>;
};

const styles: any = {
  page: { padding: 24, fontSize: 10 },
  row: { flexDirection: "row" },
  h1: { fontSize: 14, marginBottom: 8 },
  muted: { color: "#666" },
  card: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 10 },
  th: { fontWeight: 700 },
  cell: { paddingVertical: 4, paddingHorizontal: 4 },
  tableHeader: { borderBottomWidth: 1, borderColor: "#ddd", paddingBottom: 6, marginBottom: 6 },
};

function fmt(n: number) {
  try { return n.toLocaleString("fa-IR"); } catch { return String(n); }
}
function fmtDate(d: Date) {
  try { return new Date(d).toISOString().slice(0,10); } catch { return "—"; }
}

export function TreasuryReportPdf(p: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>گزارش خزانه — {p.companyName}</Text>
        <Text style={styles.muted}>از {fmtDate(p.from)} تا {fmtDate(p.to)}</Text>

        <View style={styles.card}>
          <Text style={styles.th}>جریان نقدی (IN/OUT)</Text>
          <Text>ورودی: {fmt(p.cashflow.inflow)}   خروجی: {fmt(p.cashflow.outflow)}   خالص: {fmt(p.cashflow.net)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.th}>مانده حساب‌ها</Text>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.cell, { width: "45%" }, styles.th]}>حساب</Text>
            <Text style={[styles.cell, { width: "20%" }, styles.th]}>نوع</Text>
            <Text style={[styles.cell, { width: "17.5%" }, styles.th]}>اول دوره</Text>
            <Text style={[styles.cell, { width: "17.5%" }, styles.th]}>مانده</Text>
          </View>
          {p.accounts.map((a, i) => (
            <View key={i} style={styles.row}>
              <Text style={[styles.cell, { width: "45%" }]}>{a.title}</Text>
              <Text style={[styles.cell, { width: "20%" }]}>{a.type}</Text>
              <Text style={[styles.cell, { width: "17.5%" }]}>{fmt(a.openingBalance)}</Text>
              <Text style={[styles.cell, { width: "17.5%" }]}>{fmt(a.balance)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.th}>لیست تراکنش‌ها</Text>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.cell, { width: "14%" }, styles.th]}>تاریخ</Text>
            <Text style={[styles.cell, { width: "10%" }, styles.th]}>نوع</Text>
            <Text style={[styles.cell, { width: "14%" }, styles.th]}>روش</Text>
            <Text style={[styles.cell, { width: "16%" }, styles.th]}>مبلغ</Text>
            <Text style={[styles.cell, { width: "20%" }, styles.th]}>حساب</Text>
            <Text style={[styles.cell, { width: "12%" }, styles.th]}>ارجاع</Text>
            <Text style={[styles.cell, { width: "14%" }, styles.th]}>توضیح</Text>
          </View>

          {p.txs.slice(0, 120).map((t, i) => (
            <View key={i} style={[styles.row, { borderBottomWidth: 1, borderColor: "#eee" }]}>
              <Text style={[styles.cell, { width: "14%" }]}>{fmtDate(t.date)}</Text>
              <Text style={[styles.cell, { width: "10%" }]}>{t.direction}</Text>
              <Text style={[styles.cell, { width: "14%" }]}>{t.method}</Text>
              <Text style={[styles.cell, { width: "16%" }]}>{fmt(t.amount)}</Text>
              <Text style={[styles.cell, { width: "20%" }]}>{t.account}</Text>
              <Text style={[styles.cell, { width: "12%" }]}>{t.refNo || "—"}</Text>
              <Text style={[styles.cell, { width: "14%" }]}>{t.note || "—"}</Text>
            </View>
          ))}

          <Text style={[styles.muted, { marginTop: 6 }]}>
            * برای جلوگیری از سنگین شدن PDF، فعلاً حداکثر ۱۲۰ ردیف نمایش داده می‌شود.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
