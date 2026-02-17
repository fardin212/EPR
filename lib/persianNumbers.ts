const faDigits = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];

export function toPersianDigits(input: string) {
  return String(input).replace(/\d/g, d => faDigits[Number(d)]);
}

export function formatRial(rial: number) {
  const n = Math.round(Number(rial || 0));
  return toPersianDigits(n.toLocaleString("en-US"));
}

const YEKAN = ["","یک","دو","سه","چهار","پنج","شش","هفت","هشت","نه"];
const DAH = ["ده","یازده","دوازده","سیزده","چهارده","پانزده","شانزده","هفده","هجده","نوزده"];
const DAHGAN = ["","ده","بیست","سی","چهل","پنجاه","شصت","هفتاد","هشتاد","نود"];
const SADGAN = ["","صد","دویست","سیصد","چهارصد","پانصد","ششصد","هفتصد","هشتصد","نهصد"];

const SCALE = [
  { v: 1_000_000_000_000, t: "تریلیون" },
  { v: 1_000_000_000,     t: "میلیارد" },
  { v: 1_000_000,         t: "میلیون" },
  { v: 1_000,             t: "هزار" },
];

function chunkToWords(n: number): string {
  // n: 0..999
  if (n === 0) return "";
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;

  if (hundreds) parts.push(SADGAN[hundreds]);

  if (rest) {
    if (rest < 10) parts.push(YEKAN[rest]);
    else if (rest < 20) parts.push(DAH[rest - 10]);
    else {
      const tens = Math.floor(rest / 10);
      const ones = rest % 10;
      if (tens) parts.push(DAHGAN[tens]);
      if (ones) parts.push(YEKAN[ones]);
    }
  }

  return parts.filter(Boolean).join(" و ");
}

export function numberToPersianWords(num: number): string {
  let n = Math.floor(Number(num || 0));
  if (n === 0) return "صفر";
  if (n < 0) return `منفی ${numberToPersianWords(Math.abs(n))}`;

  const out: string[] = [];

  for (const s of SCALE) {
    if (n >= s.v) {
      const q = Math.floor(n / s.v);
      n = n % s.v;
      const w = numberToPersianWords(q);
      out.push(`${w} ${s.t}`);
    }
  }

  if (n > 0) out.push(chunkToWords(n));

  return out.join(" و ").replace(/\s+/g, " ").trim();
}

/** ورودی ریال؛ خروجی فقط حروف (بدون واحد) */
export function rialToPersianWords(rial: number) {
  return numberToPersianWords(Math.round(rial));
}

/** اگر ورودی تومان داشتی و می‌خوای ریالی/حروفی: */
export function tomanToRial(toman: number) {
  return Math.round(Number(toman || 0) * 10);
}
