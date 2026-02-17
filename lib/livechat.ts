// lib/livechat.ts
import { prisma } from "@/lib/db";

export type BroadcastPayload = { message: string; sessionId?: number };

export async function adminBroadcast(payload: BroadcastPayload) {
  // TODO: اینجا هر لاجیک برادکست/ارسال پیام به سشن‌ها
  // مثلا ثبت در DB یا Publish به Redis/Pusher و...
  if (!payload?.message) return;
  await prisma.adminMessage.create({
    data: {
      message: payload.message,
      sessionId: payload.sessionId != null ? String(payload.sessionId) : null,
    },
  });
}

export async function saveAdminMessage(payload: { message: string; sessionId?: string | number | null }) {
  if (!payload?.message) return;

  await prisma.adminMessage.create({
    data: {
      message: payload.message,
      sessionId: payload.sessionId != null ? String(payload.sessionId) : null,
    },
  });
}

export async function listSessions() {
  return prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
  });
}
