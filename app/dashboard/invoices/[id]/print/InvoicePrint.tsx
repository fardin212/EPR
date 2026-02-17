import "./print.css";
import { formatRial, toPersianDigits, rialToPersianWords } from "@/lib/persianNumbers";

type InvoiceItem = {
  title: string;
  qty: number;
  unit: string;
  unitPriceToman: number; // قیمت واحد (تومان) از دیتابیس
};

type InvoicePrintProps = {
  docType: "PREINVOICE" | "INVOICE";
  docNo: string;

  /**
   * ✅ برای سازگاری: اگر page.tsx یکی از این دو را پاس بدهد مشکلی نیست
   * - dateISO: "2025-12-27"
   * - date:    "2025-12-27" یا Date یا string
   */
  dateISO?: string | null;
  date?: string | Date | null;

  customerName: string;
  customerMobile?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;

  specs?: Array<{ label: string; value: string }>;

  items: InvoiceItem[];
  discountToman?: number | null;
  shippingToman?: number | null;
  taxToman?: number | null;

  payInfo?: {
    bankName?: string;
    iban?: string;
    accountNo?: string;
    owner?: string;
  };

  terms?: string[];
};

function safeNumber(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function normalizeDateString(input?: string | Date | null) {
  if (!input) return "—";
  // اگر Date بود
  if (input instanceof Date) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, "0");
    const d = String(input.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  }
  // اگر string بود
  const s = String(input).trim();
  if (!s) return "—";
  // فقط 10 کاراکتر اول (YYYY-MM-DD)
  const t = s.slice(0, 10).replace(/-/g, "/");
  return t || "—";
}

