// components/chat/ChatMount.tsx
"use client";

import dynamic from "next/dynamic";

// متغیرهای NEXT_PUBLIC سمت کلاینت هم در زمان build inlined می‌شوند
const CHAT_ENABLED = process.env.NEXT_PUBLIC_CHAT_ENABLED === "1";

// ChatWidget فقط در کلاینت mount شود
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

export default function ChatMount() {
  if (!CHAT_ENABLED) return null;
  return <ChatWidget />;
}
