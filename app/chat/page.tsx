// app/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: number | string;
  text: string;
  sender: "user" | "admin";
  createdAt?: string;
};

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<number | string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ساخت/لود سشن
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/chat/session", { cache: "no-store" });
      if (!r.ok) return;
      const s = (await r.json()) as { id: number | string };
      setSessionId(s.id);
    })();
  }, []);

  // لود پیام‌ها به‌صورت دوره‌ای
  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      const r = await fetch(`/api/chat/messages?sessionId=${sessionId}`, {
        cache: "no-store",
      });
      if (!r.ok) return;
      const rows = await r.json();

      const normalized: Msg[] = rows.map((m: any) => ({
        id: m.id,
        text: (m.text ?? m.content ?? "").toString(),
        sender:
          (m.sender as string)?.toLowerCase?.() === "admin" ||
          (m.role as string)?.toUpperCase?.() === "ADMIN"
            ? "admin"
            : "user",
        createdAt: m.createdAt,
      }));

      setMessages(normalized);
    };

    load();
    timer.current = setInterval(load, 2500);

    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [sessionId]);

  // اسکرول خودکار به انتهای چت
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!sessionId || !text.trim()) return;
    const clean = text.trim();

    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        text: clean,
        content: clean,
        sender: "user",
      }),
    });

    setText("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-sky-50 via-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,2.2fr),minmax(0,1.5fr)]">
        {/* ستون اصلی چت */}
        <section className="rounded-3xl bg-white/95 border border-slate-200 shadow-xl flex flex-col overflow-hidden">
          {/* هدر چت */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]" />
                <span className="text-xs font-bold text-emerald-700">
                  آنلاین پاسخ‌گو هستیم
                </span>
              </div>
              <h1 className="text-base md:text-lg font-black text-slate-900">
                گفتگو با پشتیبانی کانکس نیکان
              </h1>
              <p className="text-[0.75rem] text-slate-500">
                سوالات فنی، استعلام قیمت، وضعیت سفارش یا پیگیری تعمیرات را
                می‌توانید همین‌جا بپرسید.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end text-[0.7rem] text-slate-500">
              <span>ساعات پاسخ‌گویی: ۹ تا ۱۸</span>
              <span>همراه: ۰۹xx xxx xx xx</span>
            </div>
          </div>

          {/* بدنه چت */}
          <div
            ref={scrollRef}
            className="flex-1 px-4 md:px-5 py-4 space-y-2 overflow-y-auto bg-slate-50/60"
          >
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                هنوز پیامی ارسال نشده است؛ اولین پیام را شما بفرستید.
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex w-full ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-xs md:text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-gradient-to-l from-indigo-500 via-sky-500 to-blue-500 text-white rounded-br-sm"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* فوتر ارسال پیام */}
          <div className="px-4 md:px-5 py-3 border-t border-slate-200 bg-white/95 flex items-center gap-2">
            <input
              className="input flex-1 text-sm"
              placeholder="پیام خود را بنویسید..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="btn-primary text-sm font-bold px-4 py-2" onClick={send}>
              ارسال
            </button>
          </div>
        </section>

        {/* ستون کناری: راه‌های ارتباط دیگر */}
        <aside className="space-y-4">
          {/* کارت توضیحات */}
          <div className="rounded-3xl bg-white/95 border border-slate-200 shadow-md p-5 space-y-3 text-xs md:text-sm text-slate-700">
            <div className="font-extrabold text-slate-900">
              سریع‌ترین راه ارتباطی با نیکان
            </div>
            <p className="leading-relaxed">
              اگر در مورد انتخاب نوع کانکس، زمان تحویل، امکان تعمیر یا قیمت
              سوالی دارید، از چت آنلاین استفاده کنید تا مستقیماً با واحد
              پشتیبانی در ارتباط باشید.
            </p>
            <p className="text-[0.75rem] text-slate-500">
              در خارج از ساعات کاری، پیام شما ثبت می‌شود و در اولین زمان کاری
              پاسخ داده خواهد شد.
            </p>
          </div>

          {/* کارت دکمه‌های واتساپ / تلگرام / تماس */}
          <div className="rounded-3xl bg-slate-900 text-slate-50 shadow-xl border border-slate-800 p-5 space-y-4">
            <div className="text-sm font-extrabold">
              ترجیح می‌دهید در واتساپ یا تلگرام پیام دهید؟
            </div>
            <p className="text-[0.8rem] text-slate-200 leading-relaxed">
              اگر به ارسال عکس، وویس یا لوکیشن نیاز دارید، یکی از پیام‌رسان‌های
              زیر را انتخاب کنید تا گفتگو در همان محیط ادامه پیدا کند.
            </p>

            <div className="space-y-2">
              {/* TODO: این لینک‌ها را با اطلاعات خودت عوض کن */}
              <a
                href="https://wa.me/989121234567"
                target="_blank"
                className="flex items-center justify-between rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs md:text-sm font-bold transition"
              >
                <span>گفتگو در واتساپ</span>
                <span className="text-[0.7rem] opacity-90">
                  ارسال عکس و موقعیت
                </span>
              </a>

              <a
                href="https://t.me/your_channel_or_username"
                target="_blank"
                className="flex items-center justify-between rounded-2xl bg-sky-500/90 hover:bg-sky-500 text-white px-4 py-2.5 text-xs md:text-sm font-bold transition"
              >
                <span>گفتگو در تلگرام</span>
                <span className="text-[0.7rem] opacity-90">کانال و پشتیبانی</span>
              </a>

              <a
                href="tel:02100000000"
                className="flex items-center justify-between rounded-2xl bg-white text-slate-900 border border-slate-300 px-4 py-2.5 text-xs md:text-sm font-bold hover:border-indigo-500 hover:text-indigo-600 transition"
              >
                <span>تماس مستقیم با واحد فروش</span>
                <span className="text-[0.7rem] text-slate-500">
                  ۰۲۱ - ۰۰۰ ۰۰ ۰۰
                </span>
              </a>
            </div>
          </div>

          {/* کارت کوچک وضعیت */}
          <div className="rounded-2xl bg-white/90 border border-dashed border-slate-300 p-4 text-[0.75rem] text-slate-600 leading-relaxed">
            <div className="font-bold text-slate-800 mb-1">
              وضعیت اتصال به چت آنلاین
            </div>
            {sessionId ? (
              <p className="m-0">
                ارتباط با سرور برقرار است و پیام‌های شما به‌صورت لحظه‌ای برای
                تیم پشتیبانی ارسال می‌شود.
              </p>
            ) : (
              <p className="m-0">
                در حال برقراری ارتباط با سرور چت هستیم… اگر بیش از چند ثانیه
                طول کشید، صفحه را رفرش کنید یا از واتساپ استفاده کنید.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
