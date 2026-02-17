// app/admin/(dashboard)/chat/page.tsx

import nextDynamic from "next/dynamic";
import { requireAdmin } from "@/lib/adminGuard";

// ChatAdmin یک کامپوننت کاملاً Client است، پس بدون SSR لودش می‌کنیم
const ChatAdmin = nextDynamic(() => import("@/components/chat/ChatAdmin"), {
  ssr: false,
});

export const dynamic = "force-dynamic";

export default async function AdminChatPage() {
  // گارد دسترسی ادمین (سمت سرور)
  await requireAdmin();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 text-[var(--text)]">
      <header className="mb-5">
        <h1 className="text-xl font-bold">چت آنلاین کاربران</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          از این بخش می‌توانید پیام‌های کاربران سایت را به‌صورت لحظه‌ای ببینید و پاسخ دهید.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-0 overflow-hidden">
        {/* پنل چت جدید ادمین */}
        <ChatAdmin />
      </section>
    </main>
  );
}
