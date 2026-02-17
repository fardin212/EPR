"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { usePathname } from "next/navigation";

type Role = "USER" | "ADMIN" | "SYSTEM";

type Msg = {
  id: string | number;
  role: Role;
  content: string;
  createdAt: string;
};

type Profile = {
  fullName: string;
  phone: string;
};

type ServerEvt = {
  type: "message";
  role: "USER" | "ADMIN";
  content: string;
  createdAt: string;
  clientId?: string;
};

type ChatChannels = {
  whatsapp?: string;
  telegram?: string;
  call?: string; // tel: لینک تماس
};

type ChannelTab = "CHAT" | "WHATSAPP" | "CALL";

const CHAT_SESSIONS_API = "/api/chat/sessions";
const CHAT_MESSAGES_API = "/api/chat/messages";
const LS_SESSION_KEY = "conex_chat_session_id";
const LS_PROFILE_KEY = "conex_chat_profile";

export default function SupportChatWidget() {
  const pathname = usePathname();

  // ❌ روی صفحات ادمین اصلاً ویجت رو رندر نکن
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const [open, setOpen] = useState(false);

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [items, setItems] = useState<Msg[]>([]);

  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    phone: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [channels, setChannels] = useState<ChatChannels>({});
  const [activeTab, setActiveTab] = useState<ChannelTab>("CHAT");

  const endRef = useRef<HTMLDivElement | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const ownCidsRef = useRef<Set<string>>(new Set());

  // اسکرول به انتهای چت وقتی باز است
  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items, open]);

  // روی mount: پروفایل + سشن قبلی را از localStorage بخوان
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawProfile = localStorage.getItem(LS_PROFILE_KEY);
      if (rawProfile) {
        const p = JSON.parse(rawProfile) as Profile;
        if (p?.fullName && p?.phone) {
          setProfile(p);
          setProfileSaved(true);
        }
      }
    } catch {
      // ignore
    }

    const storedSession = localStorage.getItem(LS_SESSION_KEY);
    const id = storedSession ? Number(storedSession) : NaN;
    if (!Number.isFinite(id)) return;

    setSessionId(id);
  }, []);

  // لود شماره‌ها از تنظیمات عمومی
  useEffect(() => {
    let cancelled = false;

    async function loadChannels() {
      try {
        const res = await fetch("/api/settings/public?scope=chat", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (!data) return;

        const next: ChatChannels = {};

        const rawWa =
          data.whatsappNumber ?? data.whatsapp ?? data.whatsapp_phone;
        if (rawWa) {
          const phone = String(rawWa).replace(/\D/g, "");
          if (phone) next.whatsapp = `https://wa.me/${phone}`;
        }

        const rawTel =
          data.telegramUsername ?? data.telegram ?? data.telegram_handle;
        if (rawTel) {
          const handle = String(rawTel).replace(/^@/, "");
          if (handle) next.telegram = `https://t.me/${handle}`;
        }

        const rawCall =
          data.supportPhone ??
          data.phone ??
          data.phoneNumber ??
          data.callNumber ??
          data.call_phone;
        if (rawCall) {
          const callPhone = String(rawCall).replace(/\D/g, "");
          if (callPhone) next.call = `tel:${callPhone}`;
        }

        if (!cancelled) setChannels(next);
      } catch (e) {
        console.error("CHAT_CHANNELS_LOAD_ERROR", e);
      }
    }

    loadChannels();

    return () => {
      cancelled = true;
    };
  }, []);

  // وقتی sessionId داریم: تاریخچه پیام‌ها را بگیر
  useEffect(() => {
    if (!sessionId) return;

    (async () => {
      try {
        const res = await fetch(`${CHAT_MESSAGES_API}?sessionId=${sessionId}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.messages) {
          setItems(
            (json.messages as any[]).map((m) => ({
              id: m.id,
              role: (m.role || "USER") as Role,
              content: String(m.content ?? ""),
              createdAt:
                typeof m.createdAt === "string"
                  ? m.createdAt
                  : new Date(m.createdAt).toISOString(),
            }))
          );
        }
      } catch {
        // ignore
      }
    })();
  }, [sessionId]);

  // SSE برای دریافت پیام‌های جدید
  useEffect(() => {
    if (!sessionId) return;
    if (esRef.current) return;

    const es = new EventSource(`/api/chat/stream/${sessionId}`);
    esRef.current = es;

    es.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(
          (event as MessageEvent).data
        ) as ServerEvt | null;
        if (!data || data.type !== "message") return;

        // اگر خودمان این پیام را فرستاده‌ایم، دوباره اضافه نکن
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
      } catch {
        // ignore
      }
    });

    es.onerror = () => {
      // فعلاً ساکت
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [sessionId]);

  // ESC برای بستن پنل
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onEsc as any);
    return () => document.removeEventListener("keydown", onEsc as any);
  }, [open]);

  // ذخیره پروفایل و ساخت/لود سشن
  async function saveProfileAndOpenChat() {
    const fullName = profile.fullName.trim();
    const phone = profile.phone.trim();

    if (!fullName || !phone) {
      alert("لطفاً نام و نام خانوادگی و شماره تماس را کامل وارد کنید.");
      return;
    }

    setSavingProfile(true);
    try {
      let existingId = sessionId;

      if (!existingId) {
        const res = await fetch(CHAT_SESSIONS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "ONLINE",
            name: fullName,
            phone,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "SESSION_CREATE_FAILED");
        }
        const id = Number(json.id ?? json.sessionId);
        if (!Number.isFinite(id)) {
          throw new Error("INVALID_SESSION_ID");
        }
        existingId = id;
        setSessionId(id);
        if (typeof window !== "undefined") {
          localStorage.setItem(LS_SESSION_KEY, String(id));
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(
          LS_PROFILE_KEY,
          JSON.stringify({ fullName, phone })
        );
      }
      setProfileSaved(true);
      setOpen(true);
    } catch (e) {
      console.error("PROFILE/SSESSION_ERROR", e);
      alert("در ذخیره اطلاعات چت مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSavingProfile(false);
    }
  }

  // ارسال پیام
  async function send() {
    const t = text.trim();
    if (!t || loading) return;

    if (activeTab !== "CHAT") return;

    if (!profileSaved) {
      await saveProfileAndOpenChat();
      if (!sessionId && !localStorage.getItem(LS_SESSION_KEY)) {
        return;
      }
    }

    const idFromLs =
      sessionId ||
      Number(
        typeof window !== "undefined"
          ? localStorage.getItem(LS_SESSION_KEY)
          : ""
      );
    if (!Number.isFinite(idFromLs)) {
      alert("سشن چت پیدا نشد. لطفاً یک بار صفحه را رفرش کنید.");
      return;
    }

    const sid = Number(idFromLs);
    setSessionId(sid);

    const clientId =
      (globalThis.crypto as any)?.randomUUID?.() ||
      `${Date.now()}_${Math.random()}`;
    ownCidsRef.current.add(clientId);
    setTimeout(() => ownCidsRef.current.delete(clientId), 60_000);

    const optimistic: Msg = {
      id: `tmp_${Date.now()}`,
      role: "USER",
      content: t,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [...prev, optimistic]);
    setText("");
    setLoading(true);

    try {
      const res = await fetch(CHAT_MESSAGES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          text: t,
          role: "USER",
          clientId,
          name: profile.fullName,
          phone: profile.phone,
          source: "ONLINE",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "SEND_FAILED");
      }

      if (json.message) {
        setItems((prev) =>
          prev.map((m) =>
            m.id === optimistic.id
              ? {
                  id: json.message.id,
                  role: json.message.role,
                  content: json.message.content,
                  createdAt: json.message.createdAt,
                }
              : m
          )
        );
      }
    } catch (e) {
      console.error("SEND_ERROR", e);
      setItems((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(t);
      alert("ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const canSend = !!text.trim() && !loading;

  function tabBtnClasses(tab: ChannelTab, disabled?: boolean) {
    const isActive = activeTab === tab;
    return [
      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.7rem] font-bold transition",
      disabled ? "opacity-40" : "",
      "cursor-pointer hover:bg-white/20",
      isActive ? "bg-white/20 shadow-sm" : "bg-white/5",
    ].join(" ");
  }

  return (
    // ⬇️ کانتینر اصلی pointer-events-none؛ فقط خود دکمه/پنل کلیک‌پذیرند
    <div className="fixed bottom-5 right-5 z-[60] font-sans pointer-events-none">
      {/* دکمه شناور */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-full shadow-xl border border-slate-200 bg-white/90 text-slate-900 text-xs font-bold hover:bg-white transition animate-bounce"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-l from-sky-500 via-indigo-500 to-fuchsia-500 text-white grid place-items-center text-lg relative overflow-hidden">
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
          💬
        </div>
        <span className="hidden sm:inline text-[0.75rem]">
          چت با پشتیبانی نیکان
        </span>
      </button>

      {/* پنل چت */}
      <div
        className={`pointer-events-${
          open ? "auto" : "none"
        } mt-3 w-[360px] max-w-[90vw] rounded-3xl border border-slate-200 bg-white/95 shadow-2xl overflow-hidden transition-all ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {/* Header */}
        <div className="px-4 pt-3 pb-2 bg-gradient-to-l from-sky-500 via-indigo-500 to-fuchsia-500 text-white flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/40 grid place-items-center text-[0.7rem] font-black">
                NK
              </div>
              <div className="space-y-0.5">
                <div className="text-[0.8rem] font-extrabold">
                  پشتیبانی کانکس نیکان
                </div>
                <div className="flex items-center gap-1 text-[0.7rem] text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  آنلاین هستیم
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* تب‌ها */}
          <div className="mt-2 flex items-center justify-between gap-2 text-[0.7rem]">
            <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("CHAT")}
                className={tabBtnClasses("CHAT")}
              >
                <span>💬</span>
                <span>چت آنلاین</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("WHATSAPP")}
                className={tabBtnClasses("WHATSAPP", !channels.whatsapp)}
              >
                <span>🟢</span>
                <span>واتساپ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("CALL")}
                className={tabBtnClasses("CALL", !channels.call)}
              >
                <span>📞</span>
                <span>تماس فوری</span>
              </button>
            </div>
          </div>
        </div>

        {/* تب چت آنلاین */}
        {activeTab === "CHAT" && (
          <>
            {!profileSaved ? (
              <div className="px-4 py-4 bg-slate-50/80 space-y-3 text-[0.8rem] text-slate-700">
                <div className="font-bold text-slate-900">
                  قبل از شروع چت، اطلاعات تماس را وارد کنید
                </div>
                <p className="leading-relaxed">
                  برای اینکه در صورت نیاز بتوانیم با شما تماس بگیریم، لطفاً نام و
                  نام خانوادگی و شماره تماس خود را ثبت کنید.
                </p>

                <div className="space-y-2">
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[0.8rem] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    placeholder="نام و نام خانوادگی"
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, fullName: e.target.value }))
                    }
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[0.8rem] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    placeholder="شماره تماس (مثلاً 0912...)"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>

                <button
                  onClick={saveProfileAndOpenChat}
                  disabled={savingProfile}
                  className="w-full mt-2 px-4 py-2 rounded-2xl bg-gradient-to-l from-sky-500 via-indigo-500 to-fuchsia-500 text-white text-[0.8rem] font-extrabold shadow hover:brightness-110 disabled:opacity-50"
                >
                  {savingProfile ? "در حال ثبت..." : "شروع چت آنلاین"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col bg-slate-50/80">
                <div className="max-h-[320px] min-h-[200px] overflow-y-auto px-3 py-3 space-y-1.5 bg-slate-50/80">
                  {items.length === 0 && (
                    <div className="text-center text-[0.8rem] text-slate-500 mt-8 leading-relaxed">
                      سلام {profile.fullName.split(" ")[0]} 👋
                      <br />
                      نوع کانکس، متراژ حدودی و شهر پروژه را بنویسید تا سریع
                      راهنمایی کنیم.
                    </div>
                  )}

                  {items.map((m) => {
                    const isUser = m.role === "USER";
                    const isAdmin = m.role === "ADMIN";

                    return (
                      <div
                        key={String(m.id)}
                        className={`flex w-full ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[82%] px-3 py-2 rounded-2xl text-[0.8rem] leading-relaxed shadow-sm border ${
                            isUser
                              ? "bg-gradient-to-l from-indigo-500 via-sky-500 to-blue-500 text-white border-transparent rounded-br-sm"
                              : isAdmin
                              ? "bg-white text-slate-800 border-slate-200 rounded-bl-sm"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <div className="mb-1 text-[0.65rem] opacity-80">
                            {isUser
                              ? "شما"
                              : isAdmin
                              ? "پشتیبانی"
                              : "سیستم"}
                          </div>
                          <div className="whitespace-pre-wrap">
                            {m.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={endRef} />
                </div>

                <div className="px-3 py-3 border-t border-slate-200 bg-white flex flex-col gap-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="پیام خود را بنویسید…"
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 text-[0.8rem] text-slate-800 placeholder-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    rows={2}
                    dir="rtl"
                  />
                  <button
                    onClick={send}
                    disabled={!canSend}
                    className="w-full px-4 py-2 rounded-2xl bg-gradient-to-l from-sky-500 via-indigo-500 to-fuchsia-500 text-white text-[0.8rem] font-extrabold shadow hover:brightness-110 disabled:opacity-50"
                  >
                    {loading ? "در حال ارسال…" : "ارسال پیام"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* تب واتساپ */}
        {activeTab === "WHATSAPP" && (
          <div className="px-4 py-4 bg-slate-50/80 text-[0.8rem] text-slate-700 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="text-xl">🟢</span>
              <span>چت فوری در واتساپ</span>
            </div>
            <p className="leading-relaxed">
              برای گفت‌وگوی سریع در واتساپ روی دکمه زیر بزنید. یکی از کارشناسان
              نیکان در کوتاه‌ترین زمان ممکن پاسخ‌گوی شما خواهد بود.
            </p>

            {channels.whatsapp ? (
              <a
                href={channels.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 text-white text-[0.8rem] font-extrabold shadow hover:brightness-110"
              >
                🟢 شروع چت در واتساپ
              </a>
            ) : (
              <div className="text-[0.75rem] text-red-500 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
                لینک واتساپ هنوز در تنظیمات سایت ثبت نشده است.
              </div>
            )}

            {channels.telegram && (
              <div className="pt-2 border-t border-slate-200/60 text-[0.75rem] flex items-center justify-between">
                <span className="text-slate-600">
                  ترجیح می‌دهید در تلگرام پیام بدهید؟
                </span>
                <a
                  href={channels.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-full bg-sky-500 text-white font-bold hover:brightness-110"
                >
                  ✈️ تلگرام
                </a>
              </div>
            )}
          </div>
        )}

        {/* تب تماس فوری */}
        {activeTab === "CALL" && (
          <div className="px-4 py-4 bg-slate-50/80 text-[0.8rem] text-slate-700 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="text-xl">📞</span>
              <span>تماس فوری با نیکان</span>
            </div>
            <p className="leading-relaxed">
              اگر نیاز دارید همین حالا با کارشناس فروش یا مشاور فنی صحبت کنید،
              می‌توانید از طریق دکمه زیر تماس تلفنی برقرار کنید.
            </p>

            {channels.call ? (
              <a
                href={channels.call}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500 text-white text-[0.8rem] font-extrabold shadow hover:brightness-110"
              >
                📞 تماس فوری
              </a>
            ) : (
              <div className="text-[0.75rem] text-red-500 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
                شماره تماس پشتیبانی هنوز در تنظیمات سایت ثبت نشده است.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
