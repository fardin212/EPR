"use client";

import { useEffect, useRef, useState } from "react";

type AdminEvt = {
  kind: "new_user_message";
  sessionId: number;
  preview: string;
  at: string;
  name?: string;
  phone?: string;
};

const SOUND_URL = "/sounds/chat-notif.mp3"; // فایل صدا (در public/sounds)

export default function AdminNotifier() {
  const [toasts, setToasts] = useState<AdminEvt[]>([]);
  const esRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // آماده‌کردن صدای نوتیفیکیشن
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(SOUND_URL);
    audioRef.current = audio;
    // سعی می‌کنیم preload کنیم
    audio.load();
  }, []);

  // اتصال SSE به استریم پیام‌های جدید
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (esRef.current) return;

    const es = new EventSource("/api/admin/livechat/stream");
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as any;
        if (!data) return;

        const kindRaw: string =
          data.kind || data.type || data.event || "new_user_message";
        const kind = kindRaw.toLowerCase();

        if (kind !== "new_user_message") return;

        const evt: AdminEvt = {
          kind: "new_user_message",
          sessionId: Number(data.sessionId ?? data.id),
          preview: String(data.preview ?? data.content ?? ""),
          at:
            typeof data.at === "string"
              ? data.at
              : new Date().toISOString(),
          name: data.name || data.fullName || undefined,
          phone: data.phone || undefined,
        };

        if (!evt.sessionId) return;

        // اضافه‌کردن toast (حداکثر 3 تا)
        setToasts((prev) => {
          const next = [evt, ...prev];
          return next.slice(0, 3);
        });

        // پخش صدا
        if (audioRef.current) {
          audioRef.current
            .play()
            .catch(() => {
              // بعضی مرورگرها بدون تعامل کاربر اجازه پخش نمی‌دهند
            });
        }

        // ارسال event برای Badge سایدبار
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent<AdminEvt>("admin-new-chat-message", {
              detail: evt,
            })
          );
        }

        // حذف خودکار toast بعد از چند ثانیه
        setTimeout(() => {
          setToasts((prev) =>
            prev.filter(
              (t) =>
                !(
                  t.sessionId === evt.sessionId &&
                  t.at === evt.at &&
                  t.preview === evt.preview
                )
            )
          );
        }, 10000);
      } catch (e) {
        console.error("ADMIN_NOTIFIER_PARSE_ERROR", e);
      }
    };

    es.onerror = () => {
      // اگر خطا خورد، بعد از کمی تاخیر دوباره سعی می‌کنیم
      console.warn("ADMIN_NOTIFIER_SSE_ERROR");
      es.close();
      esRef.current = null;
      setTimeout(() => {
        if (!esRef.current) {
          // اجازه بدیم useEffect دوباره ران شود
          esRef.current = null;
        }
      }, 5000);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed left-4 bottom-4 z-[9999] space-y-2">
      {toasts.map((t, i) => (
        <a
          key={`${t.sessionId}_${t.at}_${i}`}
          href={`/admin/chat/${t.sessionId}`}
          className="block w-80 bg-white border border-slate-200 shadow-lg rounded-2xl p-3 hover:bg-slate-50 transition text-right"
        >
          <div className="text-xs text-slate-500 mb-1">
            پیام جدید چت آنلاین
          </div>
          <div className="text-sm font-bold truncate text-slate-900">
            از {t.name || "کاربر"}{" "}
            {t.phone && (
              <span className="text-xs text-slate-500">
                • <span dir="ltr">{t.phone}</span>
              </span>
            )}
          </div>
          <div className="text-xs text-slate-600 mt-1 line-clamp-2">
            {t.preview || "پیام جدید ارسال شد."}
          </div>
        </a>
      ))}
    </div>
  );
}