export default function InvoicePrint(props: InvoicePrintProps) {
  const {
    docType,
    docNo,
    dateISO,
    date,
    customerName,
    customerMobile,
    customerPhone,
    customerAddress,
    specs = [],
    items,
    discountToman = 0,
    shippingToman = 0,
    taxToman = 0,
    payInfo,
    terms = [],
  } = props;

  // ✅ تاریخ: اولویت با dateISO، بعد date
  const dateText = toPersianDigits(normalizeDateString(dateISO ?? date));

  const itemsRial = (items || []).map((i) => {
    const unitPriceRial = safeNumber(i.unitPriceToman) * 10;
    const qty = safeNumber(i.qty);
    const lineTotalRial = unitPriceRial * qty;
    return { ...i, unitPriceRial, lineTotalRial, qty };
  });

  const subtotalRial = itemsRial.reduce((s, i) => s + safeNumber(i.lineTotalRial), 0);
  const discountRial = safeNumber(discountToman) * 10;
  const shippingRial = safeNumber(shippingToman) * 10;
  const taxRial = safeNumber(taxToman) * 10;
  const grandRial = subtotalRial - discountRial + shippingRial + taxRial;

  const docTitle = docType === "PREINVOICE" ? "پیش‌فاکتور" : "فاکتور";

  return (
    <div className="print-root print-a4">
      <div className="card">
        {/* Header */}
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 14 }}>گروه صنعتی نیکان سازه پایدار</div>
            <div className="small muted">
              تلفن: {toPersianDigits("09124237146")} - {toPersianDigits("09123679252")} • سایت: conexnikan.com • اینستاگرام: conexnikan1
            </div>
            <div className="small muted">
              آدرس: تهران، اتوبان آزادگان غرب به شرق، بعد از اتوبان ساوه - کوچه امید - کانکس نیکان
            </div>
          </div>

          <div style={{ width: "38mm", textAlign: "left" }}>
            <div
              style={{
                height: "18mm",
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontWeight: 800,
              }}
            >
              LOGO
            </div>
            <div style={{ marginTop: 8, fontWeight: 900 }}>{docTitle}</div>
          </div>
        </div>

        <div className="hr" />

        {/* Doc + Buyer */}
        <div className="row">
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>مشخصات سند</div>
            <div className="kv">
              <div className="item">
                <span className="lbl">شماره:</span>
                <span className="val">{toPersianDigits(docNo)}</span>
              </div>

              <div className="item">
                <span className="lbl">تاریخ:</span>
                <span className="val">{dateText}</span>
              </div>

              <div className="item">
                <span className="lbl">نوع:</span>
                <span className="val">{docTitle}</span>
              </div>

              <div className="item">
                <span className="lbl">واحد پول:</span>
                <span className="val">ریال</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ flex: 1.3 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>مشخصات خریدار</div>
            <div className="kv">
              <div className="item">
                <span className="lbl">نام/شرکت:</span>
                <span className="val">{customerName}</span>
              </div>
              <div className="item">
                <span className="lbl">همراه:</span>
                <span className="val">{customerMobile ? toPersianDigits(customerMobile) : "—"}</span>
              </div>
              <div className="item">
                <span className="lbl">تلفن:</span>
                <span className="val">{customerPhone ? toPersianDigits(customerPhone) : "—"}</span>
              </div>
              <div className="item">
                <span className="lbl">آدرس:</span>
                <span className="val">{customerAddress ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specs */}
        {!!specs.length && (
          <>
            <div style={{ height: 8 }} />
            <div className="card">
              <div style={{ fontWeight: 900, marginBottom: 6 }}>مشخصات فنی</div>
              <div className="grid2">
                {specs.map((s, idx) => (
                  <div className="field" key={idx}>
                    <div className="lbl">{s.label}</div>
                    <div className="val">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ height: 8 }} />

        {/* Items + Totals */}
        <div className="row">
          <div className="card" style={{ flex: 1.45 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>آیتم‌های قیمت</div>

            {/* ترتیب ستون‌ها RTL استاندارد: مبلغ | قیمت واحد | واحد | تعداد | شرح */}
            <table>
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>مبلغ (ریال)</th>
                  <th style={{ width: "20%" }}>قیمت واحد (ریال)</th>
                  <th style={{ width: "12%" }}>واحد</th>
                  <th style={{ width: "10%" }}>تعداد</th>
                  <th>شرح</th>
                </tr>
              </thead>
              <tbody>
                {itemsRial.map((it, idx) => (
                  <tr key={idx}>
                    <td>{formatRial(it.lineTotalRial)}</td>
                    <td>{formatRial(it.unitPriceRial)}</td>
                    <td>{it.unit}</td>
                    <td>{toPersianDigits(String(it.qty))}</td>
                    <td>{it.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="totals" style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>جمع‌بندی</div>
            <div className="line">
              <span className="muted">جمع جزء</span>
              <b>{formatRial(subtotalRial)}</b>
            </div>
            <div className="line">
              <span className="muted">تخفیف</span>
              <b>{formatRial(discountRial)}</b>
            </div>
            <div className="line">
              <span className="muted">حمل</span>
              <b>{formatRial(shippingRial)}</b>
            </div>
            <div className="line">
              <span className="muted">مالیات</span>
              <b>{formatRial(taxRial)}</b>
            </div>

            <div className="grand line">
              <span>جمع کل</span>
              <span>{formatRial(grandRial)} ریال</span>
            </div>

            <div className="hr" />
            <div className="small">
              <b>مبلغ به حروف:</b> {rialToPersianWords(grandRial)} ریال
            </div>
          </div>
        </div>

        {/* Terms + Pay */}
        <div style={{ height: 8 }} />
        <div className="card">
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1.2 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>توضیحات و شرایط</div>
              <div className="small">
                {(terms.length
                  ? terms
                  : [
                      "زمان تحویل: ۱۰ روز پس از پرداخت بیعانه",
                      "هزینه حمل و بارگیری به عهده خریدار می‌باشد",
                      "انبارداری/تاخیر: در صورت تاخیر مبلغ توافقی بابت انبارداری دریافت می‌شود",
                      "شرایط پرداخت: ۵۰٪ پیش‌پرداخت و الباقی به صورت توافقی",
                      "کار دارای ضمانت مجموعه می‌باشد",
                    ]
                ).map((t, i) => (
                  <div key={i}>• {t}</div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>شماره حساب و شبا</div>
              <div className="small">
                <div>{payInfo?.bankName ?? "بانک شهر"}</div>
                <div>شبا: {payInfo?.iban ? toPersianDigits(payInfo.iban) : "IR210610000000700825306569"}</div>
                <div>شماره حساب: {payInfo?.accountNo ? toPersianDigits(payInfo.accountNo) : "۷۰۰۸۲۵۳۰۶۵۶۹"}</div>
                <div>به نام: {payInfo?.owner ?? "امین رسولی"}</div>
              </div>
            </div>
          </div>

          <div style={{ height: 8 }} />
          <div className="signrow">
            <div className="sign">مهر و امضای فروشنده</div>
            <div className="sign">مهر و امضای خریدار</div>
          </div>

          <div className="small muted" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <div>conexnikan.com</div>
            <div>conexnikan1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
