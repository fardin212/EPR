// app/login/page.tsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@local");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در ورود");
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 24,
          borderRadius: 16,
          background: "rgba(15,23,42,0.9)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: 24, marginBottom: 8, textAlign: "center" }}>
          ERP کانکس نیکان
        </h1>
        <p
          style={{
            fontSize: 14,
            marginBottom: 20,
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          ورود به پنل مدیریت کارگاه
        </p>

        <form onSubmit={handleLogin}>
          <label style={{ fontSize: 14 }}>ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              margin: "4px 0 12px",
              borderRadius: 8,
              border: "1px solid #4b5563",
              background: "#020617",
              color: "#e5e7eb",
            }}
          />

          <label style={{ fontSize: 14 }}>رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              margin: "4px 0 12px",
              borderRadius: 8,
              border: "1px solid #4b5563",
              background: "#020617",
              color: "#e5e7eb",
            }}
          />

          {error && (
            <p style={{ color: "#f97373", fontSize: 13, marginBottom: 8 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 0",
              marginTop: 8,
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background:
                "linear-gradient(135deg, #6366f1, #ec4899, #f97316)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </div>
  );
}
