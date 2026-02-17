// components/chat/ChatAdmin.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type ChatStatus = "OPEN" | "CLOSED" | "ARCHIVED" | "SPAM";
type ChatStage = "NEW" | "IN_PROGRESS" | "DONE";

type SessionRow = {
  id: number;
  status: ChatStatus;
  stage: ChatStage;
  lastActive: string;
  lastMessage: {
    id: number;
    content: string;
    role: "USER" | "ADMIN" | "SYSTEM";
  } | null;
};

type Msg = {
  id: number;
  content: string;
  role: "USER" | "ADMIN" | "SYSTEM";
  createdAt?: string;
};

function fmtDate(d: string | undefined) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(d));
  } catch {
    return d;
  }
}

function statusLabel(status: ChatStatus) {
  switch (status) {
    case "OPEN":
      return "باز";
    case "CLOSED":
      return "بسته";
    case "ARCHIVED":
      return "آرشیو";
    case "SPAM":
      return "هرزنامه";
  }
}

function stageLabel(stage: ChatStage) {
  switch (stage) {
    case "NEW":
      return "جدید";
    case "IN_PROGRESS":
      return "در حال بررسی";
    case "DONE":
      return "انجام شد";
  }
}

export default function ChatAdmin() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeStatus, setActiveStatus] = useState<ChatStatus>("OPEN");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // اسکرول هوشمند به آخر پیام‌ها
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    if (distanceFromBottom < 80) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, activeId]);

  // لود لیست سشن‌ها
  async function loadSessions(status: ChatStatus = activeStatus) {
    setLoadingSessions(true);
    try {
      const res = await fetch(
        `/api/chat/admin?status=${status}&take=200`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        console.error("ADMIN_SESSIONS_ERROR", json);
        return;
      }
      const items: SessionRow[] = (json.sessions || []).map((s: any) => ({
        id: s.id,
        status: s.status as ChatStatus,
        stage: s.stage as ChatStage,
        lastActive: s.lastActive,
        lastMessage: s.lastMessage
          ? {
              id: s.lastMessage.id,
              content: s.lastMessage.content,
              role: s.lastMessage.role,
            }
          : null,
      }));
      setSessions(items);

      if (items.length > 0) {
        if (!activeId || !items.some((i) => i.id === activeId)) {
          setActiveId(items[0].id);
        }
      } else {
        setActiveId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error("ADMIN_SESSIONS_FETCH_ERROR", e);
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    loadSessions(activeStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  // لود پیام‌های یک سشن
  async function loadMessages(sessionId: number) {
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/chat/messages?sessionId=${sessionId}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        console.error("ADMIN_MESSAGES_ERROR", json);
        setMessages([]);
        return;
      }
      const msgs: Msg[] = (json.messages || []).map((m: any) => ({
        id: m.id,
        content: String(m.content ?? ""),
        role: (m.role || "USER") as Msg["role"],
        createdAt:
          typeof m.createdAt === "string"
            ? m.createdAt
            : new Date(m.createdAt).toISOString(),
      }));
      setMessages(msgs);
    } catch (e) {
      console.error("ADMIN_MESSAGES_FETCH_ERROR", e);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  // تغییر سشن فعال → پیام‌ها + polling
  useEffect(() => {
    if (!activeId) return;

    loadMessages(activeId);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      loadMessages(activeId);
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [activeId]);

  // ارسال پیام مدیر
  async function send() {
    const text = input.trim();
    if (!text || !activeId || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeId,
          text,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        console.error("ADMIN_REPLY_ERROR", json);
        return;
      }

      const createdAt =
        typeof json.createdAt === "string"
          ? json.createdAt
          : new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: text,
          role: "ADMIN",
          createdAt,
        },
      ]);

      setInput("");
      loadSessions(activeStatus);
    } catch (e) {
      console.error("ADMIN_REPLY_EXCEPTION", e);
    } finally {
      setSending(false);
    }
  }

  // تغییر وضعیت/مرحله سشن
  async function updateSessionStatus(opts: {
    status?: ChatStatus;
    stage?: ChatStage;
  }) {
    if (!activeId) return;
    try {
      const res = await fetch("/api/chat/admin/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeId,
          status: opts.status,
          stage: opts.stage,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        console.error("ADMIN_SESSION_PATCH_ERROR", json);
        return;
      }
      await loadSessions(activeStatus);
    } catch (e) {
      console.error("ADMIN_SESSION_PATCH_EXCEPTION", e);
    }
  }

  // حذف سشن
  async function deleteSession() {
    if (!activeId) return;
    const ok = confirm("این گفتگو به صورت نرم حذف می‌شود. مطمئن هستید؟");
    if (!ok) return;
    try {
      const res = await fetch("/api/chat/admin/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        console.error("ADMIN_SESSION_DELETE_ERROR", json);
        return;
      }
      await loadSessions(activeStatus);
    } catch (e) {
      console.error("ADMIN_SESSION_DELETE_EXCEPTION", e);
    }
  }

  const activeSession = sessions.find((s) => s.id === activeId) || null;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Tabs وضعیت کلی */}
      <div className="flex items-center gap-2 mb-1">
        {(["OPEN", "CLOSED", "ARCHIVED", "SPAM"] as ChatStatus[]).map(
          (st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                activeStatus === st
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {statusLabel(st)}
            </button>
          )
        )}
      </div>

      <div className="flex flex-1 gap-4">
        {/* ستون سشن‌ها */}
        <div className="w-72 min-w-[220px] border rounded-2xl bg-white flex flex-col">
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700">
              گفتگوهای {statusLabel(activeStatus)} ({sessions.length})
            </div>
            <button
              onClick={() => loadSessions(activeStatus)}
              className="text-[0.7rem] text-sky-600 hover:text-sky-800"
            >
              بروزرسانی
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingSessions && sessions.length === 0 && (
              <div className="p-3 text-[0.75rem] text-slate-500">
                در حال بارگذاری...
              </div>
            )}
            {!loadingSessions && sessions.length === 0 && (
              <div className="p-3 text-[0.75rem] text-slate-500">
                در این وضعیت، گفتگویی ثبت نشده است.
              </div>
            )}
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`w-full text-right px-3 py-2 border-b text-xs ${
                  activeId === s.id
                    ? "bg-sky-50 border-sky-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">
                    سشن #{s.id}
                  </span>
                  <span className="text-[0.65rem] text-slate-400">
                    {fmtDate(s.lastActive)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className="inline-flex items-center px-2 py-[2px] rounded-full text-[0.6rem] bg-slate-100 text-slate-700"
                    title="مرحله"
                  >
                    {stageLabel(s.stage)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-[2px] rounded-full text-[0.6rem] ${
                      s.status === "OPEN"
                        ? "bg-emerald-100 text-emerald-700"
                        : s.status === "CLOSED"
                        ? "bg-slate-200 text-slate-700"
                        : s.status === "ARCHIVED"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                    title="وضعیت کلی"
                  >
                    {statusLabel(s.status)}
                  </span>
                </div>
                {s.lastMessage && (
                  <div className="mt-1 text-[0.7rem] text-slate-600 line-clamp-2">
                    {s.lastMessage.role === "USER" ? "کاربر:" : "مدیر:"}{" "}
                    {s.lastMessage.content}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ستون پیام‌ها */}
        <div className="flex-1 border rounded-2xl bg-white flex flex-col">
          <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-bold text-slate-700">
                {activeId ? `گفتگو با سشن #${activeId}` : "هیچ سشنی انتخاب نشده"}
              </div>
              {activeSession && (
                <div className="flex items-center gap-2">
                  <span className="text-[0.7rem] text-slate-500">
                    وضعیت: {statusLabel(activeSession.status)}
                  </span>
                  <span className="text-[0.7rem] text-slate-500">
                    مرحله: {stageLabel(activeSession.stage)}
                  </span>
                </div>
              )}
            </div>

            {/* اکشن‌ها */}
            {activeSession && (
              <div className="flex flex-wrap gap-1 justify-end">
                <button
                  onClick={() => updateSessionStatus({ stage: "NEW" })}
                  className="px-2 py-1 rounded-full text-[0.65rem] border border-slate-200 hover:bg-slate-50"
                >
                  جدید
                </button>
                <button
                  onClick={() => updateSessionStatus({ stage: "IN_PROGRESS" })}
                  className="px-2 py-1 rounded-full text-[0.65rem] border border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  در حال بررسی
                </button>
                <button
                  onClick={() => updateSessionStatus({ stage: "DONE" })}
                  className="px-2 py-1 rounded-full text-[0.65rem] border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  انجام شد
                </button>
                <button
                  onClick={() => updateSessionStatus({ status: "CLOSED" })}
                  className="px-2 py-1 rounded-full text-[0.65rem] border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  بستن
                </button>
                <button
                  onClick={() => updateSessionStatus({ status: "ARCHIVED" })}
                  className="px-2 py-1 rounded-full text-[0.65rem] border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  آرشیو
                </button>
                <button
                  onClick={() => updateSessionStatus({ status: "SPAM" })}
                  className="px-2 py-1 rounded-full text-[0.65rem] border border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  هرزنامه
                </button>
                <button
                  onClick={deleteSession}
                  className="px-2 py-1 rounded-full text-[0.65rem] border border-rose-400 text-rose-700 hover:bg-rose-50"
                >
                  حذف
                </button>
              </div>
            )}
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 bg-slate-50"
          >
            {!activeId && (
              <div className="text-[0.8rem] text-slate-500 mt-4">
                لطفاً یک سشن را از ستون سمت راست انتخاب کنید.
              </div>
            )}
            {activeId && messages.length === 0 && !loadingMessages && (
              <div className="text-[0.8rem] text-slate-500 mt-4">
                هنوز پیامی در این گفتگو ثبت نشده است.
              </div>
            )}
            {messages.map((m) => {
              const isUser = m.role === "USER";
              const isAdmin = m.role === "ADMIN";
              return (
                <div
                  key={m.id}
                  className={`flex w-full ${
                    isUser
                      ? "justify-start"
                      : isAdmin
                      ? "justify-end"
                      : "justify-center"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-2xl text-[0.8rem] leading-relaxed shadow-sm border ${
                      isUser
                        ? "bg-white text-slate-800 border-slate-200 rounded-bl-sm"
                        : isAdmin
                        ? "bg-sky-500 text-white border-sky-500 rounded-br-sm"
                        : "bg-slate-200 text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="mb-1 text-[0.65rem] opacity-70">
                      {isUser ? "کاربر" : isAdmin ? "مدیر" : "سیستم"}{" "}
                      {m.createdAt ? "• " + fmtDate(m.createdAt) : null}
                    </div>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ارسال پیام مدیر */}
          <div className="px-3 py-2 border-t flex items-center gap-2">
            <input
              className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 ring-sky-400/60"
              placeholder="پیام مدیر…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={!input.trim() || !activeId || sending}
              className="px-3 py-2 text-sm rounded-xl bg-sky-500 text-white disabled:opacity-50"
            >
              ارسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
