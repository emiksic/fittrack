"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { COLORS, FONT_DISPLAY } from "@/lib/theme";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: COLORS.inputBg,
  border: `1px solid ${COLORS.inputBorder}`,
  color: COLORS.text,
  padding: "11px 12px",
  borderRadius: 10,
  fontSize: 14,
};

export default function LoginPage() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed.");
      setSubmitting(false);
      return;
    }
    window.location.href = searchParams.get("next") || "/";
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#161616",
        border: `1px solid ${COLORS.inputBorder}`,
        borderRadius: 20,
        padding: 32,
        width: "100%",
        maxWidth: 360,
      }}
    >
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, marginBottom: 6 }}>FitTrack</div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Enter the password to continue.</div>
      <input
        type="password"
        placeholder="Password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      {error && <div style={{ color: COLORS.red, fontSize: 12, marginTop: 10 }}>{error}</div>}
      <button
        type="submit"
        disabled={submitting || !password}
        style={{
          width: "100%",
          marginTop: 16,
          textAlign: "center",
          padding: 12,
          borderRadius: 10,
          background: COLORS.accent,
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          cursor: submitting || !password ? "default" : "pointer",
          opacity: submitting || !password ? 0.6 : 1,
        }}
      >
        {submitting ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}
