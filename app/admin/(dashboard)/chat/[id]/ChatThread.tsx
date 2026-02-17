"use client";

import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import ReplyBox from "./ReplyBox";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ChatThread({ session }: { session: any }) {
  const sessionId = session.id;

  // ریل‌تایم: هر 2 ثانیه آپدیت
  const { data, mutate } = useSWR(
    `/api/chat/sessions/${sessionId}?take=250`,
    fetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
      fallbackData: session, // از دیتای سرور ساید شروع کن
    }
  );

  const messages = data?.messages || [];
  const boxRef = useRef<HTMLDivElement>(null);
  const [optimisticIds] = useState(new Set<string>());

  // اسکرول خودکار به پایین با هر پیام جدید
  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages.length]);

  return (
    <div className="flex flex-col">
      <div
        ref={boxRef}
        className="
          h-[65vh] overflow-y-auto
          rounded-2xl p-3
          bg-slate-50 dark:bg-slate-950
          border border-[var(--line)]
        "
      >
        {messages.map((m: any) => {
          const isAdmin = m.role === "ADMIN";
          const isPending = optimisticIds.has(m.clientId);
          return (
            <div
              key={m.id || m.clientId}
              className={[
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-7 shadow-sm mb-3",
                isAdmin
                  ? "ml-auto bg-slate-900 text-slate-50 border border-white/10"
                  : "mr-auto bg-white text-slate-900 border border-slate-200",
                isPending ? "opacity-70" : "opacity-100",
              ].join(" ")}
            >
              {m.content}
              <div
                className={[
                  "mt-1 text-[10px] opacity-70",
                  isAdmin ? "text-slate-300" : "text-slate-500",
                ].join(" ")}
              >
                {new Date(m.createdAt).toLocaleString("fa-IR")}
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-10">
            هنوز پیامی ثبت نشده است.
          </div>
        )}
      </div>

      {/* ReplyBox آماده است؛ فقط به mutate وصل می‌کنیم */}
      <ReplyBox
        sessionId={sessionId}
        onWillSend={(clientId) => {
          optimisticIds.add(clientId);
          mutate(
            {
              ...data,
              messages: [
                ...(messages || []),
                {
                  id: clientId,
                  clientId,
                  role: "ADMIN",
                  content: (document.querySelector("input") as any)?.value || "",
                  createdAt: new Date().toISOString(),
                },
              ],
            },
            { revalidate: false }
          );
        }}
        onSent={() => {
          optimisticIds.clear();
          mutate(); // بعد از ارسال ادمین، فوراً دیتا رفرش میشه
        }}
      />
    </div>
  );
}
