import { testTelegram } from "./actions";

export default function TelegramTestPage() {
  return (
    <form action={testTelegram}>
      <button className="px-4 py-2 rounded bg-green-600 text-white">
        تست ارسال تلگرام
      </button>
    </form>
  );
}
