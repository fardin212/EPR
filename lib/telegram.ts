// lib/telegram.ts

type SendResult = { ok: true } | { ok: false; error: string };

function esc(v: unknown): string {
  // Prevent breaking Telegram HTML parse_mode
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function digitsOnly(v: unknown): string {
  return String(v ?? "").replace(/[^\d]/g, "");
}

export async function sendTelegram(text: string): Promise<SendResult> {
  const url = process.env.TELEGRAM_RELAY_URL;
  const secret = process.env.TELEGRAM_RELAY_SECRET;

  if (!url || !secret) {
    return { ok: false, error: "Missing TELEGRAM_RELAY_URL/TELEGRAM_RELAY_SECRET" };
  }

  // Timeout guard (important for server actions)
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    const raw = await res.text().catch(() => "");

    if (!res.ok) {
      return { ok: false, error: `Relay HTTP ${res.status}: ${raw || "No body"}` };
    }

    // Worker returns Telegram JSON body.
    // We don't strictly parse it to avoid throwing on unexpected responses.
    if (raw.includes('"ok":true')) return { ok: true };

    return { ok: false, error: raw || "Unknown response" };
  } catch (e: any) {
    const msg =
      e?.name === "AbortError" ? "Timeout while calling relay" : (e?.message || "Unknown error");
    return { ok: false, error: msg };
  } finally {
    clearTimeout(t);
  }
}

// -----------------------
// Message templates
// -----------------------

export function buildUsedConexLeadMessage(input: {
  leadId?: string;
  slug?: string;
  name?: string;
  phone?: string;
  city?: string;
  type?: string;
  size?: string;
  note?: string;
  source?: string;
  isSell?: boolean; // true: فروش / false: درخواست قیمت/خرید
}) {
  const phoneDigits = digitsOnly(input.phone);
  const wa = phoneDigits ? `https://wa.me/98${phoneDigits.replace(/^0/, "")}` : "";

  return [
    `🆕 <b>${input.isSell ? "لید جدید فروش کانکس دست دوم" : "لید جدید درخواست قیمت کانکس دست دوم"}</b>`,
    `━━━━━━━━━━━━`,
    input.slug ? `• مورد: <b>${esc(input.slug)}</b>` : null,
    input.leadId ? `• کد لید: <code>${esc(input.leadId)}</code>` : null,
    `• نام: <b>${esc(input.name) || "-"}</b>`,
    `• تماس: <b>${esc(input.phone) || "-"}</b>`,
    wa ? `• واتساپ: ${esc(wa)}` : null,
    `• شهر: ${esc(input.city) || "-"}`,
    `• نوع: ${esc(input.type) || "-"}`,
    `• ابعاد: ${esc(input.size) || "-"}`,
    input.note ? `• توضیح: ${esc(input.note)}` : null,
    input.source ? `• منبع: ${esc(input.source)}` : null,
    `━━━━━━━━━━━━`,
    `#usedConex #lead`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildAdminTestMessage() {
  const now = new Date().toLocaleString("fa-IR");
  return `🧪 <b>تست از پنل ادمین کانکس نیکان</b>\n⏱ ${esc(now)}\n✅ OK`;
}
