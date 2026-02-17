require("dotenv").config({ path: "/var/www/nikan-site/.env" });

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log("[ENV] hasToken:", !!token, "hasChatId:", !!chatId);

if (!token || !chatId) {
  console.log("[ENV] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env");
  process.exit(1);
}

fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ chat_id: chatId, text: "✅ TEST: Telegram from tg-test.cjs" }),
})
  .then((r) => r.text())
  .then((t) => console.log("[TG]", t))
  .catch((e) => console.error("[ERR]", e));
