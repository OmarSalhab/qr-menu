"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "فشل تسجيل الدخول");
      } else {
        router.replace("/admin");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center rtl px-6" dir="rtl">
      <form onSubmit={onSubmit} className="w-full max-w-sm card p-6 elevate-md rounded-[16px]">
        <h1 className="text-2xl font-extrabold mb-4">تسجيل الدخول</h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <label className="block text-sm mb-1">اسم المستخدم</label>
        <input
          className="w-full h-11 rounded-[10px] border border-[var(--border)] px-3 mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <label className="block text-sm mb-1">كلمة المرور</label>
        <input
          type="password"
          className="w-full h-11 rounded-[10px] border border-[var(--border)] px-3 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <button disabled={loading} className="btn w-full h-11 rounded-[10px]">
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </main>
  );
}
