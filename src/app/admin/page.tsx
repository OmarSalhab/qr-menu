"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }
  return (
    <main className="min-h-screen flex items-center justify-center rtl px-6" dir="rtl">
      <div className="card p-6 rounded-[16px] elevate-md text-center">
        <h1 className="text-2xl font-extrabold mb-2">هذه صفحة الإدارة</h1>
        <p className="text-[var(--muted)] mb-4">تم تسجيل الدخول بنجاح</p>
        <button onClick={logout} className="btn h-11 rounded-[10px]">تسجيل الخروج</button>
      </div>
    </main>
  );
}
