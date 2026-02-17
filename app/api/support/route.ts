import { NextResponse } from "next/server";

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT  = process.env.TELEGRAM_CHAT_ID;

const WA_ID    = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WA_TPL   = process.env.WHATSAPP_TEMPLATE_NAME || "";
const WA_LANG  = process.env.WHATSAPP_TEMPLATE_LANG || "fa";

export async function POST(req: Request) {
  try {
    const { name = "", phone = "", message = "", source = "site" } = await req.json();

    // اعتبارسنجی ساده
    if (!name || !message) {
      return NextResponse.json({ ok: false, error: "نام و پیام الزامی است." }, { status: 400 });
    }

    const jobs: Promise<any>[] = [];

    // 1) ارسال به تلگرام مدیر (آسان‌ترین راه)
    if (TG_TOKEN && TG_CHAT) {
      const text =
        `💬 پیام جدید (${source})` +
        `\n👤 نام: ${name}` +
        (phone ? `\n📞 تلفن: ${phone}` : "") +
        `\n📝 پیام:\n${message}`;
      jobs.push(fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TG_CHAT, text }),
      }));
    }

    // 2) واتس‌اپ: ارسال template به کاربر (اگر بیزینس و تنظیمات دارید)
    // توجه: نیاز به template تاییدشده دارد و شماره باید با کد کشور و بدون + باشد (مثلاً 98912XXXXXXX)
    if (WA_ID && WA_TOKEN && WA_TPL && phone) {
      const normalized = phone.replace(/\D/g, "").replace(/^0/, "98"); // ایران: 09.. -> 989..
      jobs.push(fetch(`https://graph.facebook.com/v21.0/${WA_ID}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalized,
          type: "template",
          template: {
            name: WA_TPL,
            language: { code: WA_LANG },
            // اگر template پارامتر دارد:
            // components: [{ type: "body", parameters: [{ type:"text", text: name }]}]
          },
        }),
      }));
    }

    await Promise.allSettled(jobs);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
