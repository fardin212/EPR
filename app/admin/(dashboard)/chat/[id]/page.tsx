// app/admin/(dashboard)/chat/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { PrismaClient } from "@prisma/client";
import ChatThread from "./ChatThread";
import StatusBadge from "../ui/StatusBadge";
import SourceBadge from "../ui/SourceBadge";
import DeleteButton from "../ui/DeleteButton";
import { requireAdmin } from "@/lib/adminGuard";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  await requireAdmin(); // ✅ گارد مرکزی

  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) notFound();

  const session = await prisma.chatSession.findUnique({
    where: { id: idNum },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) notFound();

  const clientSession = {
    id: session.id,
    name: session.name || "",
    phone: session.phone || "",
    source: (session as any).source || "ONLINE",
    status: session.status,
    updatedAt: session.updatedAt.toISOString(),
    messages: session.messages.map((m: any) => ({
      id: String(m.id),
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 text-[var(--text)]">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">گفت‌وگو #{clientSession.id}</h1>
              <SourceBadge value={clientSession.source as any} id={clientSession.id} />
              <StatusBadge value={clientSession.status as any} id={clientSession.id} />
            </div>
            <div className="text-sm text-[var(--muted)] mt-1">
              <span className="font-medium">{clientSession.name || "بدون نام"}</span>
              <span className="mx-2">•</span>
              <span dir="ltr">{clientSession.phone || "—"}</span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              href="/admin/chat"
              className="px-3 py-2 rounded-xl border border-[var(--line)] hover:bg-[var(--surface)] text-sm"
            >
              بازگشت
            </Link>

            <form action={`/api/chat/admin/bulk`} method="POST" className="hidden sm:block">
              <input type="hidden" name="ids[]" value={clientSession.id} />
              <input type="hidden" name="action" value="archive" />
              <button className="px-3 py-2 rounded-xl border border-[var(--line)] hover:bg-[var(--accent)]/15 hover:text-[var(--accent)] text-sm">
                بایگانی
              </button>
            </form>

            <DeleteButton id={clientSession.id} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
        <ChatThread session={clientSession as any} />
      </div>
    </main>
  );
}
