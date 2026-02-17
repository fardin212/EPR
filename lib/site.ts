import { prisma } from "@/lib/prisma"

export type ChatConfig = {
  enabled: boolean
  whatsapp?: string | null
  telegram?: string | null
}

export async function getChatConfig(): Promise<ChatConfig> {
  // اولویت با DB؛ اگر نبود از ENV بخوان
  const row = await prisma.siteSetting.findUnique({ where: { id: 1 } })
  const envWhats = process.env.NEXT_PUBLIC_CHAT_WHATSAPP || process.env.CHAT_WHATSAPP
  const envTel   = process.env.NEXT_PUBLIC_CHAT_TELEGRAM || process.env.CHAT_TELEGRAM
  const envEn    = (process.env.NEXT_PUBLIC_CHAT_ENABLED ?? process.env.CHAT_ENABLED) === "1"

  return {
    enabled: row?.chatEnabled ?? !!(envEn && (envWhats || envTel)),
    whatsapp: row?.whatsappNumber ?? envWhats ?? null,
    telegram: row?.telegramUsername ?? envTel ?? null,
  }
}
