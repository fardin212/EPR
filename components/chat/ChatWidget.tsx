"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Role = "USER" | "ADMIN" | "SYSTEM";
type Msg = { id: string; role: Role; content: string; createdAt: string };

type ClientSession = {
  id: number;
  name: string;
  phone: string;
  source: "ONLINE" | "WHATSAPP" | "TELEGRAM";
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  updatedAt: string;
  messages: Msg[];
};

type ServerEvt = {
  type: "message";
  role: "USER" | "ADMIN";
  content: string;
  createdAt: string;
  clientId?: string;
};

function fmt(d: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(d));
}

type Tab = "online" | "whatsapp" | "telegram";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("online");

  const [session, setSession] = useState<ClientSession | null>(null);
  const [items, setItems] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const ownCidsRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // واتساپ و تلگرام واقعی خودت را اینجا وارد کن
  const WHATSAPP_URL = "https://wa.me/989121234567"; // شماره با 98+
  const TELEGRAM_URL = "https://t.me/your_username";

  // لود سشن و پیام‌ها (همان API فعلی‌ات) 
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/chat/sessions", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error || "FAILED");
        if (cancelled) return;

        setSession(json.session);
        setItems(json.session.messages || []);
      } catch (e) {
        console.error("chat init error", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // SSE برای دریافت پیام‌های جدید
  useEffect(() => {
    if (!session?.id || esRef.current) return;

    const es = new EventSource(`/api/chat/stream/${session.id}`);
    esRef.current = es;

    es.addEventListener("message", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as ServerEvt;
        if (data?.type !== "message") return;

        // پیام‌هایی که خودمان ارسال کردیم دوباره نیا
        if (data.clientId && ownCidsRef.current.has(data.clientId)) return;

        setItems((prev) => [
          ...prev,
          {
            id: `sse_${Date.now()}`,
            role: data.role,
            content: data.content,
            createdAt: data.createdAt,
          },
        ]);
      } catch (err) {
        console.error("sse parse error", err);
      }
    });

    es.onerror = () => {
      // خطای استریم را ساکت نگه می‌داریم
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [session?.id]);

  // اسکرول خودکار به آخر چت
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [items, open, activeTab]);

  async function send() {
    const t = text.trim();
    if (!t || loading) return;

    const clientId = crypto.randomUUID?.() || `${Date.now()}_${Math.random()}`;
    ownCidsRef.current.add(clientId);
    setTimeout(() => ownCidsRef.current.delete(clientId), 60_000);

    // optimistic UI
    setItems((prev) => [
      ...prev,
      {
        id: `tmp_${Date.now()}`,
        role: "USER",
        content: t,
        createdAt: new Date().toISOString(),
      },
    ]);
    setText("");

    setLoading(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: t,
          clientId,
          name: session?.name,
          phone: session?.phone,
          source: session?.source || "ONLINE",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "FAILED");

      // اگر در بک‌اند سشن جدید ساخته شد، دوباره لود کن
      if (json.sessionId && session?.id !== json.sessionId) {
        const sRes = await fetch("/api/chat/sessions", { cache: "no-store" });
        const sJson = await sRes.json();
        if (sRes.ok && sJson?.ok) {
          setSession(sJson.session);
          setItems(sJson.session.messages || []);
        }
      }
    } catch (e) {
      console.error("send failed", e);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const canSend = text.trim().length > 0 && !loading;

  const safeItems = useMemo(
    () =>
      (items || [])
        .filter(Boolean)
        .filter((m: any) => m?.role && m?.content),
    [items]
  );

  // اگر چت باز شد، ESC آن را ببندد
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* دکمه شناور متحرک */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="cnx-chat-fab"
        aria-label="چت آنلاین کانکس نیکان"
      >
        <div className="cnx-chat-fab-inner">
          <span className="cnx-chat-dot" />
          💬
        </div>
        <span className="cnx-chat-fab-label hidden sm:inline">
          گفتگو با نیکان
        </span>
      </button>

      {/* پنل اصلی */}
      <div
        className={`cnx-chat-panel ${open ? "cnx-chat-panel-open" : ""}`}
        role="dialog"
        aria-modal="false"
      >
        {/* هدر */}
        <div className="cnx-chat-header">
          <div className="flex items-center gap-2">
            <div className="cnx-chat-avatar">
              <span>NK</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-[0.8rem] font-extrabold text-slate-900">
                پشتیبانی کانکس نیکان
              </div>
              <div className="flex items-center gap-1 text-[0.7rem] text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                آنلاین هستیم
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="cnx-chat-close"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>

        {/* تب‌ها */}
        <div className="cnx-chat-tabs">
          <button
            onClick={() => setActiveTab("online")}
            className={`cnx-chat-tab ${
              activeTab === "online" ? "active" : ""
            }`}
          >
            چت آنلاین
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`cnx-chat-tab ${
              activeTab === "whatsapp" ? "active" : ""
            }`}
          >
            واتساپ
          </button>
          <button
            onClick={() => setActiveTab("telegram")}
            className={`cnx-chat-tab ${
              activeTab === "telegram" ? "active" : ""
            }`}
          >
            تلگرام
          </button>
        </div>

        {/* بدنه تب‌ها */}
        {activeTab === "online" && (
          <div className="cnx-chat-body">
            <div className="cnx-chat-body-inner" ref={scrollRef}>
              {safeItems.length === 0 && (
                <div className="cnx-chat-empty">
                  سلام 👋
                  <br />
                  نوع کانکس، متراژ تقریبی و شهر پروژه را بنویسید تا سریع مشاوره
                  بدهیم.
                </div>
              )}

              {safeItems.map((m, i) => {
                const isUser = m.role === "USER";
                const isAdmin = m.role === "ADMIN";
                return (
                  <div
                    key={m.id + "_" + i}
                    className={`cnx-chat-row ${
                      isUser ? "cnx-chat-row-user" : "cnx-chat-row-admin"
                    }`}
                  >
                    <div
                      className={[
                        "cnx-chat-bubble",
                        isUser
                          ? "cnx-chat-bubble-user"
                          : isAdmin
                          ? "cnx-chat-bubble-admin"
                          : "cnx-chat-bubble-system",
                      ].join(" ")}
                    >
                      <div className="cnx-chat-meta">
                        {isUser
                          ? "شما"
                          : isAdmin
                          ? "پشتیبانی"
                          : "سیستم"}{" "}
                        • {fmt(m.createdAt)}
                      </div>
                      <div className="whitespace-pre-wrap text-[0.8rem] leading-relaxed">
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* فوتر ارسال */}
            <div className="cnx-chat-input">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKey}
                placeholder="پیام خود را بنویسید…"
                className="cnx-chat-input-field"
                dir="rtl"
              />
              <button
                onClick={send}
                disabled={!canSend}
                className="cnx-chat-input-send"
              >
                {loading ? "..." : "ارسال"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="cnx-chat-body cnx-chat-alt">
            <div className="space-y-3 text-[0.8rem] text-slate-700">
              <div className="font-bold text-slate-900">
                گفتگو در واتساپ 📱
              </div>
              <p className="leading-relaxed">
                برای ارسال عکس محل نصب، لوکیشن یا وویس، روی دکمه زیر بزنید تا
                چت واتساپ با واحد فروش و پشتیبانی کانکس نیکان باز شود.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                className="cnx-chat-wa-btn"
              >
                شروع چت واتساپ
              </a>
              <p className="text-[0.7rem] text-slate-500">
                اگر واتساپ روی دستگاه‌تان نصب نباشد، واتساپ وب باز می‌شود.
              </p>
            </div>
          </div>
        )}

        {activeTab === "telegram" && (
          <div className="cnx-chat-body cnx-chat-alt">
            <div className="space-y-3 text-[0.8rem] text-slate-700">
              <div className="font-bold text-slate-900">
                گفتگو در تلگرام ✈️
              </div>
              <p className="leading-relaxed">
                اگر ترجیح می‌دهید از تلگرام استفاده کنید، از طریق لینک زیر با
                پشتیبانی در ارتباط باشید یا عضو کانال اطلاع‌رسانی شوید.
              </p>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                className="cnx-chat-tg-btn"
              >
                باز کردن تلگرام
              </a>
              <p className="text-[0.7rem] text-slate-500">
                در صورت مسدود بودن تلگرام در اینترنت شما، اتصال نیاز به فیلترشکن
                خواهد داشت.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
